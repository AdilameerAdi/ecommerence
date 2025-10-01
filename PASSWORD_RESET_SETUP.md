# Password Reset Setup Guide

## Overview
The password reset feature has been implemented for admin users. This guide explains how to configure and use it.

## Database Setup

1. **Run the SQL migration** to add reset columns to your admin_users table:
   ```sql
   -- Run the file: database/add_password_reset_columns.sql
   ```

## Email Configuration

### IMPORTANT: Set Your Email Address

1. **Open** `/src/frontend/footer.jsx`
2. **Find line 34** with:
   ```javascript
   const ADMIN_EMAIL = "your-email@example.com"; // CHANGE THIS TO YOUR EMAIL
   ```
3. **Replace** `"your-email@example.com"` with your actual email address where you want to receive password reset notifications.

### Example:
```javascript
const ADMIN_EMAIL = "admin@yourcompany.com"; // Your actual email
```

## How It Works

### For Development:
1. User clicks "Forgot Password?" link in the login form
2. User enters their username
3. System generates a reset token
4. **In development mode**, the token is displayed on screen (yellow box)
5. The token is also stored in the database

### For Production:
1. Set up Supabase Email Templates (see below)
2. The reset token will be sent via email instead of being displayed
3. Create a reset password page that accepts the token

## Production Setup (Using Supabase Auth)

For production, you should use Supabase's built-in authentication instead of the custom solution:

### Option 1: Supabase Auth (Recommended for Production)
```javascript
// Use Supabase Auth for production
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Send password reset email
const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://yoursite.com/reset-password',
})
```

### Option 2: Custom Email Service
If you want to keep the custom solution, integrate with an email service:

1. **SendGrid Integration:**
```javascript
// Install: npm install @sendgrid/mail
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
  to: ADMIN_EMAIL,
  from: 'noreply@yoursite.com',
  subject: 'Password Reset Request',
  html: `Click here to reset: <a href="${resetLink}">${resetLink}</a>`,
}
sgMail.send(msg)
```

2. **Resend Integration:**
```javascript
// Install: npm install resend
import { Resend } from 'resend';
const resend = new Resend('re_YOUR_API_KEY');

await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: ADMIN_EMAIL,
  subject: 'Password Reset',
  html: `<p>Reset token: ${resetToken}</p>`
});
```

## Security Notes

1. **Never display tokens in production** - Remove the token display from the UI
2. **Use HTTPS** - Always use secure connections
3. **Token expiration** - Tokens expire after 1 hour
4. **One-time use** - Each token can only be used once
5. **Rate limiting** - Implement rate limiting to prevent abuse

## Testing

1. Click "Admin Login" in the footer
2. Click "Forgot Password?" link
3. Enter a valid username
4. Check the yellow box for the reset token (dev mode)
5. In production, check your email

## Reset Password Page (To Be Implemented)

Create a page at `/reset-password` that:
1. Accepts the token from the URL parameter
2. Verifies the token using `verifyResetToken()`
3. Allows user to enter new password
4. Calls `resetPasswordWithToken()` to update password

## Environment Variables

Add these to your `.env` file for production:
```
VITE_ADMIN_EMAIL=your-email@example.com
VITE_SENDGRID_API_KEY=your-sendgrid-key  # If using SendGrid
VITE_RESEND_API_KEY=your-resend-key      # If using Resend
```

## Troubleshooting

1. **"Username not found" error**
   - Verify the username exists in admin_users table
   - Check that is_active = true for the user

2. **Token not working**
   - Check if token has expired (1 hour limit)
   - Verify reset_token column exists in database
   - Ensure token hasn't been used already

3. **Email not sending (production)**
   - Verify email service API keys
   - Check email service logs
   - Ensure email address is valid

## Support

For issues or questions, check:
- Supabase documentation: https://supabase.com/docs/guides/auth
- SendGrid docs: https://docs.sendgrid.com/
- Resend docs: https://resend.com/docs