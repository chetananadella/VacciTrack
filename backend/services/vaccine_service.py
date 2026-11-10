from datetime import datetime, timedelta, date
from database import execute_query

def parse_date(date_val) -> date:
    """Normalize any date-like value to a pure datetime.date for safe comparisons."""
    # Check datetime FIRST — datetime is a subclass of date, so the order matters.
    # If we checked `isinstance(date_val, date)` first, datetime objects would
    # slip through un-narrowed and cause datetime > date type errors downstream.
    if isinstance(date_val, datetime):
        return date_val.date()
    if isinstance(date_val, date):
        return date_val
    if isinstance(date_val, str):
        return datetime.strptime(date_val[:10], '%Y-%m-%d').date()
    return date.today()

def auto_schedule_child_vaccines(child_id, date_of_birth):
    """
    Generate vaccination records for a newly added child based on birth date.
    """
    dob = parse_date(date_of_birth)
    today = date.today()

    vaccines = execute_query("SELECT VaccineID, RecommendedAgeInDays FROM dbo.Vaccines", fetchall=True) or []

    for v in vaccines:
        scheduled = dob + timedelta(days=v['RecommendedAgeInDays'])
        
        # Calculate dynamic status based on current date
        if scheduled > today:
            status = 'Upcoming'
        elif scheduled <= today and scheduled >= (today - timedelta(days=14)):
            status = 'Due'
        else:
            status = 'Missed'

        query = """
        INSERT INTO dbo.VaccinationRecords (ChildID, VaccineID, ScheduledDate, Status)
        VALUES (?, ?, ?, ?)
        """
        execute_query(query, (child_id, v['VaccineID'], scheduled.strftime('%Y-%m-%d'), status), commit=True)

def recalculate_record_statuses():
    """
    Recalculate status for all non-completed vaccination records based on today's date.
    """
    today = date.today()
    due_window_start = today - timedelta(days=14)

    # Fetch non-completed records
    records = execute_query("SELECT RecordID, ScheduledDate, Status FROM dbo.VaccinationRecords WHERE Status != 'Completed'", fetchall=True) or []

    for r in records:
        sched = parse_date(r['ScheduledDate'])
        if sched > today:
            new_status = 'Upcoming'
        elif sched <= today and sched >= due_window_start:
            new_status = 'Due'
        else:
            new_status = 'Missed'

        if new_status != r['Status']:
            execute_query("UPDATE dbo.VaccinationRecords SET Status = ? WHERE RecordID = ?", (new_status, r['RecordID']), commit=True)

def get_child_schedule(child_id):
    """
    Get formatted vaccination schedule for a specific child.
    """
    recalculate_record_statuses()

    query = """
    SELECT 
        vr.RecordID,
        vr.ChildID,
        c.ChildName,
        c.DateOfBirth,
        vr.VaccineID,
        v.VaccineName,
        v.Description,
        v.DoseNumber,
        v.RecommendedAgeLabel,
        vr.ScheduledDate,
        vr.VaccinationDate,
        vr.Status,
        vr.Notes,
        u.FullName AS AdministeredBy
    FROM dbo.VaccinationRecords vr
    JOIN dbo.Vaccines v ON vr.VaccineID = v.VaccineID
    JOIN dbo.Children c ON vr.ChildID = c.ChildID
    LEFT JOIN dbo.Users u ON vr.HealthcareWorkerID = u.UserID
    WHERE vr.ChildID = ?
    ORDER BY vr.ScheduledDate ASC
    """
    schedule = execute_query(query, (child_id,), fetchall=True) or []
    return schedule

def update_vaccination_record(record_id, healthcare_worker_id, vaccination_date=None, notes=None, status='Completed'):
    """
    Record or update vaccination details by healthcare worker.
    """
    v_date = vaccination_date or date.today().strftime('%Y-%m-%d')
    
    query = """
    UPDATE dbo.VaccinationRecords
    SET HealthcareWorkerID = ?,
        VaccinationDate = ?,
        Status = ?,
        Notes = ?
    WHERE RecordID = ?
    """
    execute_query(query, (healthcare_worker_id, v_date, status, notes, record_id), commit=True)
    
    # Return updated record
    record = execute_query("SELECT * FROM dbo.VaccinationRecords WHERE RecordID = ?", (record_id,), fetchone=True)
    return record
