# VACCTrack – A Smart Child Vaccination Management System

**Academic Community Service Project for Review Presentation**

---

## 📌 Project Overview
**VaccTrack** is a full-stack, smart child vaccination tracking and management system designed to streamline child immunization schedules, reduce missed vaccine rates, and provide actionable analytics to parents, healthcare workers, and administrators.

---

## 🎯 Problem Statement & Objectives
### Problem Statement
In conventional immunization systems, paper-based vaccination cards are easily misplaced, leading to delayed or missed critical childhood vaccinations. Parents lack automated reminder systems, while healthcare centers struggle with manual tracking and fragmented record management.

### System Objectives
1. **Automate Vaccination Scheduling**: Automatically compute recommended vaccine target dates from birth to 24 months upon child registration.
2. **Dynamic Status Tracking**: Recalculate status (`Completed`, `Upcoming`, `Due Today`, `Overdue/Missed`) dynamically based on real-time server dates.
3. **Multi-Role Workspace**: Dedicated portals for **Parents**, **Healthcare Workers**, and **System Administrators**.
4. **Clinical Verification**: Enable healthcare workers to record administered doses, log clinical observations, and maintain audit trails.
5. **Analytics & Governance**: Provide visual charts and report summaries for health officers.

---

## 🛠️ Technology Stack
- **Frontend**: React (Vite), JavaScript (ES6+), HTML5, CSS3, Lucide Icons, Recharts, Axios, React Router v6
- **Backend**: Python 3.14, Flask, Flask-CORS, PyJWT, Werkzeug
- **Database**: Microsoft SQL Server (`pyodbc` driver) with SQLite dynamic fallback
- **IDE & Versioning**: Antigravity IDE / VS Code, Git

---

## 🗄️ Database Architecture (Microsoft SQL Server)
The system uses a normalized relational database schema executed on Microsoft SQL Server (`VaccTrackDB`):

1. **`Users`**: Stores account credentials, hashed passwords (`scrypt/pbkdf2`), contact details, and role assignments (`Parent`, `HealthcareWorker`, `Admin`).
2. **`Children`**: Stores child details (`ChildName`, `DateOfBirth`, `Gender`, `BloodGroup`, `Address`) linked to a parent `UserID`.
3. **`Vaccines`**: Master catalog of vaccines, dose numbers, recommended age intervals (in days), and display labels (`At Birth`, `6 Weeks`, `10 Weeks`, `14 Weeks`, `9 Months`, etc.).
4. **`VaccinationRecords`**: Tracks individual child dose records, target scheduled dates, completion dates, administering healthcare worker ID, status (`Completed`, `Upcoming`, `Due`, `Missed`), and clinical notes.
5. **`Reminders`**: In-app notifications for due and overdue vaccinations linked to parent accounts.

---

## 🔐 Multi-Role Access Control

| Role | Key Features & Responsibilities |
| :--- | :--- |
| 👨‍👩‍👧 **Parent** | Register/Login, Add Children, View Child Immunization Timeline, Track Completed/Upcoming/Overdue Doses, View In-app Reminders |
| 🩺 **Healthcare Worker** | Search Children Directory, View Immunization Logs, Priority Due/Overdue Queue, Record Administered Vaccinations & Clinical Notes |
| 🛡️ **Admin** | Command Overview Dashboard, Interactive Recharts Analytics (Pie & Bar Charts), User Management, Master Vaccine Schedule Editor, System Audit Records, Report Exporting |

---

## 🔑 Demo Login Credentials

For college review presentation testing, use these default credentials:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Parent** | `parent@vacctrack.com` | `Parent123!` |
| **Parent (Alt)** | `ravi@vacctrack.com` | `Parent123!` |
| **Healthcare Worker** | `worker@vacctrack.com` | `Worker123!` |
| **Healthcare Worker (Alt)** | `kavya@vacctrack.com` | `Worker123!` |
| **Admin** | `admin@vacctrack.com` | `Admin123!` |

*Note: The VaccTrack login interface also features 1-click quick fill buttons for instant demo switching during presentations.*

---

## 🚀 Installation & Running Instructions (Windows)

### Prerequisites
1. Python 3.10+
2. Node.js v18+ & npm
3. Microsoft SQL Server (Local instance `localhost` or `.\SQLEXPRESS` with ODBC Driver 17 for SQL Server)

---

### Step 1: Database Setup (Microsoft SQL Server)
The database automatically initializes upon backend startup. However, to set it up manually:
```sql
-- Execute schema.sql in SSMS or VS Code SQL Server extension
database/schema.sql

-- Execute seed.sql to populate demo users, children, vaccine schedule & records
database/seed.sql
```

---

### Step 2: Backend Setup (Flask REST API)
```powershell
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Database Initializer
python database.py

# Start Flask Server (Runs on http://127.0.0.1:5000)
python app.py
```

---

### Step 3: Frontend Setup (React Vite App)
```powershell
# Open a new terminal tab/window and navigate to frontend directory
cd frontend

# Install packages
npm install

# Start Vite Development Server (Runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser to access the VaccTrack application.

---

## 🌐 API Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new parent account | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | All Authenticated |
| `GET` | `/api/children` | List children (parent's own or all for workers) | All Authenticated |
| `POST` | `/api/children` | Add child & auto-generate vaccine schedule | All Authenticated |
| `GET` | `/api/children/:id` | Get child details & progress stats | All Authenticated |
| `GET` | `/api/vaccines` | List master vaccine schedule | All Authenticated |
| `POST` | `/api/vaccines` | Add new vaccine type definition | Admin |
| `GET` | `/api/vaccinations` | Get filtered vaccination records | All Authenticated |
| `POST` | `/api/vaccinations/record` | Record administered dose & notes | HealthcareWorker, Admin |
| `GET` | `/api/reminders` | Fetch in-app reminders for user | All Authenticated |
| `GET` | `/api/dashboard/parent` | Aggregated parent dashboard statistics | Parent |
| `GET` | `/api/dashboard/healthcare` | Healthcare worker queue & metrics | HealthcareWorker, Admin |
| `GET` | `/api/dashboard/admin` | Complete admin analytics & coverage stats | Admin |
| `GET` | `/api/reports/analytics` | Analytical breakdown report data | Admin, HealthcareWorker |

---

## 📺 Complete College Presentation Demo Flow

To demonstrate the full working application during project review:

1. **Landing Page**: Open `http://localhost:5173`. Show VaccTrack branding, problem statement, and 1-click presentation login options.
2. **Parent Workflow**:
   - Log in as `parent@vacctrack.com`.
   - View Parent Dashboard (Total Children: 2, Completed: 8, Due: 2, Overdue: 3).
   - Click **Add New Child**, enter child name (e.g., "Kiran Sharma", DOB: 2 weeks ago, Gender: Male).
   - Notice how VaccTrack automatically computes and populates all 12 standard vaccines from birth to 24 months.
   - Open **Vaccination Schedule** to view status-coded tags (Green, Blue, Orange, Red).
   - View **Reminders & Alerts** tab.
   - Logout.
3. **Healthcare Worker Workflow**:
   - Log in as `worker@vacctrack.com`.
   - View Healthcare Dashboard & Priority Follow-Up Queue.
   - Search Children Directory for "Kiran".
   - Click **Record Vaccination** for a due dose (e.g. OPV-1), enter vaccination date and clinical notes ("Given at clinic, patient normal"), click Save.
   - Observe how the dose immediately updates to `Completed` across the system database.
   - Logout.
4. **Admin Workflow**:
   - Log in as `admin@vacctrack.com`.
   - View Admin Dashboard with Recharts interactive charts (Status Distribution & Vaccine Coverage).
   - Open **Manage Users** to review parent/worker accounts and adjust roles.
   - Open **Manage Vaccine Types** to edit dose parameters or add new vaccine definitions.
   - Open **Reports & Analytics** to view compliance percentages and export/print summaries.

---

## 🔮 Future Scope
1. **SMS & WhatsApp Alerts Gateway**: Integration with Twilio / Gupshup APIs to broadcast SMS notifications directly to parent mobile numbers 3 days prior to scheduled vaccination dates.
2. **Email Vaccination Certificates**: Automated PDF generator via SendGrid / AWS SES to dispatch verified digital immunization certificates upon completion of mandatory dose milestones.
3. **Offline Synchronization**: Mobile Progressive Web App (PWA) extension for rural healthcare workers conducting field immunization drives in low-connectivity regions.

---
*Developed for College Community Service Project Review 2026.*
