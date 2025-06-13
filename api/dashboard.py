from .shared import users_db, get_current_user_from_token

def handler(request):
    import json
    
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            'body': ''
        }
    
    try:
        headers = request.get('headers', {})
        auth_header = headers.get('authorization') or headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({"detail": "Could not validate credentials"})
            }
        
        token = auth_header.split(' ')[1]
        current_user = get_current_user_from_token(token)
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                "message": f"Welcome to your dashboard, {current_user['email']}!",
                "user": {
                    "id": current_user["id"],
                    "email": current_user["email"],
                    "is_verified": current_user["is_verified"],
                    "created_at": current_user["created_at"].isoformat()
                }
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"detail": "Could not validate credentials"})
        }
