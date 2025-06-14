from http.server import BaseHTTPRequestHandler
from .shared import users_db, get_current_user_from_token

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        import json
        
        try:
            auth_header = self.headers.get('authorization') or self.headers.get('Authorization')
            
            if not auth_header or not auth_header.startswith('Bearer '):
                self.send_response(401)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"detail": "Could not validate credentials"}).encode())
                return
            
            token = auth_header.split(' ')[1]
            current_user = get_current_user_from_token(token)
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "message": f"Welcome to your dashboard, {current_user['email']}!",
                "user": {
                    "id": current_user["id"],
                    "email": current_user["email"],
                    "is_verified": current_user["is_verified"],
                    "created_at": current_user["created_at"].isoformat()
                }
            }).encode())
            
        except Exception as e:
            self.send_response(401)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"detail": "Could not validate credentials"}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
