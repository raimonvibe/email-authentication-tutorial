from fastapi import HTTPException
from pydantic import BaseModel, EmailStr
from .shared import users_db, verification_codes

class EmailVerification(BaseModel):
    email: EmailStr
    verification_code: str

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
        verification_data = EmailVerification(**body)
        
        user = users_db.get(verification_data.email)
        if not user:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({"detail": "User not found"})
            }
        
        if user["is_verified"]:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({"detail": "Email already verified"})
            }
        
        stored_code = verification_codes.get(verification_data.email)
        if not stored_code or stored_code != verification_data.verification_code:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({"detail": "Invalid verification code"})
            }
        
        users_db[verification_data.email]["is_verified"] = True
        
        if verification_data.email in verification_codes:
            del verification_codes[verification_data.email]
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"message": "Email verified successfully! You can now log in."})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"detail": str(e)})
        }
