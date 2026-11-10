from flask import Blueprint, request
from database import execute_query
from services.vaccine_service import auto_schedule_child_vaccines, recalculate_record_statuses
from utils.auth_middleware import token_required, role_required
from utils.response_helpers import success_response, error_response

children_bp = Blueprint('children', __name__, url_prefix='/api/children')

@children_bp.route('', methods=['GET'])
@token_required
def get_children(current_user):
    recalculate_record_statuses()
    search = request.args.get('search', '').strip()
    role = current_user['role']

    if role == 'Parent':
        query = """
        SELECT c.*, u.FullName AS ParentName, u.Email AS ParentEmail, u.Phone AS ParentPhone
        FROM dbo.Children c
        JOIN dbo.Users u ON c.ParentID = u.UserID
        WHERE c.ParentID = ?
        """
        params = [current_user['user_id']]
        if search:
            query += " AND (LOWER(c.ChildName) LIKE ?)"
            params.append(f"%{search.lower()}%")
        query += " ORDER BY c.CreatedAt DESC"
        children = execute_query(query, tuple(params), fetchall=True) or []
    else: # HealthcareWorker or Admin
        query = """
        SELECT c.*, u.FullName AS ParentName, u.Email AS ParentEmail, u.Phone AS ParentPhone
        FROM dbo.Children c
        JOIN dbo.Users u ON c.ParentID = u.UserID
        """
        params = []
        if search:
            query += " WHERE LOWER(c.ChildName) LIKE ? OR LOWER(u.FullName) LIKE ? OR u.Phone LIKE ?"
            params.extend([f"%{search.lower()}%", f"%{search.lower()}%", f"%{search.lower()}%"])
        query += " ORDER BY c.CreatedAt DESC"
        children = execute_query(query, tuple(params), fetchall=True) or []

    return success_response(children, "Children list fetched successfully.")

@children_bp.route('', methods=['POST'])
@token_required
def add_child(current_user):
    data = request.get_json() or {}
    child_name = data.get('child_name')
    date_of_birth = data.get('date_of_birth')
    gender = data.get('gender')
    blood_group = data.get('blood_group', '')
    address = data.get('address', '')
    
    # If admin or worker specifies parent_id, use that, otherwise default to current parent user_id
    parent_id = data.get('parent_id') if current_user['role'] in ('Admin', 'HealthcareWorker') else current_user['user_id']
    if not parent_id:
        parent_id = current_user['user_id']

    if not child_name or not date_of_birth or not gender:
        return error_response("Child name, date of birth, and gender are required.", 400)

    query = """
    INSERT INTO dbo.Children (ParentID, ChildName, DateOfBirth, Gender, BloodGroup, Address)
    VALUES (?, ?, ?, ?, ?, ?)
    """
    execute_query(query, (parent_id, child_name, date_of_birth, gender, blood_group, address), commit=True)

    # Get newly created child
    new_child = execute_query(
        "SELECT TOP 1 * FROM dbo.Children WHERE ParentID = ? ORDER BY ChildID DESC", 
        (parent_id,), 
        fetchone=True
    )

    if new_child:
        # Auto schedule vaccine calendar
        auto_schedule_child_vaccines(new_child['ChildID'], date_of_birth)

    return success_response(new_child, "Child registered successfully with automated vaccination schedule.", 201)

@children_bp.route('/<int:child_id>', methods=['GET'])
@token_required
def get_child_details(current_user, child_id):
    recalculate_record_statuses()

    child = execute_query("""
    SELECT c.*, u.FullName AS ParentName, u.Email AS ParentEmail, u.Phone AS ParentPhone
    FROM dbo.Children c
    JOIN dbo.Users u ON c.ParentID = u.UserID
    WHERE c.ChildID = ?
    """, (child_id,), fetchone=True)

    if not child:
        return error_response("Child profile not found.", 404)

    # Access control: Parents can only view their own child
    if current_user['role'] == 'Parent' and child['ParentID'] != current_user['user_id']:
        return error_response("Unauthorized to view this child profile.", 403)

    # Vaccination summary stats for child
    stats = execute_query("""
    SELECT 
        COUNT(*) AS total_vaccines,
        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN Status = 'Upcoming' THEN 1 ELSE 0 END) AS upcoming,
        SUM(CASE WHEN Status = 'Due' THEN 1 ELSE 0 END) AS due,
        SUM(CASE WHEN Status = 'Missed' THEN 1 ELSE 0 END) AS missed
    FROM dbo.VaccinationRecords
    WHERE ChildID = ?
    """, (child_id,), fetchone=True) or {}

    child['stats'] = stats
    return success_response(child, "Child details fetched successfully.")

@children_bp.route('/<int:child_id>', methods=['PUT'])
@token_required
def update_child(current_user, child_id):
    child = execute_query("SELECT ParentID FROM dbo.Children WHERE ChildID = ?", (child_id,), fetchone=True)
    if not child:
        return error_response("Child not found.", 404)

    if current_user['role'] == 'Parent' and child['ParentID'] != current_user['user_id']:
        return error_response("Unauthorized to modify this child profile.", 403)

    data = request.get_json() or {}
    child_name = data.get('child_name')
    date_of_birth = data.get('date_of_birth')
    gender = data.get('gender')
    blood_group = data.get('blood_group', '')
    address = data.get('address', '')

    if not child_name or not date_of_birth or not gender:
        return error_response("Child name, date of birth, and gender are required.", 400)

    query = """
    UPDATE dbo.Children
    SET ChildName = ?, DateOfBirth = ?, Gender = ?, BloodGroup = ?, Address = ?
    WHERE ChildID = ?
    """
    execute_query(query, (child_name, date_of_birth, gender, blood_group, address, child_id), commit=True)

    updated_child = execute_query("SELECT * FROM dbo.Children WHERE ChildID = ?", (child_id,), fetchone=True)
    return success_response(updated_child, "Child details updated successfully.")

@children_bp.route('/<int:child_id>', methods=['DELETE'])
@token_required
def delete_child(current_user, child_id):
    child = execute_query("SELECT ParentID FROM dbo.Children WHERE ChildID = ?", (child_id,), fetchone=True)
    if not child:
        return error_response("Child not found.", 404)

    if current_user['role'] == 'Parent' and child['ParentID'] != current_user['user_id']:
        return error_response("Unauthorized to delete this child profile.", 403)

    execute_query("DELETE FROM dbo.Children WHERE ChildID = ?", (child_id,), commit=True)
    return success_response(None, "Child profile deleted successfully.")
