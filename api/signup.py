from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
from .shared import users_db, verification_codes, hash_password, generate_verification_code

app = FastAPI()

class UserSignup(BaseModel):
    email: EmailStr
    password: str

def handler(request):
    import json
    
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            'body': ''
        }
    
    try:
        body = json.loads(request.get('body', '{}'))
        user_data = UserSignup(**body)
        
        if user_data.email in users_db:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({"detail": "User with this email already exists"})
            }
        
        if len(user_data.password) < 6:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({"detail": "Password must be at least 6 characters long"})
            }
        
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
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                "message": "Account created successfully! Use verification code: " + verification_code,
                "user_id": user_id,
                "verification_code": verification_code
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"detail": str(e)})
        }
