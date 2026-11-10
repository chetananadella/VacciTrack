from flask import Blueprint, request
from database import execute_query
from utils.auth_middleware import token_required, role_required
from utils.response_helpers import success_response, error_response

vaccine_bp = Blueprint('vaccines', __name__, url_prefix='/api/vaccines')

@vaccine_bp.route('', methods=['GET'])
@token_required
def get_vaccines(current_user):
    vaccines = execute_query("SELECT * FROM dbo.Vaccines ORDER BY RecommendedAgeInDays ASC", fetchall=True) or []
    return success_response(vaccines, "Vaccine catalog retrieved successfully.")

@vaccine_bp.route('', methods=['POST'])
@role_required('Admin')
def add_vaccine(current_user):
    data = request.get_json() or {}
    name = data.get('vaccine_name')
    description = data.get('description', '')
    dose = data.get('dose_number', 1)
    age_days = data.get('recommended_age_in_days', 0)
    age_label = data.get('recommended_age_label', '')

    if not name or not age_label:
        return error_response("Vaccine name and recommended age label are required.", 400)

    query = """
    INSERT INTO dbo.Vaccines (VaccineName, Description, DoseNumber, RecommendedAgeInDays, RecommendedAgeLabel)
    VALUES (?, ?, ?, ?, ?)
    """
    execute_query(query, (name, description, dose, age_days, age_label), commit=True)

    new_vaccine = execute_query("SELECT TOP 1 * FROM dbo.Vaccines ORDER BY VaccineID DESC", fetchone=True)
    return success_response(new_vaccine, "New vaccine type added successfully.", 201)

@vaccine_bp.route('/<int:vaccine_id>', methods=['PUT'])
@role_required('Admin')
def update_vaccine(current_user, vaccine_id):
    existing = execute_query("SELECT VaccineID FROM dbo.Vaccines WHERE VaccineID = ?", (vaccine_id,), fetchone=True)
    if not existing:
        return error_response("Vaccine not found.", 404)

    data = request.get_json() or {}
    name = data.get('vaccine_name')
    description = data.get('description', '')
    dose = data.get('dose_number', 1)
    age_days = data.get('recommended_age_in_days', 0)
    age_label = data.get('recommended_age_label', '')

    if not name or not age_label:
        return error_response("Vaccine name and recommended age label are required.", 400)

    query = """
    UPDATE dbo.Vaccines
    SET VaccineName = ?, Description = ?, DoseNumber = ?, RecommendedAgeInDays = ?, RecommendedAgeLabel = ?
    WHERE VaccineID = ?
    """
    execute_query(query, (name, description, dose, age_days, age_label, vaccine_id), commit=True)

    updated = execute_query("SELECT * FROM dbo.Vaccines WHERE VaccineID = ?", (vaccine_id,), fetchone=True)
    return success_response(updated, "Vaccine updated successfully.")
