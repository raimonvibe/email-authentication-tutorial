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
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
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
    
    return {
        "message": "Account created successfully! Use verification code: " + verification_code,
        "user_id": user_id,
        "verification_code": verification_code
    }

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
