from flask import Blueprint
from services.reminder_service import get_reminders_for_parent, mark_reminder_read
from utils.auth_middleware import token_required
from utils.response_helpers import success_response, error_response

reminder_bp = Blueprint('reminders', __name__, url_prefix='/api/reminders')

@reminder_bp.route('', methods=['GET'])
@token_required
def get_reminders(current_user):
    if current_user['role'] == 'Parent':
        reminders = get_reminders_for_parent(current_user['user_id'])
    else:
        # For Healthcare Workers / Admin: return all active unread/due reminders
        from database import execute_query
        reminders = execute_query("""
        SELECT 
            r.ReminderID,
            r.ChildID,
            c.ChildName,
            r.VaccineID,
            v.VaccineName,
            r.ReminderDate,
            r.Message,
            r.Status,
            r.CreatedAt,
            p.FullName AS ParentName,
            p.Phone AS ParentPhone
        FROM dbo.Reminders r
        JOIN dbo.Children c ON r.ChildID = c.ChildID
        JOIN dbo.Users p ON c.ParentID = p.UserID
        JOIN dbo.Vaccines v ON r.VaccineID = v.VaccineID
        ORDER BY r.CreatedAt DESC
        """, fetchall=True) or []

    return success_response(reminders, "Reminders retrieved successfully.")

@reminder_bp.route('/<int:reminder_id>/read', methods=['PUT'])
@token_required
def read_reminder(current_user, reminder_id):
    mark_reminder_read(reminder_id)
    return success_response(None, "Reminder marked as read.")
