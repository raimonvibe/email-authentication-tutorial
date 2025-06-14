import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Copy, Mail, Lock, Shield, Code, CheckCircle, User, Eye, EyeOff } from 'lucide-react'
import './App.css'

interface User {
  id: string
  email: string
  is_verified: boolean
  created_at: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<'tutorial' | 'auth' | 'verify' | 'dashboard'>('tutorial')
  const [pendingEmail, setPendingEmail] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: ''
  })
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const toggleCodeVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupForm),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed')
      }
      
      setPendingEmail(signupForm.email)
      setMessage(`Account created! Verification code: ${data.verification_code}`)
      setCurrentView('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingEmail,
          verification_code: verificationCode
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Verification failed')
      }
      
      setMessage('Email verified successfully! You can now log in.')
      setCurrentView('auth')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed')
      }
      
      setUser(data.user)
      localStorage.setItem('token', data.access_token)
      setCurrentView('dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    setCurrentView('tutorial')
    setSignupForm({ email: '', password: '' })
    setLoginForm({ email: '', password: '' })
    setVerificationCode('')
    setPendingEmail('')
    setMessage('')
    setError('')
  }

  const getLanguageAccentColor = (language: string) => {
    if (language.toLowerCase().includes('html')) return 'from-green-600 to-green-700'
    if (language.toLowerCase().includes('react') || language.toLowerCase().includes('tsx') || language.toLowerCase().includes('typescript')) return 'from-blue-600 to-blue-700'
    if (language.toLowerCase().includes('css')) return 'from-pink-600 to-pink-700'
    if (language.toLowerCase().includes('python') || language.toLowerCase().includes('py')) return 'from-orange-600 to-orange-700'
    if (language.toLowerCase().includes('javascript') || language.toLowerCase().includes('js')) return 'from-yellow-600 to-yellow-700'
    return 'from-purple-600 to-purple-700'
  }

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative bg-gray-900 rounded-xl p-6 my-8 overflow-hidden border-2 border-gray-600 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 rounded-xl"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-600">
          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary" 
              className={`bg-gradient-to-r ${getLanguageAccentColor(language)} text-white px-3 py-1 text-sm font-medium shadow-lg`}
            >
              {language}
            </Badge>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(code, id)}
            className="text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200 rounded-lg px-3 py-2"
          >
            {copiedCode === id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-100 leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Email Auth Tutorial
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Learn how to build complete email signup and login functionality with email verification using Formspree. 
            Perfect for beginners who want to understand authentication from frontend to backend.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Badge className="bg-green-600 text-white px-3 py-1">Beginner Friendly</Badge>
            <Badge className="bg-blue-600 text-white px-3 py-1">Step by Step</Badge>
            <Badge className="bg-pink-600 text-white px-3 py-1">Code Examples</Badge>
          </div>
        </header>

        <div className="flex justify-center mb-8">
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "tutorial" | "auth" | "verify" | "dashboard")} className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="tutorial" className="text-white">Tutorial</TabsTrigger>
              <TabsTrigger value="auth" className="text-white">Demo</TabsTrigger>
              <TabsTrigger value="verify" className="text-white" disabled={!pendingEmail}>Verify</TabsTrigger>
              <TabsTrigger value="dashboard" className="text-white" disabled={!user}>Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="tutorial" className="mt-8">
              <div className="grid gap-8">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">0</div>
                      <CardTitle className="text-2xl text-white">Project Setup from Scratch</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                      Complete beginner guide: Install Node.js, create React project, set up file structure, and copy code
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                      <h4 className="text-yellow-300 font-medium mb-2">📋 Prerequisites</h4>
                      <p className="text-yellow-100 text-sm">This tutorial will guide you through creating this project from scratch. No prior experience required!</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-medium text-lg">Step 1: Install Node.js</h4>
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-sm mb-3">First, install Node.js on your computer:</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                          <li>Go to <span className="text-blue-400">https://nodejs.org</span></li>
                          <li>Download the LTS (Long Term Support) version</li>
                          <li>Run the installer and follow the setup wizard</li>
                          <li>Open terminal/command prompt and verify installation:</li>
                        </ol>
                        <div className="mt-3 bg-black p-3 rounded border">
                          <code className="text-green-400 text-sm">
                            node --version<br/>
                            npm --version
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-medium text-lg">Step 2: Create Project Directory</h4>
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-sm mb-3">Create a new directory for your project:</p>
                        <div className="bg-black p-3 rounded border">
                          <code className="text-green-400 text-sm">
                            mkdir email-auth-tutorial<br/>
                            cd email-auth-tutorial
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-medium text-lg">Step 3: Create Backend (Vercel Serverless)</h4>
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-sm mb-3">Set up the Python serverless functions:</p>
                        <div className="bg-black p-3 rounded border mb-3">
                          <code className="text-green-400 text-sm">
                            mkdir api<br/>
                            pip install pydantic bcrypt python-jose
                          </code>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">Create the serverless function structure:</p>
                        <div className="bg-black p-3 rounded border">
                          <code className="text-gray-400 text-sm">
                            api/<br/>
                            ├── signup.py<br/>
                            ├── verify-email.py<br/>
                            ├── login.py<br/>
                            └── shared.py
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-medium text-lg">Step 4: Set up Frontend Dependencies</h4>
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-sm mb-3">Install the required React dependencies:</p>
                        <div className="bg-black p-3 rounded border mb-3">
                          <code className="text-green-400 text-sm">
                            npm install<br/>
                            npm install @radix-ui/react-tabs @radix-ui/react-label lucide-react
                          </code>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">Your project structure should now look like:</p>
                        <div className="bg-black p-3 rounded border">
                          <code className="text-gray-400 text-sm">
                            email-auth-tutorial/<br/>
                            ├── api/<br/>
                            │   ├── signup.py<br/>
                            │   ├── verify-email.py<br/>
                            │   ├── login.py<br/>
                            │   └── shared.py<br/>
                            ├── src/<br/>
                            │   ├── App.tsx<br/>
                            │   └── components/<br/>
                            ├── vercel.json<br/>
                            └── package.json
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-medium text-lg">Step 5: Copy Backend Code</h4>
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-sm mb-3">Create the Vercel serverless functions in the <code className="bg-gray-800 px-2 py-1 rounded">api/</code> directory. Copy the Python code from the sections below to create <code className="bg-gray-800 px-2 py-1 rounded">api/signup.py</code>, <code className="bg-gray-800 px-2 py-1 rounded">api/verify-email.py</code>, and <code className="bg-gray-800 px-2 py-1 rounded">api/login.py</code>.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-medium text-lg">Step 6: Copy Frontend Code</h4>
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-sm mb-3">Replace <code className="bg-gray-800 px-2 py-1 rounded">src/App.tsx</code> with the React code from the sections below, or create separate component files as shown in the code examples.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-medium text-lg">Step 5: Set up Environment Variables</h4>
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-sm mb-3">Configure Formspree for email verification:</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                          <li>Create a free account at <span className="text-blue-400">https://formspree.io</span></li>
                          <li>Create a new form and copy the Form ID</li>
                          <li>In Vercel dashboard, add environment variable: <code className="bg-gray-800 px-2 py-1 rounded">FORMSPREE_API_KEY</code></li>
                          <li>The system handles duplicate users by allowing verification code resending for unverified accounts</li>
                        </ol>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-medium text-lg">Step 6: Copy Serverless Functions</h4>
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-sm mb-3">Create the Vercel serverless functions in the <code className="bg-gray-800 px-2 py-1 rounded">api/</code> directory. Copy the Python code from the sections below to create <code className="bg-gray-800 px-2 py-1 rounded">api/signup.py</code>, <code className="bg-gray-800 px-2 py-1 rounded">api/verify-email.py</code>, and <code className="bg-gray-800 px-2 py-1 rounded">api/login.py</code>.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-medium text-lg">Step 7: Copy Frontend Code</h4>
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-sm mb-3">Replace <code className="bg-gray-800 px-2 py-1 rounded">src/App.tsx</code> with the React code from the sections below, or create separate component files as shown in the code examples.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-medium text-lg">Step 8: Run Your Application</h4>
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 text-sm mb-3">Start both servers:</p>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-white mb-2">Development Server:</p>
                            <div className="bg-black p-3 rounded border">
                              <code className="text-green-400 text-sm">
                                npm run dev
                              </code>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white mb-2">For Production (Vercel):</p>
                            <div className="bg-black p-3 rounded border">
                              <code className="text-green-400 text-sm">
                                npm run build<br/>
                                vercel --prod
                              </code>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 bg-green-900/20 border border-green-700 rounded p-3">
                          <p className="text-green-300 text-sm">
                            ✅ Your app will be available at <code className="bg-green-800 px-2 py-1 rounded">http://localhost:5173</code><br/>
                            ✅ Serverless API functions will be available at <code className="bg-green-800 px-2 py-1 rounded">http://localhost:5173/api/*</code>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                      <CardTitle className="text-2xl text-white">Introduction: What You'll Learn</CardTitle>
                    </div>
                  </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                In this tutorial, you'll learn how to create a complete email authentication system that includes:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-purple-400">Frontend Components</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Signup form with validation</li>
                    <li>• Login form with error handling</li>
                    <li>• Email verification page</li>
                    <li>• Protected dashboard</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-blue-400">Backend Logic</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• User registration endpoint</li>
                    <li>• Password hashing with bcrypt</li>
                    <li>• JWT token generation</li>
                    <li>• Email verification flow</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 rounded-lg border border-purple-500/30">
                <h4 className="text-lg font-semibold text-pink-400 mb-2">🎯 Key Learning Outcome</h4>
                <p className="text-sm">
                  You'll understand how the signup process creates a user account that enables the login functionality, 
                  how email verification ensures secure account activation, and how the system handles duplicate users 
                  by allowing verification code resending for unverified accounts.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Code className="w-6 h-6" />
                  Frontend: Signup Form
                </CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Create a beautiful signup form that collects user information and handles validation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-6 rounded-xl border border-green-700/30">
                <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  HTML Structure
                </h4>
                <p className="text-gray-300 text-sm mb-4">Basic HTML form structure for user signup:</p>
                <CodeBlock
                  language="HTML"
                  id="signup-html"
                  code={`<form id="signupForm" class="signup-form">
  <div class="form-group">
    <label for="email">Email Address</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div class="form-group">
    <label for="password">Password</label>
    <input type="password" id="password" name="password" required>
  </div>
  
  <div class="form-group">
    <label for="confirmPassword">Confirm Password</label>
    <input type="password" id="confirmPassword" name="confirmPassword" required>
  </div>
  
  <button type="submit" class="signup-btn">Create Account</button>
</form>`}
                />
              </div>

              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-6 rounded-xl border border-blue-700/30">
                <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  React Component Implementation
                </h4>
                <p className="text-gray-300 text-sm mb-4">Create <code className="bg-gray-800 px-2 py-1 rounded">src/components/SignupForm.tsx</code> with full validation logic:</p>
                <CodeBlock
                  language="src/components/SignupForm.tsx"
                  id="signup-react"
                  code={`import { useState } from 'react';

function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      if (response.ok) {
        alert('Account created! Check your email for verification.');
      } else {
        const error = await response.json();
        setErrors({ submit: error.message });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={errors.confirmPassword ? 'error' : ''}
        />
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
      </div>
      
      {errors.submit && <div className="error-text">{errors.submit}</div>}
      
      <button type="submit" disabled={isLoading} className="signup-btn">
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}`}
                />
              </div>

              <div className="bg-gradient-to-r from-pink-900/20 to-rose-900/20 p-6 rounded-xl border border-pink-700/30">
                <h4 className="text-lg font-semibold text-pink-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  CSS Styling
                </h4>
                <p className="text-gray-300 text-sm mb-4">Complete CSS styles for the signup form with modern design:</p>
                <CodeBlock
                  language="CSS"
                  id="signup-css"
                  code={`.signup-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: #1f2937;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #e5e7eb;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #374151;
  border-radius: 8px;
  background: #111827;
  color: #e5e7eb;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.signup-btn {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.signup-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
}

.signup-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  Frontend: Login Form
                </CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Build the login form that authenticates users after they've completed signup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 p-6 rounded-xl border border-blue-700/30">
                <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  React Login Component
                </h4>
                <p className="text-gray-300 text-sm mb-4">Create <code className="bg-gray-800 px-2 py-1 rounded">src/components/LoginForm.tsx</code> with authentication logic:</p>
                <CodeBlock
                  language="src/components/LoginForm.tsx"
                  id="login-react"
                  code={`import { useState } from 'react';

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        setErrors({ submit: data.message || 'Login failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      
      {errors.submit && <div className="error-text">{errors.submit}</div>}
      
      <button type="submit" disabled={isLoading} className="login-btn">
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
      
      <p className="signup-link">
        Don't have an account? <a href="/signup">Sign up here</a>
      </p>
    </form>
  );
}`}
                />
              </div>

              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-4 rounded-lg border border-blue-500/30">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">🔑 How Login Works After Signup</h4>
                <p className="text-sm text-gray-300">
                  The login form can only authenticate users who have completed the signup process. Here's why:
                </p>
                <ul className="text-sm text-gray-300 mt-2 space-y-1">
                  <li>• Signup creates a user record in the database with hashed password</li>
                  <li>• Email verification confirms the account is active</li>
                  <li>• Login compares the entered password with the stored hash</li>
                  <li>• Successful login generates a JWT token for session management</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  Email Verification with Formspree
                </CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Set up email verification using Formspree to send 5-digit confirmation codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 p-6 rounded-xl border border-pink-700/30">
                <h4 className="text-lg font-semibold text-pink-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  Formspree Setup Guide
                </h4>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <ol className="text-sm text-gray-300 space-y-2">
                    <li>1. Go to <a href="https://formspree.io" className="text-pink-400 hover:underline">formspree.io</a> and create an account</li>
                    <li>2. Create a new form and get your form endpoint URL</li>
                    <li>3. Configure your form to send emails with verification codes</li>
                    <li>4. Use the endpoint in your backend to trigger verification emails</li>
                  </ol>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-6 rounded-xl border border-purple-700/30">
                <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Integration Overview
                </h4>
                <p className="text-gray-400 text-sm mb-3">This section covers frontend email handling. The backend email sending function will be created in the <strong>Backend Logic & Authentication</strong> section below as part of the complete <code className="bg-gray-800 px-2 py-1 rounded">api/shared.py</code> file.</p>
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-300 font-medium">Frontend Focus</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Frontend components for email verification UI</li>
                    <li>• Client-side form handling and validation</li>
                    <li>• API calls to backend verification endpoints</li>
                    <li>• Backend email sending will be handled in Section 5</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 p-6 rounded-xl border border-yellow-700/30">
                <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  Frontend Email Service
                </h4>
                <p className="text-gray-300 text-sm mb-4">Create <code className="bg-gray-800 px-2 py-1 rounded">src/utils/emailService.js</code> for frontend email handling:</p>
                <CodeBlock
                  language="src/utils/emailService.js"
                  id="frontend-email-service"
                  code={`async function sendVerificationEmail(email, verificationCode) {
  const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID';
  
  const emailData = {
    email: email,
    subject: 'Verify Your Account',
    message: 'Your verification code is: ' + verificationCode,
    _replyto: email,
    _subject: 'Account Verification Code'
  };

  try {
    const response = await fetch(formspreeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

export { sendVerificationEmail };`}
                />
              </div>

              <div className="bg-gradient-to-r from-cyan-900/20 to-teal-900/20 p-6 rounded-xl border border-cyan-700/30">
                <h4 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Email Verification Form Component
                </h4>
                <p className="text-gray-300 text-sm mb-4">Create <code className="bg-gray-800 px-2 py-1 rounded">src/components/VerificationForm.tsx</code> for code verification:</p>
                <CodeBlock
                  language="src/components/VerificationForm.tsx"
                  id="verification-form"
                  code={`import { useState } from 'react';

function VerificationForm({ userId }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Email verified successfully! You can now log in.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <h2>Verify Your Email</h2>
      <p>We've sent a 5-digit code to your email address.</p>
      
      <form onSubmit={handleSubmit} className="verification-form">
        <div className="form-group">
          <label htmlFor="code">Verification Code</label>
          <input
            type="text"
            id="code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={5}
            pattern="[0-9]{5}"
            placeholder="12345"
            required
          />
        </div>
        
        {message && (
          <div className={message.includes('successfully') ? 'success-text' : 'error-text'}>
            {message}
          </div>
        )}
        
        <button type="submit" disabled={isLoading} className="verify-btn">
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </div>
  );
}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">5</div>
                <CardTitle className="text-2xl text-white">Backend Logic & Authentication</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Complete backend implementation with password hashing, JWT tokens, and user management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 p-6 rounded-xl border border-orange-700/30">
                <h4 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  Backend Shared Utilities
                </h4>
                <p className="text-gray-300 text-sm mb-4">Create <code className="bg-gray-800 px-2 py-1 rounded">api/shared.py</code> for shared utilities and authentication functions:</p>
                <CodeBlock
                  language="api/shared.py"
                  id="server-setup"
                  code={`import bcrypt
import jwt
from datetime import datetime, timedelta
import random
import string

# Shared utilities for all serverless functions
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"

# In-memory storage (use database in production)
users = {}
verification_codes = {}

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_verification_code() -> str:
    return ''.join(random.choices(string.digits, k=5))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def send_verification_email(email: str, code: str, formspree_key: str) -> bool:
    """Send verification email via Formspree API"""
    import requests
    
    try:
        response = requests.post(
            f"https://formspree.io/f/{formspree_key}",
            json={
                "email": email,
                "subject": "Email Verification Code",
                "message": f"Your verification code is: {code}"
            },
            headers={"Content-Type": "application/json"}
        )
        return response.status_code == 200
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False`}
                />
              </div>

              <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 p-6 rounded-xl border border-red-700/30">
                <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  Login API Endpoint
                </h4>
                <p className="text-gray-300 text-sm mb-4">Create <code className="bg-gray-800 px-2 py-1 rounded">api/login.py</code> for user authentication:</p>
                <CodeBlock
                  language="api/login.py"
                  id="login-endpoint"
                  code={`from http.server import BaseHTTPRequestHandler
import json
from .shared import users, verify_password, create_access_token

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/login':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            email = data.get('email')
            password = data.get('password')
            
            # Check if user exists and is verified
            if email not in users:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {"error": "Invalid credentials"}
                self.wfile.write(json.dumps(response).encode())
                return
            
            user = users[email]
            if not user.get('verified', False):
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {"error": "Please verify your email first"}
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Verify password
            if not verify_password(password, user['password']):
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {"error": "Invalid credentials"}
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Create access token
            access_token = create_access_token({"sub": email})
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user['id'],
                    "email": email,
                    "created_at": user['created_at']
                }
            }
            self.wfile.write(json.dumps(response).encode())

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email before logging in' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/verify-email', async (req, res) => {
  const { userId, verificationCode } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined; // Remove the code
    await user.save();

    res.json({ message: 'Email verified successfully' });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({
      message: 'Welcome to your dashboard!',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});`}
                />
              </div>

              <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-4 rounded-lg border border-orange-500/30">
                <h4 className="text-lg font-semibold text-red-400 mb-2">🔐 Security Best Practices</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Always hash passwords with bcrypt (never store plain text)</li>
                  <li>• Use environment variables for JWT secrets</li>
                  <li>• Implement rate limiting for login attempts</li>
                  <li>• Validate and sanitize all user inputs</li>
                  <li>• Use HTTPS in production</li>
                  <li>• Set appropriate JWT expiration times</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">6</div>
                <CardTitle className="text-2xl text-white">Complete Authentication Flow</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Understanding how all the pieces work together
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-cyan-400">Signup Process</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <span className="text-sm">User fills signup form</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <span className="text-sm">Password gets hashed</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <span className="text-sm">User record created (unverified)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                      <span className="text-sm">Verification email sent via Formspree</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                      <span className="text-sm">User enters 5-digit code</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">6</div>
                      <span className="text-sm">Account becomes verified & active</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-cyan-400">Login Process</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <span className="text-sm">User enters email & password</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <span className="text-sm">System finds user by email</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <span className="text-sm">Checks if account is verified</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                      <span className="text-sm">Compares password with hash</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                      <span className="text-sm">Generates JWT token</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">6</div>
                      <span className="text-sm">User gains access to protected areas</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-6 rounded-lg border border-cyan-500/30">
                <h4 className="text-lg font-semibold text-cyan-400 mb-3">🎯 Key Takeaway: Why Signup Enables Login</h4>
                <p className="text-gray-300 mb-3">
                  The login functionality only works after a successful signup because:
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <h5 className="font-semibold text-white mb-2">Database Requirements:</h5>
                    <ul className="space-y-1">
                      <li>• User record must exist in database</li>
                      <li>• Password must be properly hashed and stored</li>
                      <li>• Account must be marked as verified</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-white mb-2">Security Validation:</h5>
                    <ul className="space-y-1">
                      <li>• Email ownership confirmed via verification</li>
                      <li>• Password complexity requirements met</li>
                      <li>• Account activation completed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-800 to-pink-800 border-purple-600">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white text-center">🎉 Congratulations!</CardTitle>
                    <CardDescription className="text-center text-purple-200">
                      You now understand how to build complete email authentication systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-purple-100">
                      You've learned how to create signup forms, implement login functionality, 
                      integrate email verification, and build secure backend authentication logic.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                      <Badge className="bg-green-600 text-white">Frontend Forms ✓</Badge>
                      <Badge className="bg-blue-600 text-white">Backend Logic ✓</Badge>
                      <Badge className="bg-pink-600 text-white">Email Verification ✓</Badge>
                      <Badge className="bg-purple-600 text-white">Security Best Practices ✓</Badge>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Next Steps:</h4>
                      <ul className="text-sm text-purple-100 space-y-1">
                        <li>• Implement password reset functionality</li>
                        <li>• Add social login options (Google, GitHub)</li>
                        <li>• Build user profile management</li>
                        <li>• Add two-factor authentication</li>
                        <li>• Implement role-based access control</li>
                      </ul>
                    </div>
                    <div className="mt-6">
                      <Button 
                        onClick={() => setCurrentView('auth')} 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Try the Live Demo →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="auth" className="mt-8">
              <Card className="bg-gray-800 border-gray-700 max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl text-white text-center">Authentication Demo</CardTitle>
                  <CardDescription className="text-center text-gray-400">
                    Try the working authentication system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {message && (
                    <div className="bg-green-900/20 border border-green-700 rounded p-3">
                      <p className="text-green-300 text-sm">{message}</p>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-900/20 border border-red-700 rounded p-3">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <Tabs defaultValue="signup" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                      <TabsTrigger value="signup" className="text-white">Sign Up</TabsTrigger>
                      <TabsTrigger value="login" className="text-white">Log In</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signup" className="space-y-4">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-white">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            value={signupForm.email}
                            onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                            className="bg-gray-700 border-gray-600 text-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-white">Password</Label>
                          <div className="relative">
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              value={signupForm.password}
                              onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                              className="bg-gray-700 border-gray-600 text-white pr-10"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                              onClick={toggleCodeVisibility}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                          Create Account
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="login" className="space-y-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email" className="text-white">Email</Label>
                          <Input
                            id="login-email"
                            type="email"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                            className="bg-gray-700 border-gray-600 text-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password" className="text-white">Password</Label>
                          <div className="relative">
                            <Input
                              id="login-password"
                              type={showPassword ? "text" : "password"}
                              value={loginForm.password}
                              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                              className="bg-gray-700 border-gray-600 text-white pr-10"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                              onClick={toggleCodeVisibility}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                          Sign In
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verify" className="mt-8">
              <Card className="bg-gray-800 border-gray-700 max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl text-white text-center">Email Verification</CardTitle>
                  <CardDescription className="text-center text-gray-400">
                    Enter the 5-digit code sent to {pendingEmail}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {message && (
                    <div className="bg-green-900/20 border border-green-700 rounded p-3">
                      <p className="text-green-300 text-sm">{message}</p>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-900/20 border border-red-700 rounded p-3">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleVerification} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verification-code" className="text-white">Verification Code</Label>
                      <Input
                        id="verification-code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white text-center text-2xl tracking-widest"
                        placeholder="12345"
                        maxLength={5}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      Verify Email
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard" className="mt-8">
              <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl text-white text-center">Welcome to Your Dashboard</CardTitle>
                  <CardDescription className="text-center text-gray-400">
                    You have successfully authenticated!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {user && (
                    <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700 rounded-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{user.email}</h3>
                          <p className="text-gray-400">User ID: {user.id}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Status</p>
                          <p className="text-green-400 font-medium">✓ Verified</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Member Since</p>
                          <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <Button onClick={handleLogout} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        
        <footer className="mt-12 sm:mt-16 bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 sm:p-8">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Connect with Raimon</h3>
            <ul className="flex flex-wrap justify-center gap-3 sm:gap-4 icons social-grid">
              <li>
                <a href="https://x.com/raimonvibe/" target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-110">
                  <i className="fab fa-x-twitter text-base sm:text-lg"></i>
                  <span className="sr-only">X</span>
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/channel/UCDGDNuYb2b2Ets9CYCNVbuA/videos/" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-110">
                  <i className="fab fa-youtube text-base sm:text-lg"></i>
                  <span className="sr-only">YouTube</span>
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@raimonvibe/" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-800 to-black rounded-lg flex items-center justify-center text-white hover:from-gray-700 hover:to-gray-900 transition-all duration-300 hover:scale-110">
                  <i className="fab fa-tiktok text-base sm:text-lg"></i>
                  <span className="sr-only">TikTok</span>
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/raimonvibe/" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-110">
                  <i className="fab fa-instagram text-base sm:text-lg"></i>
                  <span className="sr-only">Instagram</span>
                </a>
              </li>
              <li>
                <a href="https://medium.com/@raimonvibe/" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg flex items-center justify-center text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-110">
                  <i className="fab fa-medium text-base sm:text-lg"></i>
                  <span className="sr-only">Medium</span>
                </a>
              </li>
              <li>
                <a href="https://github.com/raimonvibe/" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white hover:from-gray-500 hover:to-gray-600 transition-all duration-300 hover:scale-110">
                  <i className="fab fa-github text-base sm:text-lg"></i>
                  <span className="sr-only">GitHub</span>
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/raimonvibe/" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-110">
                  <i className="fab fa-linkedin-in text-base sm:text-lg"></i>
                  <span className="sr-only">LinkedIn</span>
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/profile.php?id=61563450007849" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110">
                  <i className="fab fa-facebook-f text-base sm:text-lg"></i>
                  <span className="sr-only">Facebook</span>
                </a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
