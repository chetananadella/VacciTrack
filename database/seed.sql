-- ===================================================
-- VACCTrack: Seed Data Script
-- Microsoft SQL Server Database Seed Data
-- ===================================================

USE VaccTrackDB;
GO

-- 1. Insert Users (Password for all demo accounts is set to Role specific default: Parent123!, Worker123!, Admin123!)
-- Password hashes generated using Werkzeug scrypt/pbkdf2
INSERT INTO dbo.Users (FullName, Email, Phone, PasswordHash, Role)
VALUES 
('Priya Sharma', 'parent@vacctrack.com', '+91 9876543210', 'scrypt:32768:8:1$IV3palE3BZBHbt9u$72d787f025bcba84a641f286dea3f7e5f150abaa806fc89faa227bf001f082362daa7e47ebd998e189323d523ce326b226081ba52bad09363421694ce5bdf57b', 'Parent'),
('Ravi Kumar', 'ravi@vacctrack.com', '+91 9876543211', 'scrypt:32768:8:1$IV3palE3BZBHbt9u$72d787f025bcba84a641f286dea3f7e5f150abaa806fc89faa227bf001f082362daa7e47ebd998e189323d523ce326b226081ba52bad09363421694ce5bdf57b', 'Parent'),
('Dr. Meera Patel', 'worker@vacctrack.com', '+91 9876543220', 'scrypt:32768:8:1$WQTIpwxDY5kKtsus$69ee0e290bc05666f65ae9c9b363c56d66d3afab5de71406165e7423ff0ef1520f107f56e94957c4b0b2bc7e9338690609d9240b9ba7e74dade6910a0f75c9d2', 'HealthcareWorker'),
('Nurse Kavya Reddy', 'kavya@vacctrack.com', '+91 9876543221', 'scrypt:32768:8:1$WQTIpwxDY5kKtsus$69ee0e290bc05666f65ae9c9b363c56d66d3afab5de71406165e7423ff0ef1520f107f56e94957c4b0b2bc7e9338690609d9240b9ba7e74dade6910a0f75c9d2', 'HealthcareWorker'),
('System Administrator', 'admin@vacctrack.com', '+91 9876543200', 'scrypt:32768:8:1$QU1XWDWH2f8HNcXf$36bb2487b4871eab1e12e5c41c1d10af29b1db1c437bdae82ce91ccf8056ee7ae71af3e9e254c5d7de23819398132442941b790c32cbe1835c62a31792f4c97d', 'Admin');

-- 2. Insert Standard Vaccine Schedule
INSERT INTO dbo.Vaccines (VaccineName, Description, DoseNumber, RecommendedAgeInDays, RecommendedAgeLabel)
VALUES 
('BCG', 'Bacillus Calmette-Guérin vaccine protects against tuberculosis.', 1, 0, 'At Birth'),
('OPV-0', 'Oral Polio Vaccine initial dose given immediately after birth.', 1, 0, 'At Birth'),
('Hepatitis B-1', 'Protects against Hepatitis B virus infection.', 1, 0, 'At Birth'),
('OPV-1', 'First primary dose of Oral Polio Vaccine.', 1, 42, '6 Weeks'),
('Pentavalent-1', 'Combines DPT, Hepatitis B, and Hib vaccines.', 1, 42, '6 Weeks'),
('Rotavirus-1', 'Protects against severe rotavirus diarrhea.', 1, 42, '6 Weeks'),
('OPV-2', 'Second primary dose of Oral Polio Vaccine.', 2, 70, '10 Weeks'),
('Pentavalent-2', 'Second primary dose of Pentavalent vaccine.', 2, 70, '10 Weeks'),
('OPV-3', 'Third primary dose of Oral Polio Vaccine.', 3, 98, '14 Weeks'),
('Pentavalent-3', 'Third primary dose of Pentavalent vaccine.', 3, 98, '14 Weeks'),
('MMR-1', 'Measles, Mumps, and Rubella vaccine.', 1, 270, '9 Months'),
('DPT Booster-1', 'Diphtheria, Pertussis, and Tetanus booster dose.', 1, 480, '16-24 Months');

-- 3. Insert Children
-- Note: Assuming UserID 1 is Priya Sharma, UserID 2 is Ravi Kumar
INSERT INTO dbo.Children (ParentID, ChildName, DateOfBirth, Gender, BloodGroup, Address)
VALUES 
(1, 'Aarav Sharma', DATEADD(month, -6, CAST(GETDATE() AS DATE)), 'Male', 'A+', 'Flat 402, Sunshine Apartments, MG Road, Bengaluru'),
(1, 'Ananya Sharma', DATEADD(month, -2, CAST(GETDATE() AS DATE)), 'Female', 'O+', 'Flat 402, Sunshine Apartments, MG Road, Bengaluru'),
(2, 'Vihaan Kumar', DATEADD(month, -11, CAST(GETDATE() AS DATE)), 'Male', 'B+', 'House No. 12, Green Glen Layout, Bellandur, Bengaluru');

-- 4. Insert Vaccination Records
-- Aarav (Born 6 months ago): Birth & 6-week & 10-week completed, 14-week due/completed, 9-month upcoming
INSERT INTO dbo.VaccinationRecords (ChildID, VaccineID, HealthcareWorkerID, ScheduledDate, VaccinationDate, Status, Notes)
VALUES 
-- Aarav (ChildID 1)
(1, 1, 3, DATEADD(month, -6, CAST(GETDATE() AS DATE)), DATEADD(month, -6, CAST(GETDATE() AS DATE)), 'Completed', 'Administered at City Care Hospital'),
(1, 2, 3, DATEADD(month, -6, CAST(GETDATE() AS DATE)), DATEADD(month, -6, CAST(GETDATE() AS DATE)), 'Completed', 'Given at birth'),
(1, 3, 3, DATEADD(month, -6, CAST(GETDATE() AS DATE)), DATEADD(month, -6, CAST(GETDATE() AS DATE)), 'Completed', 'Normal reaction'),
(1, 4, 3, DATEADD(day, 42, DATEADD(month, -6, CAST(GETDATE() AS DATE))), DATEADD(day, 42, DATEADD(month, -6, CAST(GETDATE() AS DATE))), 'Completed', '6 week dose'),
(1, 5, 3, DATEADD(day, 42, DATEADD(month, -6, CAST(GETDATE() AS DATE))), DATEADD(day, 42, DATEADD(month, -6, CAST(GETDATE() AS DATE))), 'Completed', 'No fever observed'),
(1, 6, 3, DATEADD(day, 42, DATEADD(month, -6, CAST(GETDATE() AS DATE))), DATEADD(day, 42, DATEADD(month, -6, CAST(GETDATE() AS DATE))), 'Completed', 'Oral drops'),
(1, 7, 4, DATEADD(day, 70, DATEADD(month, -6, CAST(GETDATE() AS DATE))), DATEADD(day, 70, DATEADD(month, -6, CAST(GETDATE() AS DATE))), 'Completed', '10 week dose'),
(1, 8, 4, DATEADD(day, 70, DATEADD(month, -6, CAST(GETDATE() AS DATE))), DATEADD(day, 70, DATEADD(month, -6, CAST(GETDATE() AS DATE))), 'Completed', 'Successful administration'),
(1, 9, NULL, DATEADD(day, 98, DATEADD(month, -6, CAST(GETDATE() AS DATE))), NULL, 'Due', 'Pending 14-week appointment'),
(1, 10, NULL, DATEADD(day, 98, DATEADD(month, -6, CAST(GETDATE() AS DATE))), NULL, 'Due', 'Pending 14-week appointment'),
(1, 11, NULL, DATEADD(day, 270, DATEADD(month, -6, CAST(GETDATE() AS DATE))), NULL, 'Upcoming', 'Scheduled at 9 months'),

-- Ananya (ChildID 2, Born 2 months ago): Birth completed, 6-week overdue, 10-week upcoming
(2, 1, 3, DATEADD(month, -2, CAST(GETDATE() AS DATE)), DATEADD(month, -2, CAST(GETDATE() AS DATE)), 'Completed', 'Given at hospital'),
(2, 2, 3, DATEADD(month, -2, CAST(GETDATE() AS DATE)), DATEADD(month, -2, CAST(GETDATE() AS DATE)), 'Completed', 'Given at birth'),
(2, 3, 3, DATEADD(month, -2, CAST(GETDATE() AS DATE)), DATEADD(month, -2, CAST(GETDATE() AS DATE)), 'Completed', 'Given at birth'),
(2, 4, NULL, DATEADD(day, -15, CAST(GETDATE() AS DATE)), NULL, 'Missed', 'Missed appointment - follow up required'),
(2, 5, NULL, DATEADD(day, -15, CAST(GETDATE() AS DATE)), NULL, 'Missed', 'Missed 6-week dose'),
(2, 6, NULL, DATEADD(day, -15, CAST(GETDATE() AS DATE)), NULL, 'Missed', 'Missed 6-week dose'),
(2, 7, NULL, DATEADD(day, 10, CAST(GETDATE() AS DATE)), NULL, 'Upcoming', '10 week dose coming up'),
(2, 8, NULL, DATEADD(day, 10, CAST(GETDATE() AS DATE)), NULL, 'Upcoming', '10 week dose coming up'),

-- Vihaan (ChildID 3, Born 11 months ago): Birth, 6w, 10w, 14w completed, 9m MMR overdue
(3, 1, 3, DATEADD(month, -11, CAST(GETDATE() AS DATE)), DATEADD(month, -11, CAST(GETDATE() AS DATE)), 'Completed', 'At birth'),
(3, 4, 3, DATEADD(day, 42, DATEADD(month, -11, CAST(GETDATE() AS DATE))), DATEADD(day, 42, DATEADD(month, -11, CAST(GETDATE() AS DATE))), 'Completed', '6w dose'),
(3, 7, 4, DATEADD(day, 70, DATEADD(month, -11, CAST(GETDATE() AS DATE))), DATEADD(day, 70, DATEADD(month, -11, CAST(GETDATE() AS DATE))), 'Completed', '10w dose'),
(3, 9, 4, DATEADD(day, 98, DATEADD(month, -11, CAST(GETDATE() AS DATE))), DATEADD(day, 98, DATEADD(month, -11, CAST(GETDATE() AS DATE))), 'Completed', '14w dose'),
(3, 11, NULL, DATEADD(day, -30, CAST(GETDATE() AS DATE)), NULL, 'Missed', 'MMR-1 overdue by 30 days');

-- 5. Insert Reminders
INSERT INTO dbo.Reminders (ChildID, VaccineID, ReminderDate, Message, Status)
VALUES 
(1, 9, CAST(GETDATE() AS DATE), 'Reminder: Aarav''s OPV-3 vaccination is due today.', 'Unread'),
(1, 10, CAST(GETDATE() AS DATE), 'Reminder: Aarav''s Pentavalent-3 vaccination is due today.', 'Unread'),
(2, 4, DATEADD(day, -15, CAST(GETDATE() AS DATE)), 'OVERDUE: Ananya''s OPV-1 vaccination was missed on 15 days ago. Please visit clinic.', 'Unread'),
(2, 5, DATEADD(day, -15, CAST(GETDATE() AS DATE)), 'OVERDUE: Ananya''s Pentavalent-1 vaccination was missed on 15 days ago.', 'Unread'),
(3, 11, DATEADD(day, -30, CAST(GETDATE() AS DATE)), 'URGENT: Vihaan''s MMR-1 vaccination is overdue by 30 days.', 'Unread');
GO
