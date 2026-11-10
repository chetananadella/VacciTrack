from flask import Blueprint
from services.report_service import get_admin_dashboard_data
from utils.auth_middleware import role_required
from utils.response_helpers import success_response

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@reports_bp.route('/analytics', methods=['GET'])
@role_required('Admin', 'HealthcareWorker')
def get_analytics_report(current_user):
    data = get_admin_dashboard_data()
    return success_response(data, "Analytics report generated successfully.")
