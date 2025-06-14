from http.server import BaseHTTPRequestHandler
from .shared import users_db

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        import json
        
        try:
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
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
            }).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"detail": str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
