from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from .shared import users_db, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    is_verified: bool
    created_at: datetime

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
        user_data = UserLogin(**body)
        
        user = users_db.get(user_data.email)
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({"detail": "Invalid email or password"})
            }
        
        if not user["is_verified"]:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({"detail": "Please verify your email before logging in"})
            }
        
        if not verify_password(user_data.password, user["password"]):
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({"detail": "Invalid email or password"})
            }
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        user_response = {
            "id": user["id"],
            "email": user["email"],
            "is_verified": user["is_verified"],
            "created_at": user["created_at"].isoformat()
        }
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                "access_token": access_token,
                "token_type": "bearer",
                "user": user_response
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"detail": str(e)})
        }
