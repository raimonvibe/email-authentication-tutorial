from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
import secrets
import re
import os
import urllib.request
import urllib.parse

app = FastAPI(title="Email Authentication API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-development-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

users_db: Dict[str, dict] = {}
verification_codes: Dict[str, str] = {}

security = HTTPBearer()

class UserSignup(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmailVerification(BaseModel):
    email: EmailStr
    verification_code: str

class User(BaseModel):
    id: str
    email: str
    is_verified: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_verification_code() -> str:
    return str(secrets.randbelow(90000) + 10000)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def send_verification_email(email: str, verification_code: str) -> bool:
    """Send verification email via Brevo (formerly SendInBlue)"""
    try:
        brevo_api_key = None
        
        brevo_api_key = (
            os.getenv('BREVO_API_KEY') or 
            os.environ.get('BREVO_API_KEY') or
            os.getenv('brevo_api_key') or
            os.environ.get('brevo_api_key')
        )
        print(f"DEBUG: Method 1 - BREVO_API_KEY = {brevo_api_key}")
        
        if not brevo_api_key:
            for key_name in ['BREVO_API_KEY', 'brevo_api_key', 'Brevo_Api_Key']:
                brevo_api_key = os.environ.get(key_name)
                if brevo_api_key:
                    print(f"DEBUG: Method 2 - Found {key_name} = {brevo_api_key}")
                    break
        
        if not brevo_api_key:
            try:
                import subprocess
                result = subprocess.run(['printenv', 'BREVO_API_KEY'], capture_output=True, text=True)
                if result.returncode == 0 and result.stdout.strip():
                    brevo_api_key = result.stdout.strip()
                    print(f"DEBUG: Method 3 - Found BREVO_API_KEY via printenv: {brevo_api_key}")
            except Exception as e:
                print(f"DEBUG: Method 3 - printenv attempt failed: {e}")
        
        if not brevo_api_key:
            print("ERROR: BREVO_API_KEY not found in environment variables")
            print(f"DEBUG: Available env vars: {list(os.environ.keys())}")
            print(f"TUTORIAL MODE: Since email service is not configured, here's your verification code: {verification_code}")
            print(f"TUTORIAL MODE: Use this code to verify email: {email}")
            return True  # Return True for tutorial mode
        
        brevo_endpoint = 'https://api.brevo.com/v3/smtp/email'
        
        email_payload = {
            "sender": {
                "email": os.getenv("BREVO_SENDER_EMAIL", "info@raimonvibe.com"),
                "name": os.getenv("BREVO_SENDER_NAME", "Raimon Vibe")
            },
            "to": [
                {
                    "email": email,
                    "name": "User"
                }
            ],
            "subject": "Email Verification Code",
            "htmlContent": f"<html><body><p>Your verification code is: <strong>{verification_code}</strong></p><p>Please enter this code to verify your email address.</p></body></html>"
        }
        
        print(f"DEBUG: Brevo endpoint = {brevo_endpoint}")
        print(f"DEBUG: Email payload = {email_payload}")
        
        import json
        data = json.dumps(email_payload).encode('utf-8')
        req = urllib.request.Request(brevo_endpoint, data=data, method='POST')
        req.add_header('Content-Type', 'application/json')
        req.add_header('api-key', brevo_api_key)
        req.add_header('accept', 'application/json')
        req.add_header('User-Agent', 'Mozilla/5.0 (compatible; EmailAuthTutorial/1.0)')
        
        print(f"DEBUG: Request headers = {dict(req.headers)}")
        
        with urllib.request.urlopen(req) as response:
            response_data = response.read().decode('utf-8')
            print(f"DEBUG: Response status = {response.status}")
            print(f"DEBUG: Response data = {response_data}")
            if response.status == 201:  # Brevo returns 201 for successful email sending
                print(f"Verification email sent successfully to {email}")
                return True
            else:
                print(f"Failed to send email. Status: {response.status}, Response: {response_data}")
                return False
                
    except Exception as e:
        print(f"Error sending verification email: {str(e)}")
        print(f"DEBUG: Exception type = {type(e)}")
        import traceback
        print(f"DEBUG: Traceback = {traceback.format_exc()}")
        return False

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not isinstance(email, str) or email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_db.get(email)
    if user is None:
        raise credentials_exception
    return user

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/signup", response_model=dict)
async def signup(user_data: UserSignup):
    if user_data.email in users_db:
        existing_user = users_db[user_data.email]
        if existing_user["is_verified"]:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists"
            )
        else:
            verification_code = generate_verification_code()
            users_db[user_data.email]["verification_code"] = verification_code
            verification_codes[user_data.email] = verification_code
            
            email_sent = send_verification_email(user_data.email, verification_code)
            
            if email_sent:
                return {
                    "message": "Verification email resent! Please check your email for the new verification code.",
                    "user_id": existing_user["id"]
                }
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to resend verification email. Please contact support."
                )
    
    if len(user_data.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long"
        )
    
    hashed_password = hash_password(user_data.password)
    verification_code = generate_verification_code()
    
    user_id = f"user_{len(users_db) + 1}"
    users_db[user_data.email] = {
        "id": user_id,
        "email": user_data.email,
        "password": hashed_password,
        "is_verified": False,
        "created_at": datetime.utcnow(),
        "verification_code": verification_code
    }
    
    verification_codes[user_data.email] = verification_code
    
    email_sent = send_verification_email(user_data.email, verification_code)
    
    if email_sent:
        return {
            "message": "Account created successfully! Please check your email for the verification code.",
            "user_id": user_id
        }
    else:
        raise HTTPException(
            status_code=500,
            detail="Account created but failed to send verification email. Please contact support."
        )

@app.post("/api/verify-email", response_model=dict)
async def verify_email(verification_data: EmailVerification):
    user = users_db.get(verification_data.email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if user["is_verified"]:
        raise HTTPException(
            status_code=400,
            detail="Email already verified"
        )
    
    stored_code = verification_codes.get(verification_data.email)
    if not stored_code or stored_code != verification_data.verification_code:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code"
        )
    
    users_db[verification_data.email]["is_verified"] = True
    
    if verification_data.email in verification_codes:
        del verification_codes[verification_data.email]
    
    return {"message": "Email verified successfully! You can now log in."}

@app.post("/api/login", response_model=Token)
async def login(user_data: UserLogin):
    user = users_db.get(user_data.email)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    if not user["is_verified"]:
        raise HTTPException(
            status_code=400,
            detail="Please verify your email before logging in"
        )
    
    if not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    user_response = User(
        id=user["id"],
        email=user["email"],
        is_verified=user["is_verified"],
        created_at=user["created_at"]
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@app.get("/api/dashboard")
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    return {
        "message": f"Welcome to your dashboard, {current_user['email']}!",
        "user": {
            "id": current_user["id"],
            "email": current_user["email"],
            "is_verified": current_user["is_verified"],
            "created_at": current_user["created_at"]
        }
    }

@app.get("/api/users")
async def list_users():
    return {
        "users": [
            {
                "id": user["id"],
                "email": user["email"],
                "is_verified": user["is_verified"],
                "created_at": user["created_at"]
            }
            for user in users_db.values()
        ],
        "total": len(users_db)
    }
