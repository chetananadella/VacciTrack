from datetime import date
from database import execute_query

def sync_reminders():
    """
    Auto-generate reminders for Due and Missed vaccinations if not existing.
    """
    query = """
    SELECT 
        vr.RecordID,
        vr.ChildID,
        c.ChildName,
        vr.VaccineID,
        v.VaccineName,
        vr.ScheduledDate,
        vr.Status
    FROM dbo.VaccinationRecords vr
    JOIN dbo.Children c ON vr.ChildID = c.ChildID
    JOIN dbo.Vaccines v ON vr.VaccineID = v.VaccineID
    WHERE vr.Status IN ('Due', 'Missed')
    """
    records = execute_query(query, fetchall=True) or []
    
    for r in records:
        # Check if reminder exists for child and vaccine
        existing = execute_query(
            "SELECT ReminderID FROM dbo.Reminders WHERE ChildID = ? AND VaccineID = ?", 
            (r['ChildID'], r['VaccineID']), 
            fetchone=True
        )

        if not existing:
            if r['Status'] == 'Due':
                msg = f"Reminder: {r['ChildName']}'s {r['VaccineName']} vaccination is due on {r['ScheduledDate']}."
            else: # Missed
                msg = f"OVERDUE NOTICE: {r['ChildName']}'s {r['VaccineName']} vaccination scheduled for {r['ScheduledDate']} was missed. Please contact clinic."

            insert_query = """
            INSERT INTO dbo.Reminders (ChildID, VaccineID, ReminderDate, Message, Status)
            VALUES (?, ?, ?, ?, 'Unread')
            """
            execute_query(insert_query, (r['ChildID'], r['VaccineID'], str(r['ScheduledDate']), msg), commit=True)

def get_reminders_for_parent(parent_id):
    """
    Get all reminders for a parent's children.
    """
    sync_reminders()

    query = """
    SELECT 
        r.ReminderID,
        r.ChildID,
        c.ChildName,
        r.VaccineID,
        v.VaccineName,
        r.ReminderDate,
        r.Message,
        r.Status,
        r.CreatedAt
    FROM dbo.Reminders r
    JOIN dbo.Children c ON r.ChildID = c.ChildID
    JOIN dbo.Vaccines v ON r.VaccineID = v.VaccineID
    WHERE c.ParentID = ?
    ORDER BY r.CreatedAt DESC
    """
    reminders = execute_query(query, (parent_id,), fetchall=True) or []
    return reminders

def mark_reminder_read(reminder_id):
    """
    Mark a reminder as read.
    """
    execute_query("UPDATE dbo.Reminders SET Status = 'Read' WHERE ReminderID = ?", (reminder_id,), commit=True)
    return True
