from http.server import BaseHTTPRequestHandler
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

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        import json
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            user_data = UserLogin(**json.loads(body))
            
            user = users_db.get(user_data.email)
            if not user:
                self.send_response(401)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"detail": "Invalid email or password"}).encode())
                return
            
            if not user["is_verified"]:
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"detail": "Please verify your email before logging in"}).encode())
                return
            
            if not verify_password(user_data.password, user["password"]):
                self.send_response(401)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"detail": "Invalid email or password"}).encode())
                return
            
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
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "access_token": access_token,
                "token_type": "bearer",
                "user": user_response
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
