from flask import Blueprint, request
from werkzeug.security import generate_password_hash
from database import execute_query
from utils.auth_middleware import role_required
from utils.response_helpers import success_response, error_response

user_bp = Blueprint('users', __name__, url_prefix='/api/users')

@user_bp.route('', methods=['GET'])
@role_required('Admin')
def get_users(current_user):
    role_filter = request.args.get('role')
    search = request.args.get('search', '').strip()

    query = "SELECT UserID, FullName, Email, Phone, Role, CreatedAt FROM dbo.Users WHERE 1=1"
    params = []

    if role_filter:
        query += " AND Role = ?"
        params.append(role_filter)

    if search:
        query += " AND (LOWER(FullName) LIKE ? OR LOWER(Email) LIKE ? OR Phone LIKE ?)"
        params.extend([f"%{search.lower()}%", f"%{search.lower()}%", f"%{search.lower()}%"])

    query += " ORDER BY UserID DESC"
    users = execute_query(query, tuple(params), fetchall=True) or []

    return success_response(users, "Users retrieved successfully.")

@user_bp.route('', methods=['POST'])
@role_required('Admin')
def create_user(current_user):
    data = request.get_json() or {}
    full_name = data.get('full_name')
    email = data.get('email')
    phone = data.get('phone', '')
    password = data.get('password')
    role = data.get('role', 'Parent')

    if not full_name or not email or not password:
        return error_response("Full name, email, and password are required.", 400)

    email_clean = email.strip().lower()
    existing = execute_query("SELECT UserID FROM dbo.Users WHERE LOWER(Email) = ?", (email_clean,), fetchone=True)
    if existing:
        return error_response("User with this email already exists.", 400)

    password_hash = generate_password_hash(password)
    query = """
    INSERT INTO dbo.Users (FullName, Email, Phone, PasswordHash, Role)
    VALUES (?, ?, ?, ?, ?)
    """
    execute_query(query, (full_name, email_clean, phone, password_hash, role), commit=True)

    new_user = execute_query("SELECT UserID, FullName, Email, Phone, Role, CreatedAt FROM dbo.Users WHERE LOWER(Email) = ?", (email_clean,), fetchone=True)
    return success_response(new_user, "User created successfully.", 201)

@user_bp.route('/<int:user_id>', methods=['PUT'])
@role_required('Admin')
def update_user(current_user, user_id):
    existing = execute_query("SELECT UserID FROM dbo.Users WHERE UserID = ?", (user_id,), fetchone=True)
    if not existing:
        return error_response("User not found.", 404)

    data = request.get_json() or {}
    full_name = data.get('full_name')
    phone = data.get('phone', '')
    role = data.get('role')

    if not full_name or not role:
        return error_response("Full name and role are required.", 400)

    query = "UPDATE dbo.Users SET FullName = ?, Phone = ?, Role = ? WHERE UserID = ?"
    execute_query(query, (full_name, phone, role, user_id), commit=True)

    updated = execute_query("SELECT UserID, FullName, Email, Phone, Role, CreatedAt FROM dbo.Users WHERE UserID = ?", (user_id,), fetchone=True)
    return success_response(updated, "User updated successfully.")
