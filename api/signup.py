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
                existing_user = users_db[user_data.email]
                if existing_user["is_verified"]:
                    self.send_response(400)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"detail": "User with this email already exists"}).encode())
                    return
                else:
                    print(f"DEBUG: User {user_data.email} exists but not verified, allowing resend")
                    verification_code = generate_verification_code()
                    users_db[user_data.email]["verification_code"] = verification_code
                    verification_codes[user_data.email] = verification_code
                    
                    email_sent = self.send_verification_email(user_data.email, verification_code)
                    
                    if email_sent:
                        self.send_response(200)
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            "message": "Verification email resent! Please check your email for the new verification code.",
                            "user_id": existing_user["id"]
                        }).encode())
                    else:
                        self.send_response(500)
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            "detail": "Failed to resend verification email. Please contact support."
                        }).encode())
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
            
            user_id = f"user_{int(datetime.utcnow().timestamp() * 1000000)}"
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
                print("ERROR: Email sending failed - check Brevo configuration")
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "detail": "Account created but email verification failed. Please check your Brevo configuration or contact support."
                }).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"detail": str(e)}).encode())
    
    def send_verification_email(self, email, verification_code):
        """Send verification email via Brevo (formerly SendInBlue)"""
        try:
            brevo_api_key = None
            
            brevo_api_key = (
                os.getenv('BREVO_API_KEY') or 
                os.environ.get('BREVO_API_KEY') or
                os.getenv('brevo_api_key') or
                os.environ.get('brevo_api_key')
            )
            print(f"DEBUG: Method 1 - BREVO_API_KEY = {brevo_api_key}")
            
            if not brevo_api_key:
                for key_name in ['BREVO_API_KEY', 'brevo_api_key', 'Brevo_Api_Key']:
                    brevo_api_key = os.environ.get(key_name)
                    if brevo_api_key:
                        print(f"DEBUG: Method 2 - Found {key_name} = {brevo_api_key}")
                        break
            
            if not brevo_api_key:
                try:
                    import subprocess
                    result = subprocess.run(['printenv', 'BREVO_API_KEY'], capture_output=True, text=True)
                    if result.returncode == 0 and result.stdout.strip():
                        brevo_api_key = result.stdout.strip()
                        print(f"DEBUG: Method 3 - Found BREVO_API_KEY via printenv: {brevo_api_key}")
                except Exception as e:
                    print(f"DEBUG: Method 3 - printenv attempt failed: {e}")
            
            if not brevo_api_key:
                print("ERROR: BREVO_API_KEY not found in environment variables")
                print(f"DEBUG: Available env vars: {list(os.environ.keys())}")
                return False
            
            brevo_endpoint = 'https://api.brevo.com/v3/smtp/email'
            
            email_payload = {
                "sender": {
                    "email": os.getenv("BREVO_SENDER_EMAIL", "info@raimonvibe.com"),
                    "name": os.getenv("BREVO_SENDER_NAME", "Raimon Vibe")
                },
                "to": [
                    {
                        "email": email,
                        "name": "User"
                    }
                ],
                "subject": "Email Verification Code",
                "htmlContent": f"<html><body><p>Your verification code is: <strong>{verification_code}</strong></p><p>Please enter this code to verify your email address.</p></body></html>"
            }
            
            print(f"DEBUG: Brevo endpoint = {brevo_endpoint}")
            print(f"DEBUG: Email payload = {email_payload}")
            
            import json
            data = json.dumps(email_payload).encode('utf-8')
            req = urllib.request.Request(brevo_endpoint, data=data, method='POST')
            req.add_header('Content-Type', 'application/json')
            req.add_header('api-key', brevo_api_key)
            req.add_header('accept', 'application/json')
            req.add_header('User-Agent', 'Mozilla/5.0 (compatible; EmailAuthTutorial/1.0)')
            
            print(f"DEBUG: Request headers = {dict(req.headers)}")
            
            with urllib.request.urlopen(req) as response:
                response_data = response.read().decode('utf-8')
                print(f"DEBUG: Response status = {response.status}")
                print(f"DEBUG: Response data = {response_data}")
                if response.status == 201:  # Brevo returns 201 for successful email sending
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
