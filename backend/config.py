import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'
    SECRET_KEY = os.getenv('SECRET_KEY', 'vacctrack_secret_key_college_project_2026')
    
    # MS SQL Server Configuration
    DB_DRIVER = os.getenv('DB_DRIVER', 'ODBC Driver 17 for SQL Server')
    DB_SERVER = os.getenv('DB_SERVER', 'localhost')
    DB_NAME = os.getenv('DB_NAME', 'VaccTrackDB')
    DB_TRUSTED = os.getenv('DB_TRUSTED', 'yes').lower() in ('yes', 'true', '1')
    DB_USER = os.getenv('DB_USER', '')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')

    # JWT Config
    JWT_SECRET = os.getenv('JWT_SECRET', 'vacctrack_jwt_secret_key_2026_super_secure')
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', 24))

    @classmethod
    def get_connection_string(cls):
        """Construct pyodbc MS SQL Server connection string."""
        if cls.DB_TRUSTED or not cls.DB_USER:
            return (
                f"DRIVER={{{cls.DB_DRIVER}}};"
                f"SERVER={cls.DB_SERVER};"
                f"DATABASE={cls.DB_NAME};"
                f"Trusted_Connection=yes;"
            )
        else:
            return (
                f"DRIVER={{{cls.DB_DRIVER}}};"
                f"SERVER={cls.DB_SERVER};"
                f"DATABASE={cls.DB_NAME};"
                f"UID={cls.DB_USER};"
                f"PWD={cls.DB_PASSWORD};"
            )
