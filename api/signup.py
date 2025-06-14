from http.server import BaseHTTPRequestHandler
from pydantic import BaseModel, EmailStr
from datetime import datetime
from .shared import users_db, verification_codes, hash_password, generate_verification_code

class UserSignup(BaseModel):
    email: EmailStr
    password: str

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        import json
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            user_data = UserSignup(**json.loads(body))
            
            if user_data.email in users_db:
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"detail": "User with this email already exists"}).encode())
                return
            
            if len(user_data.password) < 6:
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"detail": "Password must be at least 6 characters long"}).encode())
                return
            
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
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "message": "Account created successfully! Use verification code: " + verification_code,
                "user_id": user_id,
                "verification_code": verification_code
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
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
