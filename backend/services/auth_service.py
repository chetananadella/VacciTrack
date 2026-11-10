from werkzeug.security import generate_password_hash, check_password_hash
from database import execute_query
from utils.auth_middleware import generate_token

def register_user(full_name, email, phone, password, role='Parent'):
    """
    Register a new user in the system.
    """
    email_clean = email.strip().lower()
    
    # Check duplicate email
    existing = execute_query("SELECT UserID FROM dbo.Users WHERE LOWER(Email) = ?", (email_clean,), fetchone=True)
    if existing:
        return {"success": False, "message": "Email is already registered. Please login instead."}

    password_hash = generate_password_hash(password)
    
    query = """
    INSERT INTO dbo.Users (FullName, Email, Phone, PasswordHash, Role)
    VALUES (?, ?, ?, ?, ?)
    """
    execute_query(query, (full_name, email_clean, phone, password_hash, role), commit=True)
    
    # Get created user
    new_user = execute_query("SELECT UserID, FullName, Email, Role FROM dbo.Users WHERE LOWER(Email) = ?", (email_clean,), fetchone=True)
    
    token = generate_token(new_user['UserID'], new_user['Email'], new_user['Role'], new_user['FullName'])
    
    return {
        "success": True,
        "message": "Registration successful!",
        "user": {
            "user_id": new_user['UserID'],
            "full_name": new_user['FullName'],
            "email": new_user['Email'],
            "role": new_user['Role']
        },
        "token": token
    }

def login_user(email, password):
    """
    Authenticate user login credentials.
    """
    email_clean = email.strip().lower()
    user = execute_query("SELECT UserID, FullName, Email, Phone, PasswordHash, Role FROM dbo.Users WHERE LOWER(Email) = ?", (email_clean,), fetchone=True)
    
    if not user:
        return {"success": False, "message": "Invalid email address or password."}
        
    if not check_password_hash(user['PasswordHash'], password):
        return {"success": False, "message": "Invalid email address or password."}

    token = generate_token(user['UserID'], user['Email'], user['Role'], user['FullName'])

    return {
        "success": True,
        "message": "Login successful!",
        "user": {
            "user_id": user['UserID'],
            "full_name": user['FullName'],
            "email": user['Email'],
            "phone": user['Phone'],
            "role": user['Role']
        },
        "token": token
    }

def get_user_profile(user_id):
    """
    Fetch user profile by UserID.
    """
    user = execute_query("SELECT UserID, FullName, Email, Phone, Role, CreatedAt FROM dbo.Users WHERE UserID = ?", (user_id,), fetchone=True)
    return user
