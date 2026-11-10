# VaccTrack Database Setup (Microsoft SQL Server)

This directory contains the database definition files for **VaccTrack - A Smart Child Vaccination Management System**.

## Files Overview
- `schema.sql`: Contains the DDL to create database `VaccTrackDB` and tables (`Users`, `Children`, `Vaccines`, `VaccinationRecords`, `Reminders`).
- `seed.sql`: Contains realistic sample records for Parents, Healthcare Workers, Admin, Children, Vaccine Schedules, Vaccination Records, and Reminders.
- `init_db.py`: Python script to automatically create database schema and seed data on local Microsoft SQL Server instance.

## Schema Details
- **Users**: Multi-role users (`Parent`, `HealthcareWorker`, `Admin`) with password hashing.
- **Children**: Stores child profiles linked to parent.
- **Vaccines**: Master list of child vaccines with dose numbers & age intervals.
- **VaccinationRecords**: Tracks scheduled date, actual vaccination date, healthcare worker who administered, status (`Completed`, `Due`, `Upcoming`, `Missed`), and clinical notes.
- **Reminders**: System alerts for parents and workers regarding upcoming or overdue vaccines.

## Setup Instructions

### Option 1: Automatic Setup via Python
Run the initialization script from the project root:
```bash
python backend/database.py --init
```

### Option 2: Manual Setup via SQL Server Management Studio (SSMS) or sqlcmd
1. Open SSMS or VS Code SQL Server extension.
2. Connect to your SQL Server instance (e.g. `localhost` or `.\SQLEXPRESS`).
3. Open and execute `schema.sql`.
4. Open and execute `seed.sql`.
