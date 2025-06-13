# Complete Email Authentication Tutorial

A comprehensive, interactive tutorial that teaches developers how to build a complete email authentication system from scratch, featuring both educational content and a working demo.

## 🚀 Features

- **Interactive Tutorial**: Step-by-step guide with comprehensive explanations
- **Working Demo**: Fully functional authentication system you can try immediately
- **Beginner Friendly**: Complete setup instructions from Node.js installation to deployment
- **Full Stack**: FastAPI backend with React TypeScript frontend
- **Modern Tech Stack**: Vite, Tailwind CSS, shadcn/ui components
- **Security Best Practices**: Password hashing, JWT tokens, email verification

## 📋 What You'll Learn

- Complete authentication flow (signup, email verification, login, protected routes)
- FastAPI backend development with Python
- React frontend with TypeScript and modern UI components
- Password hashing with bcrypt
- JWT token authentication
- Email verification workflow
- Database integration concepts
- Security best practices

## 🛠 Quick Start

### Prerequisites

- Node.js 18+ (Download from [nodejs.org](https://nodejs.org))
- Python 3.8+ (Download from [python.org](https://python.org))

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd auth-backend
   pip install -r requirements.txt
   ```

2. **Start the FastAPI server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   
   Backend will be available at `http://localhost:8000`
   API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Start the React development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at `http://localhost:5173`

## 🎯 How to Use This Tutorial

1. **Tutorial Tab**: Learn the concepts and see code examples
2. **Demo Tab**: Try the working authentication system
3. **Verify Tab**: Test email verification (activated after signup)
4. **Dashboard Tab**: Access protected content (activated after login)

## 🏗 Project Structure

```
email-authentication-tutorial/
├── auth-backend/              # FastAPI backend
│   ├── app/
│   │   └── main.py           # Main application with all endpoints
│   └── requirements.txt      # Python dependencies
├── src/                      # React frontend
│   ├── App.tsx              # Main application with tutorial and demo
│   ├── components/          # shadcn/ui components
│   └── ...
├── .env                     # Environment variables
└── README.md               # This file
```

## 🔧 API Endpoints

- `POST /api/signup` - Create new user account
- `POST /api/verify-email` - Verify email with 5-digit code
- `POST /api/login` - Authenticate user and get JWT token
- `GET /api/dashboard` - Protected route requiring authentication
- `GET /api/users` - List all users (for testing)
- `GET /healthz` - Health check endpoint

## 🔐 Authentication Flow

1. **Sign Up**: User creates account with email/password
2. **Email Verification**: System generates 5-digit code for verification
3. **Verify Email**: User enters code to activate account
4. **Log In**: User signs in with verified credentials
5. **Access Dashboard**: User can access protected routes with JWT token

## 💾 Database

This tutorial uses an in-memory database for simplicity and immediate testing. User data persists during the server session but resets when restarted. This demonstrates:

- User registration and storage
- Password hashing with bcrypt
- Email verification workflow
- JWT token authentication
- Protected route access

## 🚀 Next Steps

After completing this tutorial, you can:

- Implement password reset functionality
- Add social login options (Google, GitHub)
- Build user profile management
- Add two-factor authentication
- Implement role-based access control
- Deploy to production with a real database

## 🤝 Contributing

This is an educational project. Feel free to suggest improvements or report issues!

## 📄 License

MIT License - feel free to use this tutorial for learning and teaching purposes.
