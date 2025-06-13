import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Copy, Mail, Lock, Shield, Code, CheckCircle } from 'lucide-react'
import './App.css'

function App() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative bg-gray-800 rounded-lg p-4 my-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-2">
        <Badge variant="secondary" className="bg-purple-600 text-white">{language}</Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(code, id)}
          className="text-gray-300 hover:text-white"
        >
          {copiedCode === id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      <pre className="text-sm text-gray-100 overflow-x-auto">
        <code>{code}</code>
      </pre>
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

        <div className="grid gap-8">
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
                  and how email verification ensures secure account activation.
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
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3">HTML Structure</h4>
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

              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3">React Component</h4>
                <CodeBlock
                  language="React"
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

              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3">CSS Styling</h4>
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
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-blue-400 mb-3">React Login Component</h4>
                <CodeBlock
                  language="React"
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
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-pink-400 mb-3">Formspree Setup</h4>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <ol className="text-sm text-gray-300 space-y-2">
                    <li>1. Go to <a href="https://formspree.io" className="text-pink-400 hover:underline">formspree.io</a> and create an account</li>
                    <li>2. Create a new form and get your form endpoint URL</li>
                    <li>3. Configure your form to send emails with verification codes</li>
                    <li>4. Use the endpoint in your backend to trigger verification emails</li>
                  </ol>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-pink-400 mb-3">Backend: Generate Verification Code</h4>
                <CodeBlock
                  language="JavaScript"
                  id="verification-backend"
                  code={`// Generate 5-digit verification code
function generateVerificationCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

async function sendVerificationEmail(email, verificationCode) {
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

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const verificationCode = generateVerificationCode();
    
    const user = new User({
      email,
      password: hashedPassword,
      verificationCode,
      isVerified: false,
      createdAt: new Date()
    });
    
    await user.save();
    
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (emailSent) {
      res.status(201).json({ 
        message: 'Account created! Check your email for verification code.',
        userId: user._id 
      });
    } else {
      res.status(500).json({ message: 'Account created but failed to send verification email' });
    }
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});`}
                />
              </div>

              <div>
                <h4 className="text-lg font-semibold text-pink-400 mb-3">Frontend: Verification Form</h4>
                <CodeBlock
                  language="React"
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
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-orange-400 mb-3">Server Setup (Node.js + Express)</h4>
                <CodeBlock
                  language="JavaScript"
                  id="server-setup"
                  code={`const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/auth-tutorial', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationCode: { type: String },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};`}
                />
              </div>

              <div>
                <h4 className="text-lg font-semibold text-orange-400 mb-3">Login Endpoint</h4>
                <CodeBlock
                  language="JavaScript"
                  id="login-endpoint"
                  code={`// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

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
                integrate email verification with Formspree, and build secure backend authentication logic.
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
            </CardContent>
          </Card>
        </div>

        <footer className="text-center mt-12 py-8 border-t border-gray-700">
          <p className="text-gray-400">
            Built with React, Tailwind CSS, and shadcn/ui • 
            <span className="text-purple-400"> Email Auth Tutorial 2024</span>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
