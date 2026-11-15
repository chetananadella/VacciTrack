import os
import re
import sqlite3
from datetime import date, timedelta
from config import Config

try:
    import pyodbc
except Exception:
    pyodbc = None

DB_TYPE = "unknown"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLITE_DB_PATH = os.getenv(
    "SQLITE_DB_PATH",
    os.path.join(BASE_DIR, "..", "database", "vacctrack_fallback.db")
)
USE_SQLITE = os.getenv("USE_SQLITE", "").lower() in ("1", "true", "yes")

def _sqlite_connection():
    os.makedirs(os.path.dirname(os.path.abspath(SQLITE_DB_PATH)), exist_ok=True)
    conn = sqlite3.connect(SQLITE_DB_PATH, timeout=30, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA busy_timeout = 30000")
    return conn

def get_db_connection(use_master=False):
    global DB_TYPE
    if not USE_SQLITE and pyodbc is not None:
        try:
            if use_master:
                conn_str = (
                    f"DRIVER={{{Config.DB_DRIVER}}};SERVER={Config.DB_SERVER};"
                    "DATABASE=master;Trusted_Connection=yes;"
                )
            else:
                conn_str = Config.get_connection_string()
            conn = pyodbc.connect(conn_str, timeout=5)
            conn.autocommit = True
            DB_TYPE = "mssql"
            return conn
        except Exception as exc:
            print(f"[DB] SQL Server unavailable; using SQLite fallback: {exc}")
    DB_TYPE = "sqlite"
    return _sqlite_connection()

def _prepare_sqlite_query(query):
    query = re.sub(r"\bdbo\.", "", query, flags=re.IGNORECASE)
    query = re.sub(r"\bGETDATE\(\)", "CURRENT_TIMESTAMP", query, flags=re.IGNORECASE)
    # Translate SQL Server SELECT TOP n to SQLite LIMIT n.
    match = re.search(r"^\s*SELECT\s+TOP\s+(\d+)\s+", query, flags=re.IGNORECASE)
    if match:
        limit = match.group(1)
        query = query[:match.start()] + "SELECT " + query[match.end():]
        query = query.rstrip().rstrip(";") + f" LIMIT {limit}"
    return query

def execute_query(query, params=(), fetchone=False, fetchall=False, commit=False):
    conn = get_db_connection()
    is_sqlite = isinstance(conn, sqlite3.Connection)
    cursor = conn.cursor()
    try:
        if is_sqlite:
            query = _prepare_sqlite_query(query)
        cursor.execute(query, params)
        if commit:
            if is_sqlite:
                conn.commit()
            return cursor.rowcount
        if fetchone:
            row = cursor.fetchone()
            return dict(row) if row is not None and is_sqlite else (
                dict(zip([c[0] for c in cursor.description], row)) if row is not None else None
            )
        if fetchall:
            rows = cursor.fetchall()
            if is_sqlite:
                return [dict(row) for row in rows]
            columns = [c[0] for c in cursor.description]
            return [dict(zip(columns, row)) for row in rows]
        if is_sqlite:
            conn.commit()
        return None
    except Exception as exc:
        print(f"[DB ERROR] {exc}\nSQL: {query}")
        raise
    finally:
        cursor.close()
        conn.close()

def _init_sqlite():
    conn = _sqlite_connection()
    cur = conn.cursor()
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS Users (
      UserID INTEGER PRIMARY KEY AUTOINCREMENT, FullName TEXT NOT NULL,
      Email TEXT NOT NULL UNIQUE, Phone TEXT, PasswordHash TEXT NOT NULL,
      Role TEXT NOT NULL, CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS Children (
      ChildID INTEGER PRIMARY KEY AUTOINCREMENT, ParentID INTEGER NOT NULL,
      ChildName TEXT NOT NULL, DateOfBirth TEXT NOT NULL, Gender TEXT NOT NULL,
      BloodGroup TEXT, Address TEXT, CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ParentID) REFERENCES Users(UserID)
    );
    CREATE TABLE IF NOT EXISTS Vaccines (
      VaccineID INTEGER PRIMARY KEY AUTOINCREMENT, VaccineName TEXT NOT NULL,
      Description TEXT, DoseNumber INTEGER DEFAULT 1,
      RecommendedAgeInDays INTEGER DEFAULT 0, RecommendedAgeLabel TEXT NOT NULL,
      CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS VaccinationRecords (
      RecordID INTEGER PRIMARY KEY AUTOINCREMENT, ChildID INTEGER NOT NULL,
      VaccineID INTEGER NOT NULL, HealthcareWorkerID INTEGER,
      ScheduledDate TEXT NOT NULL, VaccinationDate TEXT,
      Status TEXT DEFAULT 'Upcoming', Notes TEXT,
      CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ChildID) REFERENCES Children(ChildID),
      FOREIGN KEY (VaccineID) REFERENCES Vaccines(VaccineID),
      FOREIGN KEY (HealthcareWorkerID) REFERENCES Users(UserID)
    );
    CREATE TABLE IF NOT EXISTS Reminders (
      ReminderID INTEGER PRIMARY KEY AUTOINCREMENT, ChildID INTEGER NOT NULL,
      VaccineID INTEGER NOT NULL, ReminderDate TEXT NOT NULL,
      Message TEXT NOT NULL, Status TEXT DEFAULT 'Unread',
      CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ChildID) REFERENCES Children(ChildID),
      FOREIGN KEY (VaccineID) REFERENCES Vaccines(VaccineID)
    );
    CREATE INDEX IF NOT EXISTS IX_Children_ParentID ON Children(ParentID);
    CREATE INDEX IF NOT EXISTS IX_VaccinationRecords_Status ON VaccinationRecords(Status);
    CREATE INDEX IF NOT EXISTS IX_Reminders_ChildID ON Reminders(ChildID);
    """)
    user_count = cur.execute("SELECT COUNT(*) FROM Users").fetchone()[0]
    if user_count == 0:
        # Passwords: Parent123!, Worker123!, Admin123!
        demo_users = [
          ("Priya Sharma","parent@vacctrack.com","+91 9876543210","scrypt:32768:8:1$IV3palE3BZBHbt9u$72d787f025bcba84a641f286dea3f7e5f150abaa806fc89faa227bf001f082362daa7e47ebd998e189323d523ce326b226081ba52bad09363421694ce5bdf57b","Parent"),
          ("Ravi Kumar","ravi@vacctrack.com","+91 9876543211","scrypt:32768:8:1$IV3palE3BZBHbt9u$72d787f025bcba84a641f286dea3f7e5f150abaa806fc89faa227bf001f082362daa7e47ebd998e189323d523ce326b226081ba52bad09363421694ce5bdf57b","Parent"),
          ("Dr. Meera Patel","worker@vacctrack.com","+91 9876543220","scrypt:32768:8:1$WQTIpwxDY5kKtsus$69ee0e290bc05666f65ae9c9b363c56d66d3afab5de71406165e7423ff0ef1520f107f56e94957c4b0b2bc7e9338690609d9240b9ba7e74dade6910a0f75c9d2","HealthcareWorker"),
          ("Nurse Kavya Reddy","kavya@vacctrack.com","+91 9876543221","scrypt:32768:8:1$WQTIpwxDY5kKtsus$69ee0e290bc05666f65ae9c9b363c56d66d3afab5de71406165e7423ff0ef1520f107f56e94957c4b0b2bc7e9338690609d9240b9ba7e74dade6910a0f75c9d2","HealthcareWorker"),
          ("System Administrator","admin@vacctrack.com","+91 9876543200","scrypt:32768:8:1$QU1XWDWH2f8HNcXf$36bb2487b4871eab1e12e5c41c1d10af29b1db1c437bdae82ce91ccf8056ee7ae71af3e9e254c5d7de23819398132442941b790c32cbe1835c62a31792f4c97d","Admin")
        ]
        cur.executemany(
          "INSERT INTO Users (FullName,Email,Phone,PasswordHash,Role) VALUES (?,?,?,?,?)",
          demo_users
        )
        vaccines = [
          ("BCG","Protects against tuberculosis.",1,0,"At Birth"),
          ("OPV-0","Oral polio vaccine at birth.",1,0,"At Birth"),
          ("Hepatitis B-1","Hepatitis B birth dose.",1,0,"At Birth"),
          ("OPV-1","First primary polio dose.",1,42,"6 Weeks"),
          ("Pentavalent-1","First pentavalent dose.",1,42,"6 Weeks"),
          ("Rotavirus-1","First rotavirus dose.",1,42,"6 Weeks"),
          ("OPV-2","Second primary polio dose.",2,70,"10 Weeks"),
          ("Pentavalent-2","Second pentavalent dose.",2,70,"10 Weeks"),
          ("OPV-3","Third primary polio dose.",3,98,"14 Weeks"),
          ("Pentavalent-3","Third pentavalent dose.",3,98,"14 Weeks"),
          ("MMR-1","Measles, mumps and rubella dose.",1,270,"9 Months"),
          ("DPT Booster-1","DPT booster dose.",1,480,"16-24 Months")
        ]
        cur.executemany(
          "INSERT INTO Vaccines (VaccineName,Description,DoseNumber,RecommendedAgeInDays,RecommendedAgeLabel) VALUES (?,?,?,?,?)",
          vaccines
        )
        today = date.today()
        dob_a = today - timedelta(days=180)
        dob_b = today - timedelta(days=60)
        dob_c = today - timedelta(days=330)
        children = [
          (1,"Aarav Sharma",dob_a.isoformat(),"Male","A+","Demo address"),
          (1,"Ananya Sharma",dob_b.isoformat(),"Female","O+","Demo address"),
          (2,"Vihaan Kumar",dob_c.isoformat(),"Male","B+","Demo address")
        ]
        cur.executemany(
          "INSERT INTO Children (ParentID,ChildName,DateOfBirth,Gender,BloodGroup,Address) VALUES (?,?,?,?,?,?)",
          children
        )
        # Seed realistic review states: completed, due today, upcoming, and missed.
        records = [
          (1,1,3,(today-timedelta(days=180)).isoformat(),(today-timedelta(days=180)).isoformat(),"Completed","Given at birth"),
          (1,4,3,(today-timedelta(days=40)).isoformat(),(today-timedelta(days=40)).isoformat(),"Completed","6-week dose"),
          (1,9,None,(today-timedelta(days=1)).isoformat(),None,"Due","Pending review dose"),
          (1,10,None,(today+timedelta(days=7)).isoformat(),None,"Upcoming","Upcoming dose"),
          (2,4,None,(today-timedelta(days=20)).isoformat(),None,"Missed","Missed appointment"),
          (2,5,None,(today+timedelta(days=5)).isoformat(),None,"Upcoming","Upcoming dose"),
          (3,11,None,(today-timedelta(days=30)).isoformat(),None,"Missed","Overdue booster")
        ]
        cur.executemany(
          """INSERT INTO VaccinationRecords
          (ChildID,VaccineID,HealthcareWorkerID,ScheduledDate,VaccinationDate,Status,Notes)
          VALUES (?,?,?,?,?,?,?)""", records
        )
        # Initial alerts for the demo review.
        reminder_rows = [
          (1,9,today.isoformat(),"ALERT: Aarav Sharma's OPV-3 vaccination is due. Please arrange the dose.","Unread"),
          (2,4,(today-timedelta(days=20)).isoformat(),"OVERDUE ALERT: Ananya Sharma's OPV-1 vaccination was missed. Please contact the clinic.","Unread"),
          (3,11,(today-timedelta(days=30)).isoformat(),"URGENT: Vihaan Kumar's MMR-1 vaccination is overdue. Please contact the clinic.","Unread")
        ]
        cur.executemany(
          "INSERT INTO Reminders (ChildID,VaccineID,ReminderDate,Message,Status) VALUES (?,?,?,?,?)",
          reminder_rows
        )
    conn.commit()
    conn.close()
    print(f"[DB] SQLite database ready at {SQLITE_DB_PATH}")

def init_db():
    global DB_TYPE
    if USE_SQLITE or pyodbc is None:
        DB_TYPE = "sqlite"
        _init_sqlite()
        return
    # Keep SQL Server initialization explicit; never drop existing tables on startup.
    try:
        conn = pyodbc.connect(Config.get_connection_string(), timeout=5)
        conn.close()
        DB_TYPE = "mssql"
        print("[DB] Connected to configured SQL Server. Existing schema is preserved.")
    except Exception as exc:
        print(f"[DB] SQL Server unavailable: {exc}. Initializing SQLite fallback.")
        DB_TYPE = "sqlite"
        _init_sqlite()
