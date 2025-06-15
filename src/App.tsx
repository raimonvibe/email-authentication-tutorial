import React, { useState } from 'react'
import { Shield, Copy, AlertCircle, User, LogOut, Eye, EyeOff } from 'lucide-react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Alert, AlertDescription } from './components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'

interface User {
  id: string
  email: string
  is_verified: boolean
  created_at: string
}

interface SignupForm {
  email: string
  password: string
}

interface LoginForm {
  email: string
  password: string
}

const CodeBlock: React.FC<{ language: string; id: string; code: string }> = ({ language, code }) => {
  const [isVisible, setIsVisible] = useState(true)
  
  const getLanguageAccentColor = (language: string) => {
    const colors: Record<string, string> = {
      python: 'text-blue-400',
      javascript: 'text-yellow-400',
      bash: 'text-green-400',
    }
    return colors[language] || 'text-gray-400'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 my-8 overflow-hidden border-2 border-gray-600 shadow-2xl">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-600">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className={`text-sm ml-3 ${getLanguageAccentColor(language)}`}>{language}</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsVisible(!isVisible)}
            variant="outline"
            size="sm"
            className="text-gray-400 hover:text-white border-gray-600 hover:border-gray-400"
          >
            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => copyToClipboard(code)}
            variant="outline"
            size="sm"
            className="text-gray-400 hover:text-white border-gray-600 hover:border-gray-400"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {isVisible && (
        <pre className="text-sm text-gray-300 overflow-x-auto">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}

function App() {
  const [signupForm, setSignupForm] = useState<SignupForm>({ email: '', password: '' })
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' })
  const [verificationCode, setVerificationCode] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<"tutorial" | "auth" | "verify" | "dashboard">("tutorial")
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupForm),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage('Account created! Check your email for verification code.')
        setCurrentView('verify')
      } else {
        setMessage(data.detail || 'Signup failed')
      }
    } catch (error) {
      setMessage('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupForm.email,
          verification_code: verificationCode,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage('Email verified successfully! You can now log in.')
        setCurrentView('auth')
      } else {
        setMessage(data.detail || 'Verification failed')
      }
    } catch (error) {
      setMessage('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setUser(data.user)
        localStorage.setItem('token', data.access_token)
        setMessage('Login successful!')
        setCurrentView('dashboard')
      } else {
        setMessage(data.detail || 'Login failed')
      }
    } catch (error) {
      setMessage('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    setCurrentView('tutorial')
    setMessage('Logged out successfully')
    setSignupForm({ email: '', password: '' })
    setLoginForm({ email: '', password: '' })
    setVerificationCode('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Email Authentication Tutorial
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Learn to build secure email-based authentication with FastAPI and React. 
            Complete with JWT tokens, email verification, and production-ready security practices.
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "tutorial" | "auth" | "verify" | "dashboard")} className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="tutorial" className="text-white">Tutorial</TabsTrigger>
              <TabsTrigger value="auth" className="text-white">Demo</TabsTrigger>
              <TabsTrigger value="verify" className="text-white" disabled={!signupForm.email}>Verify</TabsTrigger>
              <TabsTrigger value="dashboard" className="text-white" disabled={!user}>Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="tutorial" className="mt-8">
              <div className="grid gap-8">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                      <div>
                        <CardTitle className="text-blue-400">Project Setup</CardTitle>
                        <CardDescription className="text-gray-400">Initialize your authentication project</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 p-6 rounded-xl border border-blue-700/30">
                      <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Frontend Setup (React + TypeScript)
                      </h4>
                      <p className="text-gray-300 text-sm mb-4">Create a new React project with TypeScript and Vite:</p>
                      <CodeBlock
                        language="bash"
                        id="frontend-setup"
                        code={`npm create vite@latest email-auth-frontend -- --template react-ts
cd email-auth-frontend
npm install
npm install lucide-react @radix-ui/react-tabs @radix-ui/react-alert-dialog
npm run dev`}
                      />
                    </div>

                    <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 p-6 rounded-xl border border-green-700/30">
                      <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Backend Setup (FastAPI)
                      </h4>
                      <p className="text-gray-300 text-sm mb-4">Set up the FastAPI backend with required dependencies:</p>
                      <CodeBlock
                        language="bash"
                        id="backend-setup"
                        code={`mkdir auth-backend && cd auth-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install fastapi uvicorn python-jose[cryptography] bcrypt python-multipart
pip install python-decouple pydantic[email] requests
mkdir app && touch app/__init__.py app/main.py`}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                      <div>
                        <CardTitle className="text-green-400">Environment Configuration</CardTitle>
                        <CardDescription className="text-gray-400">Set up environment variables and configuration</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-6 rounded-xl border border-green-700/30">
                      <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Backend Environment (.env)
                      </h4>
                      <p className="text-gray-300 text-sm mb-4">Create <code className="bg-gray-800 px-2 py-1 rounded">auth-backend/.env</code>:</p>
                      <CodeBlock
                        language="bash"
                        id="backend-env"
                        code={`SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=info@raimonvibe.com
BREVO_SENDER_NAME=Raimon Vibe`}
                      />
                    </div>

                    <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-6 rounded-xl border border-blue-700/30">
                      <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Frontend Environment (.env)
                      </h4>
                      <p className="text-gray-300 text-sm mb-4">Create <code className="bg-gray-800 px-2 py-1 rounded">.env</code> in your React project:</p>
                      <CodeBlock
                        language="bash"
                        id="frontend-env"
                        code={`VITE_API_BASE_URL=http://localhost:8001`}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                      <div>
                        <CardTitle className="text-yellow-400">Choose Your Backend Approach</CardTitle>
                        <CardDescription className="text-gray-400">Select between FastAPI server or Vercel serverless functions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-700/30">
                      <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        🚀 Approach 1: FastAPI Backend (Recommended for Learning)
                      </h4>
                      <p className="text-gray-300 text-sm mb-4">
                        <strong>Best for:</strong> Learning, local development, traditional hosting<br/>
                        <strong>Deployment:</strong> VPS, cloud instances, Docker containers<br/>
                        <strong>Pros:</strong> Full control, easier debugging, comprehensive features
                      </p>
                      <div className="bg-green-900/20 p-3 rounded border border-green-700/30">
                        <p className="text-green-300 text-sm">✅ This tutorial focuses on the FastAPI approach - continue with the sections below</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 p-6 rounded-xl border border-orange-700/30">
                      <h4 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        ⚡ Approach 2: Vercel Serverless Functions (Advanced)
                      </h4>
                      <p className="text-gray-300 text-sm mb-4">
                        <strong>Best for:</strong> Production deployment, auto-scaling, minimal infrastructure<br/>
                        <strong>Deployment:</strong> Vercel, Netlify, AWS Lambda<br/>
                        <strong>Pros:</strong> Zero server management, automatic scaling, cost-effective
                      </p>
                      <div className="bg-orange-900/20 p-3 rounded border border-orange-700/30">
                        <p className="text-orange-300 text-sm">📁 Alternative implementation available in <code className="bg-gray-800 px-2 py-1 rounded">api/</code> directory</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                      <div>
                        <CardTitle className="text-purple-400">FastAPI Authentication Implementation</CardTitle>
                        <CardDescription className="text-gray-400">Build the complete authentication system with FastAPI</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 p-6 rounded-xl border border-yellow-700/30">
                      <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        Core Authentication Models
                      </h4>
                      <p className="text-gray-300 text-sm mb-4">Define Pydantic models for authentication:</p>
                      <CodeBlock
                        language="python"
                        id="auth-models"
                        code={`from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserSignup(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmailVerification(BaseModel):
    email: EmailStr
    verification_code: str

class UserResponse(BaseModel):
    id: str
    email: str
    is_verified: bool
    created_at: datetime`}
                      />
                    </div>

                    <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-6 rounded-xl border border-purple-700/30">
                      <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        Password Hashing & JWT Utilities
                      </h4>
                      <p className="text-gray-300 text-sm mb-4">Implement secure password hashing and JWT token generation:</p>
                      <CodeBlock
                        language="python"
                        id="auth-utils"
                        code={`import bcrypt
import secrets
from datetime import datetime, timedelta
from jose import jwt
from typing import Optional

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_verification_code() -> str:
    return str(secrets.randbelow(90000) + 10000)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)`}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">5</div>
                      <div>
                        <CardTitle className="text-red-400">Testing Your Implementation</CardTitle>
                        <CardDescription className="text-gray-400">Verify everything works correctly</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-4 rounded-lg border border-orange-500/30">
                      <h4 className="text-orange-400 font-semibold mb-2">Testing Steps</h4>
                      <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                        <li>Start your chosen backend (FastAPI or Vercel)</li>
                        <li>Start the React frontend with <code className="bg-gray-800 px-2 py-1 rounded">npm run dev</code></li>
                        <li>Test user registration with email verification</li>
                        <li>Test login with verified account</li>
                        <li>Test error cases (invalid credentials, unverified email)</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="auth" className="mt-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-purple-400">Authentication Demo</CardTitle>
                  <CardDescription className="text-gray-400">Test the authentication system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {message && (
                    <Alert className="bg-blue-900/20 border-blue-700/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-blue-300">{message}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Sign Up</h3>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <Button onClick={handleSignup} disabled={isLoading} className="w-full">
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Log In</h3>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <Button onClick={handleLogin} disabled={isLoading} className="w-full">
                        {isLoading ? 'Logging In...' : 'Log In'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verify" className="mt-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Email Verification</CardTitle>
                  <CardDescription className="text-gray-400">Enter the 5-digit code sent to your email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {message && (
                    <Alert className="bg-blue-900/20 border-blue-700/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-blue-300">{message}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Enter 5-digit verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white text-center text-2xl tracking-widest"
                      maxLength={5}
                    />
                    <Button onClick={handleVerification} disabled={isLoading} className="w-full">
                      {isLoading ? 'Verifying...' : 'Verify Email'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard" className="mt-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Dashboard</CardTitle>
                  <CardDescription className="text-gray-400">Welcome to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {user && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-green-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-white">{user.email}</h3>
                          <p className="text-gray-400">Account verified: {user.is_verified ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-white font-semibold mb-2">Account Details</h4>
                        <p className="text-gray-300">User ID: {user.id}</p>
                        <p className="text-gray-300">Created: {new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                      <Button onClick={handleLogout} variant="outline" className="w-full">
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default App
