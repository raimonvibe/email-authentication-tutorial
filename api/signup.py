from http.server import BaseHTTPRequestHandler
from pydantic import BaseModel, EmailStr
from datetime import datetime
import os
import json
import urllib.request
import urllib.parse
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
            
            email_sent = self.send_verification_email(user_data.email, verification_code)
            
            if email_sent:
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "message": "Account created successfully! Please check your email for the verification code.",
                    "user_id": user_id
                }).encode())
            else:
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "detail": "Account created but failed to send verification email. Please contact support."
                }).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"detail": str(e)}).encode())
    
    def send_verification_email(self, email, verification_code):
        """Send verification email via Formspree"""
        try:
            formspree_api_key = os.getenv('FORMSPREE_API_KEY')
            print(f"DEBUG: FORMSPREE_API_KEY = {formspree_api_key}")
            if not formspree_api_key:
                print("Warning: FORMSPREE_API_KEY not found in environment variables")
                return False
            
            if formspree_api_key.startswith('https://'):
                formspree_endpoint = formspree_api_key
            else:
                formspree_endpoint = f'https://formspree.io/f/{formspree_api_key}'
            
            print(f"DEBUG: Formspree endpoint = {formspree_endpoint}")
            
            email_data = {
                'email': email,
                'message': f'Your verification code is: {verification_code}'
            }
            
            print(f"DEBUG: Email data = {email_data}")
            
            data = urllib.parse.urlencode(email_data).encode('utf-8')
            req = urllib.request.Request(formspree_endpoint, data=data)
            req.add_header('Content-Type', 'application/x-www-form-urlencoded')
            req.add_header('Accept', 'application/json')
            
            print(f"DEBUG: Request headers = {dict(req.headers)}")
            print(f"DEBUG: Request data = {data}")
            
            with urllib.request.urlopen(req) as response:
                response_data = response.read().decode('utf-8')
                print(f"DEBUG: Response status = {response.status}")
                print(f"DEBUG: Response data = {response_data}")
                if response.status == 200:
                    print(f"Verification email sent successfully to {email}")
                    return True
                else:
                    print(f"Failed to send email. Status: {response.status}, Response: {response_data}")
                    return False
                    
        except Exception as e:
            print(f"Error sending verification email: {str(e)}")
            print(f"DEBUG: Exception type = {type(e)}")
            import traceback
            print(f"DEBUG: Traceback = {traceback.format_exc()}")
            return False
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
