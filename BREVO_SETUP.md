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
BREVO_SENDER_EMAIL=info@raimonvibe.com
BREVO_SENDER_NAME=Raimon Vibe
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
   - **Name**: `BREVO_SENDER_EMAIL`
   - **Value**: Your verified domain email (e.g., `info@yourdomain.com`)
   - **Environment**: Select all environments (Production, Preview, Development)
   - **Name**: `BREVO_SENDER_NAME`
   - **Value**: Your sender name (e.g., `Your App Name`)
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

## 4. Verify Your Sender Domain (Required for Production)

For email delivery to work properly, you must verify your domain:

### Step 1: Add Domain to Brevo
1. In Brevo dashboard, go to **Senders, Domains & Dedicated IPs**
2. Click **Domains** tab
3. Click **Add a domain**
4. Enter your domain name (e.g., `raimonvibe.com`)

### Step 2: Authenticate Your Domain
After adding your domain, you'll need to add DNS records to authenticate it:

1. **Brevo Code (TXT Record)**
   - Add a TXT record to your domain's DNS
   - Record will be provided by Brevo after adding the domain

2. **DKIM Record (TXT or CNAME)**
   - Add the DKIM record provided by Brevo
   - This digitally signs your emails

3. **DMARC Record (TXT)**
   - Add a DMARC policy record
   - Example: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`

### Step 3: Verify Authentication
1. After adding DNS records, click **Authenticate** in Brevo dashboard
2. Wait for DNS propagation (can take up to 24 hours)
3. Verify all records show as "Authenticated"

### Step 4: Update Environment Variables
Once domain is verified, update your environment variables:
- Set `BREVO_SENDER_EMAIL` to your verified email (e.g., `info@raimonvibe.com`)
- Set `BREVO_SENDER_NAME` to your preferred sender name

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
