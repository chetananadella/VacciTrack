import os
import sys

# Ensure backend directory is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pyodbc
import sqlite3
from config import Config

DB_TYPE = 'mssql'
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'vacctrack_fallback.db')

def get_db_connection(use_master=False):
    """
    Establish connection to MS SQL Server or fallback to SQLite.
    """
    global DB_TYPE
    try:
        if use_master:
            conn_str = f"DRIVER={{{Config.DB_DRIVER}}};SERVER={Config.DB_SERVER};DATABASE=master;Trusted_Connection=yes;"
        else:
            conn_str = Config.get_connection_string()
        
        conn = pyodbc.connect(conn_str, timeout=5)
        conn.autocommit = True
        DB_TYPE = 'mssql'
        return conn
    except Exception as e:
        print(f"[DB Warning] Could not connect to SQL Server ({e}). Falling back to SQLite for dev/testing.")
        DB_TYPE = 'sqlite'
        conn = sqlite3.connect(SQLITE_DB_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

def execute_query(query, params=(), fetchone=False, fetchall=False, commit=False):
    """
    Execute SQL query safely and return results as dicts.
    """
    global DB_TYPE
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Convert MS SQL Server query dialect if using SQLite fallback
        if DB_TYPE == 'sqlite':
            query = query.replace('GETDATE()', "CURRENT_TIMESTAMP")

        cursor.execute(query, params)

        if commit:
            if DB_TYPE == 'sqlite':
                conn.commit()
            result = cursor.rowcount
        elif fetchone:
            row = cursor.fetchone()
            if row is None:
                result = None
            elif DB_TYPE == 'mssql':
                columns = [column[0] for column in cursor.description]
                result = dict(zip(columns, row))
            else:
                result = dict(row)
        elif fetchall:
            rows = cursor.fetchall()
            if DB_TYPE == 'mssql':
                columns = [column[0] for column in cursor.description]
                result = [dict(zip(columns, row)) for row in rows]
            else:
                result = [dict(row) for row in rows]
        else:
            if DB_TYPE == 'sqlite':
                conn.commit()
            result = None

        return result
    except Exception as err:
        print(f"[DB Error] Query execution failed: {err}\nQuery: {query}")
        raise err
    finally:
        cursor.close()
        conn.close()

def init_db():
    """
    Initialize SQL Server database with schema and seed data.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    schema_path = os.path.join(base_dir, 'database', 'schema.sql')
    seed_path = os.path.join(base_dir, 'database', 'seed.sql')

    print("[DB Init] Initializing database...")

    try:
        # Step 1: Ensure master connection to create database if not existing
        master_conn = pyodbc.connect(f"DRIVER={{{Config.DB_DRIVER}}};SERVER={Config.DB_SERVER};DATABASE=master;Trusted_Connection=yes;", timeout=5)
        master_conn.autocommit = True
        master_cursor = master_conn.cursor()

        master_cursor.execute("SELECT name FROM sys.databases WHERE name = 'VaccTrackDB'")
        exists = master_cursor.fetchone()
        if not exists:
            master_cursor.execute("CREATE DATABASE VaccTrackDB;")
            print("[DB Init] Created database 'VaccTrackDB'.")
        master_cursor.close()
        master_conn.close()

        # Step 2: Connect to VaccTrackDB
        db_conn = pyodbc.connect(Config.get_connection_string(), timeout=5)
        db_conn.autocommit = True
        db_cursor = db_conn.cursor()

        print("[DB Init] Executing schema.sql on SQL Server...")
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        for batch in schema_sql.split('GO'):
            batch_clean = batch.strip()
            if batch_clean and not batch_clean.startswith('USE ') and not batch_clean.startswith('IF NOT EXISTS (SELECT * FROM sys.databases'):
                try:
                    db_cursor.execute(batch_clean)
                except Exception as e:
                    print(f"[DB Schema Note]: {e}")

        # Check if users exist before seeding
        db_cursor.execute("SELECT COUNT(*) FROM dbo.Users")
        user_count = db_cursor.fetchone()[0]

        if user_count == 0:
            print("[DB Init] Executing seed.sql on SQL Server...")
            with open(seed_path, 'r', encoding='utf-8') as f:
                seed_sql = f.read()
            for batch in seed_sql.split('GO'):
                batch_clean = batch.strip()
                if batch_clean and not batch_clean.startswith('USE '):
                    try:
                        db_cursor.execute(batch_clean)
                    except Exception as e:
                        print(f"[DB Seed Note]: {e}")

        db_cursor.close()
        db_conn.close()
        print("[DB Init] SQL Server database ready successfully!")

    except Exception as e:
        print(f"[DB Init Exception] SQL Server setup notice: {e}. Preparing SQLite fallback...")
        conn = sqlite3.connect(SQLITE_DB_PATH)
        c = conn.cursor()
        
        c.execute('''CREATE TABLE IF NOT EXISTS Users (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            FullName TEXT NOT NULL,
            Email TEXT NOT NULL UNIQUE,
            Phone TEXT,
            PasswordHash TEXT NOT NULL,
            Role TEXT NOT NULL,
            CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS Children (
            ChildID INTEGER PRIMARY KEY AUTOINCREMENT,
            ParentID INTEGER NOT NULL,
            ChildName TEXT NOT NULL,
            DateOfBirth TEXT NOT NULL,
            Gender TEXT NOT NULL,
            BloodGroup TEXT,
            Address TEXT,
            CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ParentID) REFERENCES Users(UserID)
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS Vaccines (
            VaccineID INTEGER PRIMARY KEY AUTOINCREMENT,
            VaccineName TEXT NOT NULL,
            Description TEXT,
            DoseNumber INTEGER DEFAULT 1,
            RecommendedAgeInDays INTEGER DEFAULT 0,
            RecommendedAgeLabel TEXT NOT NULL,
            CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS VaccinationRecords (
            RecordID INTEGER PRIMARY KEY AUTOINCREMENT,
            ChildID INTEGER NOT NULL,
            VaccineID INTEGER NOT NULL,
            HealthcareWorkerID INTEGER,
            ScheduledDate TEXT NOT NULL,
            VaccinationDate TEXT,
            Status TEXT DEFAULT 'Upcoming',
            Notes TEXT,
            CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ChildID) REFERENCES Children(ChildID),
            FOREIGN KEY (VaccineID) REFERENCES Vaccines(VaccineID),
            FOREIGN KEY (HealthcareWorkerID) REFERENCES Users(UserID)
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS Reminders (
            ReminderID INTEGER PRIMARY KEY AUTOINCREMENT,
            ChildID INTEGER NOT NULL,
            VaccineID INTEGER NOT NULL,
            ReminderDate TEXT NOT NULL,
            Message TEXT NOT NULL,
            Status TEXT DEFAULT 'Unread',
            CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ChildID) REFERENCES Children(ChildID),
            FOREIGN KEY (VaccineID) REFERENCES Vaccines(VaccineID)
        )''')
        
        conn.commit()
        conn.close()
        print("[DB Init] SQLite Fallback ready!")

if __name__ == '__main__':
    init_db()
