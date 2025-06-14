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

### 4. Deploy Changes

After setting the environment variable, redeploy your application:
- Vercel will automatically redeploy when you push changes to your connected Git repository
- Or manually trigger a deployment from the Vercel dashboard

## How It Works

When a user signs up:

1. The system creates a user account with a 5-digit verification code
2. Instead of returning the code in the API response, it sends an email via Formspree
3. The user receives an email with their verification code
4. They can then use the "Verify" tab to enter the code and complete registration

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

## Support

For Formspree-specific issues, check:
- [Formspree Documentation](https://help.formspree.io/)
- [Formspree Support](https://formspree.io/contact)

For tutorial-specific issues, open an issue on the GitHub repository.
