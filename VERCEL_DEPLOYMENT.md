# Vercel Deployment Guide

## 🚀 Quick Deployment Steps

1. **Fork/Clone this repository** to your GitHub account

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your forked repository

3. **Configure Environment Variables:**
   - In Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add the following variables:

   ```
   SECRET_KEY = your-super-secret-jwt-key-at-least-32-characters-long
   ```

   **To generate a secure SECRET_KEY:**
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

4. **Update Frontend API URL:**
   - After deployment, Vercel will give you a URL like `https://your-project-name.vercel.app`
   - Update the `.env` file:
   ```
   VITE_API_BASE_URL=https://your-actual-vercel-url.vercel.app
   ```
   - Commit and push this change to trigger a redeploy

5. **Deploy:**
   - Vercel will automatically deploy when you push to your main branch
   - First deployment might take 2-3 minutes

## ⚠️ Important Notes

- **Data Persistence**: User data resets when serverless functions go cold (5-15 minutes of inactivity)
- **Demo Window**: Users have a limited time window to complete the signup → verify → login flow
- **Cold Starts**: First request after inactivity may be slower

## 🔧 Project Structure for Vercel

```
email-authentication-tutorial/
├── api/                    # Vercel serverless functions
│   ├── shared.py          # Shared utilities and database
│   ├── signup.py          # POST /api/signup
│   ├── verify-email.py    # POST /api/verify-email
│   ├── login.py           # POST /api/login
│   ├── dashboard.py       # GET /api/dashboard
│   ├── users.py           # GET /api/users
│   └── healthz.py         # GET /healthz
├── vercel.json            # Vercel configuration
├── requirements.txt       # Python dependencies for serverless functions
└── ... (rest of React app)
```

## 🎯 Testing Your Deployment

1. Visit your Vercel URL
2. Go to the "Demo" tab
3. Sign up with an email
4. Note the verification code displayed
5. Verify your email with the code
6. Log in with your credentials
7. Access the dashboard

**Remember**: Complete the flow within 15 minutes to avoid cold start resets!

## 🔄 Redeployment

Any push to your main branch will trigger automatic redeployment. You can also manually redeploy from the Vercel dashboard.

## 💡 Tips

- Use the Vercel CLI for faster deployments: `npm i -g vercel && vercel --prod`
- Monitor function logs in the Vercel dashboard for debugging
- Consider upgrading to Vercel Pro if you need longer function execution times
