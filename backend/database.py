
import os
import sys
import sqlite3

# Backend directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from config import Config

try:
    import pyodbc
except ImportError:
    pyodbc = None


# Set USE_SQLITE=true on Render
USE_SQLITE = os.getenv("USE_SQLITE", "false").lower() in (
    "true", "1", "yes"
)

DB_TYPE = "sqlite" if USE_SQLITE else "mssql"

SQLITE_DB_PATH = os.path.abspath(
    os.path.join(
        BACKEND_DIR,
        "..",
        "database",
        "vacctrack_fallback.db"
    )
)


def _sqlite_connection():
    """Create SQLite database connection."""

    os.makedirs(
        os.path.dirname(SQLITE_DB_PATH),
        exist_ok=True
    )

    conn = sqlite3.connect(
        SQLITE_DB_PATH,
        check_same_thread=False,
        timeout=30
    )

    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA busy_timeout = 30000")

    return conn


def get_db_connection(use_master=False):
    """Connect to SQL Server or SQLite."""

    global DB_TYPE

    if USE_SQLITE or pyodbc is None:
        DB_TYPE = "sqlite"
        return _sqlite_connection()

    try:
        if use_master:
            conn_str = (
                f"DRIVER={{{Config.DB_DRIVER}}};"
                f"SERVER={Config.DB_SERVER};"
                "DATABASE=master;"
                f"UID={Config.DB_USER};"
                f"PWD={Config.DB_PASSWORD};"
                "TrustServerCertificate=yes;"
            )
        else:
            conn_str = Config.get_connection_string()

        conn = pyodbc.connect(conn_str, timeout=5)
        conn.autocommit = True

        DB_TYPE = "mssql"
        return conn

    except Exception as exc:
        print(f"[DB Warning] SQL Server unavailable: {exc}")
        print("[DB] Switching to SQLite.")

        DB_TYPE = "sqlite"
        return _sqlite_connection()


def _prepare_sqlite_query(query):
    """Convert SQL Server query syntax to SQLite."""

    query = query.replace("dbo.", "")
    query = query.replace("GETDATE()", "CURRENT_TIMESTAMP")
    query = query.replace("getdate()", "CURRENT_TIMESTAMP")

    return query


def execute_query(
    query,
    params=(),
    fetchone=False,
    fetchall=False,
    commit=False
):
    """Execute SQL query and return results."""

    global DB_TYPE

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        if DB_TYPE == "sqlite":
            query = _prepare_sqlite_query(query)

        cursor.execute(query, params)

        if commit:
            if DB_TYPE == "sqlite":
                conn.commit()

            result = cursor.rowcount

        elif fetchone:
            row = cursor.fetchone()

            if row is None:
                result = None

            elif DB_TYPE == "mssql":
                columns = [
                    column[0]
                    for column in cursor.description
                ]
                result = dict(zip(columns, row))

            else:
                result = dict(row)

        elif fetchall:
            rows = cursor.fetchall()

            if DB_TYPE == "mssql":
                columns = [
                    column[0]
                    for column in cursor.description
                ]
                result = [
                    dict(zip(columns, row))
                    for row in rows
                ]

            else:
                result = [
                    dict(row)
                    for row in rows
                ]

        else:
            if DB_TYPE == "sqlite":
                conn.commit()

            result = None

        return result

    except Exception as exc:
        print(f"[DB Error] {exc}")
        print(f"[DB Query] {query}")
        raise

    finally:
        cursor.close()
        conn.close()


def _init_sqlite_db():
    """Create all SQLite tables and indexes."""

    conn = _sqlite_connection()
    cursor = conn.cursor()

    try:
        cursor.executescript("""

        CREATE TABLE IF NOT EXISTS Users (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            FullName TEXT NOT NULL,
            Email TEXT NOT NULL UNIQUE,
            Phone TEXT,
            PasswordHash TEXT NOT NULL,
            Role TEXT NOT NULL
                CHECK (
                    Role IN (
                        'Parent',
                        'HealthcareWorker',
                        'Admin'
                    )
                ),
            CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Children (
            ChildID INTEGER PRIMARY KEY AUTOINCREMENT,
            ParentID INTEGER NOT NULL,
            ChildName TEXT NOT NULL,
            DateOfBirth TEXT NOT NULL,
            Gender TEXT NOT NULL
                CHECK (
                    Gender IN ('Male', 'Female', 'Other')
                ),
            BloodGroup TEXT,
            Address TEXT,
            CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ParentID)
                REFERENCES Users(UserID)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Vaccines (
            VaccineID INTEGER PRIMARY KEY AUTOINCREMENT,
            VaccineName TEXT NOT NULL,
            Description TEXT,
            DoseNumber INTEGER NOT NULL DEFAULT 1,
            RecommendedAgeInDays INTEGER NOT NULL DEFAULT 0,
            RecommendedAgeLabel TEXT NOT NULL,
            CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS VaccinationRecords (
            RecordID INTEGER PRIMARY KEY AUTOINCREMENT,
            ChildID INTEGER NOT NULL,
            VaccineID INTEGER NOT NULL,
            HealthcareWorkerID INTEGER,
            ScheduledDate TEXT NOT NULL,
            VaccinationDate TEXT,
            Status TEXT NOT NULL DEFAULT 'Upcoming'
                CHECK (
                    Status IN (
                        'Upcoming',
                        'Due',
                        'Completed',
                        'Missed'
                    )
                ),
            Notes TEXT,
            CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ChildID)
                REFERENCES Children(ChildID)
                ON DELETE CASCADE,
            FOREIGN KEY (VaccineID)
                REFERENCES Vaccines(VaccineID),
            FOREIGN KEY (HealthcareWorkerID)
                REFERENCES Users(UserID)
        );

        CREATE TABLE IF NOT EXISTS Reminders (
            ReminderID INTEGER PRIMARY KEY AUTOINCREMENT,
            ChildID INTEGER NOT NULL,
            VaccineID INTEGER NOT NULL,
            ReminderDate TEXT NOT NULL,
            Message TEXT NOT NULL,
            Status TEXT NOT NULL DEFAULT 'Unread'
                CHECK (
                    Status IN (
                        'Unread',
                        'Read',
                        'Dismissed'
                    )
                ),
            CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ChildID)
                REFERENCES Children(ChildID)
                ON DELETE CASCADE,
            FOREIGN KEY (VaccineID)
                REFERENCES Vaccines(VaccineID)
        );

        CREATE INDEX IF NOT EXISTS IX_Users_Email
            ON Users(Email);

        CREATE INDEX IF NOT EXISTS IX_Children_ParentID
            ON Children(ParentID);

        CREATE INDEX IF NOT EXISTS IX_VaccinationRecords_ChildID
            ON VaccinationRecords(ChildID);

        CREATE INDEX IF NOT EXISTS IX_VaccinationRecords_Status
            ON VaccinationRecords(Status);

        CREATE INDEX IF NOT EXISTS IX_Reminders_ChildID
            ON Reminders(ChildID);

        """)

        conn.commit()

        print("[DB Init] SQLite tables initialized successfully.")

    finally:
        cursor.close()
        conn.close()


def init_db():
    """Initialize the selected database."""

    global DB_TYPE

    print("[DB Init] Initializing database...")

    if USE_SQLITE or pyodbc is None:
        DB_TYPE = "sqlite"
        _init_sqlite_db()
        return

    try:
        conn = pyodbc.connect(
            Config.get_connection_string(),
            timeout=5
        )

        conn.close()

        DB_TYPE = "mssql"

        print("[DB Init] SQL Server connected.")

    except Exception as exc:
        print(f"[DB Init] SQL Server unavailable: {exc}")

        DB_TYPE = "sqlite"
        _init_sqlite_db()


if __name__ == "__main__":
    init_db()
