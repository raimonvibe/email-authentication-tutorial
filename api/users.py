from .shared import users_db

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
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                "users": [
                    {
                        "id": user["id"],
                        "email": user["email"],
                        "is_verified": user["is_verified"],
                        "created_at": user["created_at"].isoformat()
                    }
                    for user in users_db.values()
                ],
                "total": len(users_db)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"detail": str(e)})
        }
