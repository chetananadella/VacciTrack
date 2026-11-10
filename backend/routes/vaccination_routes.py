from flask import Blueprint, request
from database import execute_query
from services.vaccine_service import get_child_schedule, update_vaccination_record, recalculate_record_statuses
from utils.auth_middleware import token_required, role_required
from utils.response_helpers import success_response, error_response

vaccination_bp = Blueprint('vaccinations', __name__, url_prefix='/api/vaccinations')

@vaccination_bp.route('', methods=['GET'])
@token_required
def get_all_records(current_user):
    recalculate_record_statuses()
    child_id = request.args.get('child_id')
    status_filter = request.args.get('status')
    search = request.args.get('search', '').strip()

    query = """
    SELECT 
        vr.RecordID,
        vr.ChildID,
        c.ChildName,
        c.DateOfBirth,
        p.FullName AS ParentName,
        p.Phone AS ParentPhone,
        vr.VaccineID,
        v.VaccineName,
        v.DoseNumber,
        v.RecommendedAgeLabel,
        vr.ScheduledDate,
        vr.VaccinationDate,
        vr.Status,
        vr.Notes,
        u.FullName AS AdministeredBy
    FROM dbo.VaccinationRecords vr
    JOIN dbo.Children c ON vr.ChildID = c.ChildID
    JOIN dbo.Users p ON c.ParentID = p.UserID
    JOIN dbo.Vaccines v ON vr.VaccineID = v.VaccineID
    LEFT JOIN dbo.Users u ON vr.HealthcareWorkerID = u.UserID
    WHERE 1=1
    """
    params = []

    if current_user['role'] == 'Parent':
        query += " AND c.ParentID = ?"
        params.append(current_user['user_id'])

    if child_id:
        query += " AND vr.ChildID = ?"
        params.append(child_id)

    if status_filter:
        if status_filter.lower() == 'overdue':
            query += " AND vr.Status IN ('Due', 'Missed')"
        else:
            query += " AND vr.Status = ?"
            params.append(status_filter)

    if search:
        query += " AND (LOWER(c.ChildName) LIKE ? OR LOWER(v.VaccineName) LIKE ? OR LOWER(p.FullName) LIKE ?)"
        params.extend([f"%{search.lower()}%", f"%{search.lower()}%", f"%{search.lower()}%"])

    query += " ORDER BY vr.ScheduledDate ASC"
    records = execute_query(query, tuple(params), fetchall=True) or []

    return success_response(records, "Vaccination records retrieved successfully.")

@vaccination_bp.route('/child/<int:child_id>', methods=['GET'])
@token_required
def get_schedule_for_child(current_user, child_id):
    # Parents can only view their own child's schedule
    if current_user['role'] == 'Parent':
        child = execute_query("SELECT ParentID FROM dbo.Children WHERE ChildID = ?", (child_id,), fetchone=True)
        if not child or child['ParentID'] != current_user['user_id']:
            return error_response("Unauthorized to view this schedule.", 403)

    schedule = get_child_schedule(child_id)
    return success_response(schedule, "Child vaccination schedule retrieved.")

@vaccination_bp.route('/record', methods=['POST'])
@role_required('HealthcareWorker', 'Admin')
def record_vaccination(current_user):
    data = request.get_json() or {}
    record_id = data.get('record_id')
    vaccination_date = data.get('vaccination_date')
    notes = data.get('notes', '')
    status = data.get('status', 'Completed')

    if not record_id:
        return error_response("Record ID is required.", 400)

    existing = execute_query("SELECT RecordID FROM dbo.VaccinationRecords WHERE RecordID = ?", (record_id,), fetchone=True)
    if not existing:
        return error_response("Vaccination record not found.", 404)

    updated_record = update_vaccination_record(
        record_id=record_id,
        healthcare_worker_id=current_user['user_id'],
        vaccination_date=vaccination_date,
        notes=notes,
        status=status
    )

    return success_response(updated_record, "Vaccination successfully recorded.")

@vaccination_bp.route('/<int:record_id>', methods=['PUT'])
@role_required('HealthcareWorker', 'Admin')
def update_record(current_user, record_id):
    data = request.get_json() or {}
    vaccination_date = data.get('vaccination_date')
    notes = data.get('notes', '')
    status = data.get('status', 'Completed')

    updated = update_vaccination_record(
        record_id=record_id,
        healthcare_worker_id=current_user['user_id'],
        vaccination_date=vaccination_date,
        notes=notes,
        status=status
    )
    return success_response(updated, "Vaccination record updated successfully.")
