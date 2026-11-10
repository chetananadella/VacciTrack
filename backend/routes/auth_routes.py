from flask import Blueprint, request
from services.auth_service import register_user, login_user, get_user_profile
from utils.auth_middleware import token_required
from utils.response_helpers import success_response, error_response

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    full_name = data.get('full_name')
    email = data.get('email')
    phone = data.get('phone', '')
    password = data.get('password')
    role = data.get('role', 'Parent')

    if not full_name or not email or not password:
        return error_response("Full name, email, and password are required.", 400)

    if role not in ('Parent', 'HealthcareWorker', 'Admin'):
        role = 'Parent'

    result = register_user(full_name, email, phone, password, role)
    if not result['success']:
        return error_response(result['message'], 400)

    return success_response({
        "token": result['token'],
        "user": result['user']
    }, result['message'], 201)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return error_response("Email and password are required.", 400)

    result = login_user(email, password)
    if not result['success']:
        return error_response(result['message'], 401)

    return success_response({
        "token": result['token'],
        "user": result['user']
    }, result['message'], 200)

@auth_bp.route('/me', methods=['GET'])
@token_required
def me(current_user):
    profile = get_user_profile(current_user['user_id'])
    if not profile:
        return error_response("User not found.", 404)
    return success_response(profile, "User profile retrieved successfully.")

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return success_response(None, "Logout successful.")
