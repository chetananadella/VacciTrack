-- ===================================================
-- VACCTrack: A Smart Child Vaccination Management System
-- Microsoft SQL Server Database Schema
-- ===================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'VaccTrackDB')
BEGIN
    CREATE DATABASE VaccTrackDB;
END
GO

USE VaccTrackDB;
GO

-- Drop tables if they exist (clean order)
IF OBJECT_ID('dbo.Reminders', 'U') IS NOT NULL DROP TABLE dbo.Reminders;
IF OBJECT_ID('dbo.VaccinationRecords', 'U') IS NOT NULL DROP TABLE dbo.VaccinationRecords;
IF OBJECT_ID('dbo.Vaccines', 'U') IS NOT NULL DROP TABLE dbo.Vaccines;
IF OBJECT_ID('dbo.Children', 'U') IS NOT NULL DROP TABLE dbo.Children;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- 1. Users Table
CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Phone NVARCHAR(20) NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL CHECK (Role IN ('Parent', 'HealthcareWorker', 'Admin')),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 2. Children Table
CREATE TABLE dbo.Children (
    ChildID INT IDENTITY(1,1) PRIMARY KEY,
    ParentID INT NOT NULL,
    ChildName NVARCHAR(100) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Gender NVARCHAR(10) NOT NULL CHECK (Gender IN ('Male', 'Female', 'Other')),
    BloodGroup NVARCHAR(10) NULL,
    Address NVARCHAR(255) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ParentID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
);
GO

-- 3. Vaccines Table
CREATE TABLE dbo.Vaccines (
    VaccineID INT IDENTITY(1,1) PRIMARY KEY,
    VaccineName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    DoseNumber INT NOT NULL DEFAULT 1,
    RecommendedAgeInDays INT NOT NULL DEFAULT 0,
    RecommendedAgeLabel NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 4. VaccinationRecords Table
CREATE TABLE dbo.VaccinationRecords (
    RecordID INT IDENTITY(1,1) PRIMARY KEY,
    ChildID INT NOT NULL,
    VaccineID INT NOT NULL,
    HealthcareWorkerID INT NULL,
    ScheduledDate DATE NOT NULL,
    VaccinationDate DATE NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Upcoming' CHECK (Status IN ('Upcoming', 'Due', 'Completed', 'Missed')),
    Notes NVARCHAR(500) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ChildID) REFERENCES dbo.Children(ChildID) ON DELETE CASCADE,
    FOREIGN KEY (VaccineID) REFERENCES dbo.Vaccines(VaccineID) ON DELETE NO ACTION,
    FOREIGN KEY (HealthcareWorkerID) REFERENCES dbo.Users(UserID) ON DELETE NO ACTION
);
GO

-- 5. Reminders Table
CREATE TABLE dbo.Reminders (
    ReminderID INT IDENTITY(1,1) PRIMARY KEY,
    ChildID INT NOT NULL,
    VaccineID INT NOT NULL,
    ReminderDate DATE NOT NULL,
    Message NVARCHAR(300) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Unread' CHECK (Status IN ('Unread', 'Read', 'Dismissed')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ChildID) REFERENCES dbo.Children(ChildID) ON DELETE CASCADE,
    FOREIGN KEY (VaccineID) REFERENCES dbo.Vaccines(VaccineID) ON DELETE NO ACTION
);
GO

-- Create Indexes for performance
CREATE INDEX IX_Users_Email ON dbo.Users(Email);
CREATE INDEX IX_Children_ParentID ON dbo.Children(ParentID);
CREATE INDEX IX_VaccinationRecords_ChildID ON dbo.VaccinationRecords(ChildID);
CREATE INDEX IX_VaccinationRecords_Status ON dbo.VaccinationRecords(Status);
CREATE INDEX IX_Reminders_ChildID ON dbo.Reminders(ChildID);
GO
