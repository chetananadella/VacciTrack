from flask import Blueprint
from services.report_service import get_parent_dashboard_data, get_healthcare_dashboard_data, get_admin_dashboard_data
from utils.auth_middleware import token_required, role_required
from utils.response_helpers import success_response, error_response

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/parent', methods=['GET'])
@role_required('Parent')
def parent_dashboard(current_user):
    data = get_parent_dashboard_data(current_user['user_id'])
    return success_response(data, "Parent dashboard statistics fetched successfully.")

@dashboard_bp.route('/healthcare', methods=['GET'])
@role_required('HealthcareWorker', 'Admin')
def healthcare_dashboard(current_user):
    data = get_healthcare_dashboard_data()
    return success_response(data, "Healthcare worker dashboard statistics fetched successfully.")

@dashboard_bp.route('/admin', methods=['GET'])
@role_required('Admin')
def admin_dashboard(current_user):
    data = get_admin_dashboard_data()
    return success_response(data, "Admin dashboard analytics fetched successfully.")
