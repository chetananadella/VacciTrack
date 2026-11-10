import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request
from config import Config
from utils.response_helpers import error_response

def generate_token(user_id, email, role, full_name):
    """
    Generate JWT authentication token.
    """
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'full_name': full_name,
        'exp': datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')

def token_required(f):
    """
    Decorator to protect API endpoints and decode JWT token.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header:
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            else:
                token = auth_header

        if not token:
            return error_response("Authentication token is missing", 401)

        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
            current_user = {
                'user_id': payload['user_id'],
                'email': payload['email'],
                'role': payload['role'],
                'full_name': payload['full_name']
            }
        except jwt.ExpiredSignatureError:
            return error_response("Token has expired. Please log in again.", 401)
        except jwt.InvalidTokenError:
            return error_response("Invalid authentication token.", 401)

        return f(current_user, *args, **kwargs)

    return decorated

def role_required(*allowed_roles):
    """
    Decorator to enforce role-based access control (RBAC).
    """
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.get('role') not in allowed_roles:
                return error_response("Unauthorized access for your user role.", 403)
            return f(current_user, *args, **kwargs)
        return token_required(decorated)
    return decorator
