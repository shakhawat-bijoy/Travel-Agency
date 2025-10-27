# Forgot Password Setup Guide

## Overview

The forgot password feature has been implemented with a 3-step process:

1. **Email Entry** - User enters their email address
2. **Code Verification** - User enters the 6-digit code sent to their email
3. **Password Reset** - User sets a new password

## Backend Setup

### 1. Environment Variables

Add these variables to your `server/.env` file:

```env
# JWT Secret (if not already set)
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration for Password Reset
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Gmail App Password Setup

For Gmail, you'll need to create an App Password:

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. At the bottom, select "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password as `EMAIL_PASS`

### 3. Database Connection

Make sure your MongoDB connection is working in `server/config/db.js`

## API Endpoints

The following endpoints are available:

- `POST /api/auth/forgot-password` - Send verification code
- `POST /api/auth/verify-reset-code` - Verify the code
- `POST /api/auth/reset-password` - Reset the password

## Frontend Features

### Component: `ForgotPassword.jsx`

- **Step 1**: Email input with validation
- **Step 2**: 6-digit code verification
- **Step 3**: New password creation with confirmation
- **UI**: Matches your existing design with slider and responsive layout
- **Navigation**: Back button to login, step indicators
- **Error Handling**: User-friendly error messages
- **Success Flow**: Automatic redirect to login after successful reset

### Routing

The route `/forgot-password` has been added to your React Router configuration.

## Security Features

1. **Code Expiration**: Verification codes expire after 5 minutes
2. **JWT Tokens**: Reset tokens expire after 15 minutes
3. **Password Hashing**: New passwords are hashed with bcrypt (12 rounds)
4. **Input Validation**: Email format and password length validation
5. **Rate Limiting**: Consider adding rate limiting for production

## Testing the Feature

1. Start your backend server: `npm run dev` (in server directory)
2. Start your frontend: `npm run dev` (in client directory)
3. Navigate to `/login` and click "Forgot Password?"
4. Enter a valid email address that exists in your database
5. Check your email for the verification code
6. Complete the flow by setting a new password

## Production Considerations

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Redis**: Use Redis instead of in-memory storage for verification codes
3. **Email Templates**: Consider using a professional email service like SendGrid
4. **Logging**: Add proper logging for security events
5. **HTTPS**: Ensure all password reset flows happen over HTTPS

## Troubleshooting

### Common Issues:

1. **Email not sending**: Check Gmail app password and 2FA settings
2. **CORS errors**: Make sure CORS is configured in server.js
3. **Database errors**: Verify MongoDB connection and User model
4. **Token errors**: Check JWT_SECRET environment variable

### Debug Steps:

1. Check server console for error messages
2. Verify email credentials in .env file
3. Test API endpoints directly with Postman
4. Check browser network tab for API responses
