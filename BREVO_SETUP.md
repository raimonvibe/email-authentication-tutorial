# Brevo Email Service Setup

This tutorial uses Brevo (formerly SendInBlue) for sending verification emails. Follow these steps to set up Brevo for your email authentication system.

## 1. Create a Brevo Account

1. Go to [Brevo](https://www.brevo.com/)
2. Sign up for a free account
3. Verify your email address

## 2. Get Your API Key

1. Log in to your Brevo dashboard
2. Go to **SMTP & API** → **API Keys**
3. Click **Generate a new API key**
4. Give it a name (e.g., "Email Auth Tutorial")
5. Copy the generated API key

## 3. Configure Environment Variables

### For Local Development

Create a `.env` file in your `auth-backend` directory:

```bash
# auth-backend/.env
SECRET_KEY=your-secret-key-change-in-production-use-strong-random-key
BREVO_API_KEY=your-brevo-api-key-here
```

### For Production Deployment

Set the environment variables in your hosting platform:

#### Vercel Deployment (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:
   - **Name**: `BREVO_API_KEY`
   - **Value**: Your Brevo API key (starts with `xkeysib-`)
   - **Environment**: Select all environments (Production, Preview, Development)
4. Click **Save**
5. **Important**: Redeploy your application after adding environment variables
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Select **Redeploy**

#### Other Platforms

- **Heroku**: Use `heroku config:set BREVO_API_KEY=your-key`
- **Railway**: Add in the Variables section
- **Render**: Add in the Environment section

#### Troubleshooting Environment Variables

If emails are not being sent in production:

1. **Verify the API key format**: Brevo API keys start with `xkeysib-`
2. **Check environment variable name**: Must be exactly `BREVO_API_KEY` (case-sensitive)
3. **Ensure no extra spaces**: Copy the key directly without trailing spaces
4. **Redeploy after changes**: Environment variables require a fresh deployment
5. **Check Vercel function logs**: Go to Vercel dashboard → Functions → View logs

## 4. Verify Your Sender Domain (Optional but Recommended)

For better deliverability:

1. In Brevo dashboard, go to **Senders & IP**
2. Add and verify your domain
3. Update the sender email in your backend code to use your verified domain

## 5. Test Your Setup

Run your application and try signing up with a real email address. Check:

1. The backend logs for any Brevo API errors
2. Your email inbox for the verification code
3. Brevo dashboard for email statistics

## Troubleshooting

### Common Issues

1. **"BREVO_API_KEY not found"**
   - Make sure your `.env` file is in the correct directory
   - Restart your backend server after adding the environment variable

2. **"Invalid API key"**
   - Double-check your API key in the Brevo dashboard
   - Make sure there are no extra spaces or characters

3. **Emails not being delivered**
   - Check your spam folder
   - Verify your sender domain in Brevo
   - Check Brevo's email logs in the dashboard

### Rate Limits

Brevo free tier includes:
- 300 emails per day
- 9,000 emails per month

For production applications, consider upgrading to a paid plan.

## API Documentation

For advanced configuration, see the [Brevo API documentation](https://developers.brevo.com/).
