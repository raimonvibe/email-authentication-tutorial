# Production Deployment Guide

This guide covers deploying the Email Authentication Tutorial to production with proper email functionality.

## Prerequisites

1. **Brevo Account**: Create a free account at [brevo.com](https://brevo.com)
2. **Brevo API Key**: Generate an API key from SMTP & API section
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (recommended)

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your repository has the correct configuration files:

```bash
# Check that these files exist and are configured correctly
.env.production          # Frontend environment variables
auth-backend/.env.example # Backend environment template
```

### 2. Deploy to Vercel

#### Option A: Deploy via GitHub Integration

1. Connect your GitHub repository to Vercel
2. Import your project in Vercel dashboard
3. Vercel will automatically detect the configuration

#### Option B: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

### 3. Configure Environment Variables

**Critical Step**: Add environment variables in Vercel dashboard

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `BREVO_API_KEY` | Your Brevo API key (starts with `xkeysib-`) | All |
| `SECRET_KEY` | Strong random string for JWT tokens | All |

4. Click **Save** for each variable

### 4. Redeploy Application

**Important**: Environment variables require a fresh deployment

1. Go to **Deployments** tab in Vercel dashboard
2. Find the latest deployment
3. Click the three dots (⋯) menu
4. Select **Redeploy**
5. Wait for deployment to complete

### 5. Test Your Deployment

1. Visit your production URL
2. Navigate to the **Demo** tab
3. Try signing up with a real email address
4. Check your email inbox for the verification code
5. Complete the verification process

## Troubleshooting

### Common Issues

#### "Failed to resend verification email"

**Cause**: BREVO_API_KEY not configured or invalid

**Solutions**:
1. Verify API key is set in Vercel environment variables
2. Check API key format (should start with `xkeysib-`)
3. Ensure no extra spaces in the API key
4. Redeploy after adding/changing environment variables

#### "500 Internal Server Error"

**Cause**: Backend configuration issues

**Solutions**:
1. Check Vercel function logs:
   - Go to Vercel dashboard → **Functions**
   - Click on the failing function
   - View error logs
2. Verify all environment variables are set
3. Check that API key has proper permissions in Brevo

#### Emails Not Delivered

**Cause**: Email delivery or API configuration issues

**Solutions**:
1. Check spam folder
2. Verify sender domain in Brevo dashboard
3. Check Brevo email logs for delivery status
4. Ensure API key has email sending permissions

### Vercel Function Logs

To debug serverless function issues:

1. Go to Vercel dashboard
2. Navigate to **Functions** tab
3. Click on the function that's failing (e.g., `api/signup.py`)
4. View the execution logs for error details

### Environment Variable Verification

To verify environment variables are loaded:

1. Add temporary logging to your serverless function
2. Deploy and test
3. Check function logs to see if variables are accessible
4. Remove logging after verification

## Production Checklist

Before going live:

- [ ] Brevo API key configured in Vercel
- [ ] SECRET_KEY set to strong random value
- [ ] Application redeployed after environment variable changes
- [ ] Email signup tested with real email address
- [ ] Email verification flow tested end-to-end
- [ ] Login functionality tested after verification
- [ ] Error handling tested (try signup without API key)

## Support

If you continue to have issues:

1. Check the [Brevo API documentation](https://developers.brevo.com/)
2. Review Vercel function logs for specific error messages
3. Verify your Brevo account status and API key permissions
4. Test the API key directly using curl or Postman

## Rate Limits

**Brevo Free Tier**:
- 300 emails per day
- 9,000 emails per month

For production applications with higher volume, consider upgrading to a paid Brevo plan.
