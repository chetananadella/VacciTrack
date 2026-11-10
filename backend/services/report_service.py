from database import execute_query
from services.vaccine_service import recalculate_record_statuses

def get_parent_dashboard_data(parent_id):
    """
    Get aggregated dashboard stats and recent history for a Parent.
    """
    recalculate_record_statuses()

    children = execute_query("SELECT ChildID, ChildName, DateOfBirth, Gender FROM dbo.Children WHERE ParentID = ?", (parent_id,), fetchall=True) or []
    child_ids = [c['ChildID'] for c in children]

    if not child_ids:
        return {
            "total_children": 0,
            "completed_vaccines": 0,
            "upcoming_vaccines": 0,
            "overdue_vaccines": 0,
            "next_vaccination": None,
            "recent_history": [],
            "children": []
        }

    # Format IN clause parameters safely
    placeholders = ','.join(['?'] * len(child_ids))

    stats_query = f"""
    SELECT 
        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN Status = 'Upcoming' THEN 1 ELSE 0 END) AS upcoming,
        SUM(CASE WHEN Status IN ('Due', 'Missed') THEN 1 ELSE 0 END) AS overdue
    FROM dbo.VaccinationRecords
    WHERE ChildID IN ({placeholders})
    """
    stats = execute_query(stats_query, tuple(child_ids), fetchone=True) or {}

    next_query = f"""
    SELECT TOP 1 
        vr.RecordID,
        c.ChildName,
        v.VaccineName,
        v.DoseNumber,
        vr.ScheduledDate,
        vr.Status
    FROM dbo.VaccinationRecords vr
    JOIN dbo.Children c ON vr.ChildID = c.ChildID
    JOIN dbo.Vaccines v ON vr.VaccineID = v.VaccineID
    WHERE vr.ChildID IN ({placeholders}) AND vr.Status IN ('Upcoming', 'Due')
    ORDER BY vr.ScheduledDate ASC
    """
    next_vaccine = execute_query(next_query, tuple(child_ids), fetchone=True)

    recent_query = f"""
    SELECT TOP 5 
        vr.RecordID,
        c.ChildName,
        v.VaccineName,
        vr.VaccinationDate,
        vr.ScheduledDate,
        vr.Status,
        u.FullName as DoctorName
    FROM dbo.VaccinationRecords vr
    JOIN dbo.Children c ON vr.ChildID = c.ChildID
    JOIN dbo.Vaccines v ON vr.VaccineID = v.VaccineID
    LEFT JOIN dbo.Users u ON vr.HealthcareWorkerID = u.UserID
    WHERE vr.ChildID IN ({placeholders})
    ORDER BY vr.CreatedAt DESC
    """
    recent_history = execute_query(recent_query, tuple(child_ids), fetchall=True) or []

    return {
        "total_children": len(children),
        "completed_vaccines": stats.get('completed') or 0,
        "upcoming_vaccines": stats.get('upcoming') or 0,
        "overdue_vaccines": stats.get('overdue') or 0,
        "next_vaccination": next_vaccine,
        "recent_history": recent_history,
        "children": children
    }

def get_healthcare_dashboard_data():
    """
    Get aggregated dashboard stats for Healthcare Worker.
    """
    recalculate_record_statuses()

    total_children = execute_query("SELECT COUNT(*) AS cnt FROM dbo.Children", fetchone=True).get('cnt', 0)
    
    records_stats = execute_query("""
    SELECT 
        COUNT(*) AS total_records,
        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN Status = 'Due' THEN 1 ELSE 0 END) AS due_today,
        SUM(CASE WHEN Status = 'Upcoming' THEN 1 ELSE 0 END) AS upcoming,
        SUM(CASE WHEN Status = 'Missed' THEN 1 ELSE 0 END) AS overdue
    FROM dbo.VaccinationRecords
    """, fetchone=True) or {}

    due_list = execute_query("""
    SELECT TOP 10 
        vr.RecordID,
        c.ChildID,
        c.ChildName,
        c.Gender,
        c.DateOfBirth,
        p.FullName AS ParentName,
        p.Phone AS ParentPhone,
        v.VaccineName,
        v.DoseNumber,
        vr.ScheduledDate,
        vr.Status
    FROM dbo.VaccinationRecords vr
    JOIN dbo.Children c ON vr.ChildID = c.ChildID
    JOIN dbo.Users p ON c.ParentID = p.UserID
    JOIN dbo.Vaccines v ON vr.VaccineID = v.VaccineID
    WHERE vr.Status IN ('Due', 'Missed')
    ORDER BY vr.ScheduledDate ASC
    """, fetchall=True) or []

    return {
        "total_children": total_children,
        "completed_vaccinations": records_stats.get('completed') or 0,
        "due_today": records_stats.get('due_today') or 0,
        "upcoming_vaccinations": records_stats.get('upcoming') or 0,
        "overdue_vaccinations": records_stats.get('overdue') or 0,
        "action_required_children": due_list
    }

def get_admin_dashboard_data():
    """
    Get complete analytics, stats, and charts data for Admin dashboard.
    """
    recalculate_record_statuses()

    user_counts = execute_query("""
    SELECT 
        SUM(CASE WHEN Role = 'Parent' THEN 1 ELSE 0 END) AS parents_count,
        SUM(CASE WHEN Role = 'HealthcareWorker' THEN 1 ELSE 0 END) AS workers_count,
        COUNT(*) AS total_users
    FROM dbo.Users
    """, fetchone=True) or {}

    total_children = execute_query("SELECT COUNT(*) AS cnt FROM dbo.Children", fetchone=True).get('cnt', 0)

    vaccine_counts = execute_query("""
    SELECT 
        COUNT(*) AS total_records,
        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN Status = 'Upcoming' THEN 1 ELSE 0 END) AS upcoming,
        SUM(CASE WHEN Status = 'Due' THEN 1 ELSE 0 END) AS due,
        SUM(CASE WHEN Status = 'Missed' THEN 1 ELSE 0 END) AS missed
    FROM dbo.VaccinationRecords
    """, fetchone=True) or {}

    # Status distribution for Pie Chart
    status_distribution = [
        {"name": "Completed", "value": vaccine_counts.get('completed') or 0, "color": "#10b981"},
        {"name": "Upcoming", "value": vaccine_counts.get('upcoming') or 0, "color": "#3b82f6"},
        {"name": "Due", "value": vaccine_counts.get('due') or 0, "color": "#f59e0b"},
        {"name": "Overdue / Missed", "value": vaccine_counts.get('missed') or 0, "color": "#ef4444"}
    ]

    # Vaccine coverage statistics (by vaccine name)
    vaccine_coverage = execute_query("""
    SELECT 
        v.VaccineName,
        COUNT(vr.RecordID) AS TotalAssigned,
        SUM(CASE WHEN vr.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedCount,
        SUM(CASE WHEN vr.Status IN ('Due', 'Missed') THEN 1 ELSE 0 END) AS OverdueCount
    FROM dbo.Vaccines v
    LEFT JOIN dbo.VaccinationRecords vr ON v.VaccineID = vr.VaccineID
    GROUP BY v.VaccineID, v.VaccineName
    ORDER BY v.VaccineID ASC
    """, fetchall=True) or []

    # Recent Records
    recent_activity = execute_query("""
    SELECT TOP 8 
        vr.RecordID,
        c.ChildName,
        p.FullName AS ParentName,
        v.VaccineName,
        vr.Status,
        vr.ScheduledDate,
        vr.VaccinationDate
    FROM dbo.VaccinationRecords vr
    JOIN dbo.Children c ON vr.ChildID = c.ChildID
    JOIN dbo.Users p ON c.ParentID = p.UserID
    JOIN dbo.Vaccines v ON vr.VaccineID = v.VaccineID
    ORDER BY vr.CreatedAt DESC
    """, fetchall=True) or []

    return {
        "cards": {
            "total_children": total_children,
            "total_vaccinations": vaccine_counts.get('total_records') or 0,
            "completed": vaccine_counts.get('completed') or 0,
            "upcoming": vaccine_counts.get('upcoming') or 0,
            "overdue": vaccine_counts.get('missed') or 0,
            "due": vaccine_counts.get('due') or 0,
            "parents": user_counts.get('parents_count') or 0,
            "healthcare_workers": user_counts.get('workers_count') or 0
        },
        "status_distribution": status_distribution,
        "vaccine_coverage": vaccine_coverage,
        "recent_activity": recent_activity
    }
