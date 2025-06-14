# Formspree Email Integration Setup

This guide explains how to set up Formspree for sending verification emails in the Email Authentication Tutorial.

## Prerequisites

1. A Formspree account (sign up at [formspree.io](https://formspree.io))
2. Access to your Vercel deployment settings

## Setup Steps

### 1. Create a Formspree Form

1. Log in to your Formspree dashboard
2. Click "New Form" 
3. Choose "Contact Form" or "Custom Form"
4. Configure your form settings:
   - **Form Name**: "Email Verification"
   - **Email Template**: Set up a template for verification codes
   - **Notification Email**: Your email address to receive form submissions

### 2. Get Your Form ID

After creating the form, you'll get a Form ID that looks like: `xpzgkqyw`

Your form endpoint will be: `https://formspree.io/f/xpzgkqyw`

### 3. Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `FORMSPREE_API_KEY`
   - **Value**: Your Form ID (e.g., `xpzgkqyw`) or full endpoint URL
   - **Environment**: Production, Preview, Development (select all)

### 4. Verify Environment Variable in Vercel

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Ensure `FORMSPREE_API_KEY` is set for all environments (Production, Preview, Development)
3. The value should be either:
   - Just the Form ID: `xpzgkqyw`
   - Full endpoint URL: `https://formspree.io/f/xpzgkqyw`
4. After adding/updating the variable, redeploy your application
5. Check the function logs in Vercel dashboard to verify the variable is accessible

### 5. Testing the Integration

To verify the setup is working:
1. Use the Demo tab to sign up with a real email address
2. Check Vercel function logs for any FORMSPREE_API_KEY errors
3. Verify you receive the verification email
4. If emails aren't sent, check your Formspree dashboard for submission logs

### 6. Deploy Changes

After setting the environment variable, redeploy your application:
- Vercel will automatically redeploy when you push changes to your connected Git repository
- Or manually trigger a deployment from the Vercel dashboard

## How It Works

When a user signs up:

1. The system creates a user account with a unique timestamp-based ID and 5-digit verification code
2. The system handles duplicate email attempts by allowing verification code resending for unverified accounts
3. Instead of returning the code in the API response, it sends an email via Formspree
4. The user receives an email with their verification code
5. They can then use the "Verify" tab to enter the code and complete registration

## Email Template

The verification email includes:
- **Subject**: "Email Verification Code"
- **Message**: "Your verification code is: [5-digit code]"
- **Reply-to**: User's email address

## Troubleshooting

### Environment Variable Not Found
If you see "FORMSPREE_API_KEY not found in environment variables":
- Check that the environment variable is set in Vercel
- Ensure you've redeployed after adding the variable
- Verify the variable name is exactly `FORMSPREE_API_KEY`

### Email Not Sending
If emails aren't being sent:
- Check your Formspree form settings and limits
- Verify your Form ID is correct
- Check Formspree dashboard for submission logs
- Ensure your Formspree plan supports the number of submissions

### Form ID vs Full URL
The system accepts either:
- Form ID only: `xpzgkqyw`
- Full endpoint URL: `https://formspree.io/f/xpzgkqyw`

## Testing

To test the integration:

1. Use the Demo tab on the tutorial website
2. Sign up with a real email address
3. Check your email inbox for the verification code
4. Use the Verify tab to complete the process
5. Test duplicate email handling by trying to sign up again with the same email
6. Verify that unverified accounts can receive new verification codes

## Support

For Formspree-specific issues, check:
- [Formspree Documentation](https://help.formspree.io/)
- [Formspree Support](https://formspree.io/contact)

For tutorial-specific issues, open an issue on the GitHub repository.
