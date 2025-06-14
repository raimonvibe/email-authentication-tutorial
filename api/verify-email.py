from http.server import BaseHTTPRequestHandler
from pydantic import BaseModel, EmailStr
from .shared import users_db, verification_codes

class EmailVerification(BaseModel):
    email: EmailStr
    verification_code: str

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        import json
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            verification_data = EmailVerification(**json.loads(body))
            
            user = users_db.get(verification_data.email)
            if not user:
                self.send_response(404)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"detail": "User not found"}).encode())
                return
            
            if user["is_verified"]:
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"detail": "Email already verified"}).encode())
                return
            
            stored_code = verification_codes.get(verification_data.email)
            if not stored_code or stored_code != verification_data.verification_code:
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"detail": "Invalid verification code"}).encode())
                return
            
            users_db[verification_data.email]["is_verified"] = True
            
            if verification_data.email in verification_codes:
                del verification_codes[verification_data.email]
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Email verified successfully! You can now log in."}).encode())
            
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
