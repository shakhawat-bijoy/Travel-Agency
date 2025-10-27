# Complete Authentication System Setup Guide

## Overview

I've implemented a complete authentication system for your Dream Holidays application with the following features:

### ✅ Features Implemented:

1. **User Registration** - Create new accounts with validation
2. **User Login** - Authenticate existing users
3. **Forgot Password** - 3-step password recovery process
4. **JWT Authentication** - Secure token-based authentication
5. **Password Hashing** - Secure password storage with bcrypt
6. **Input Validation** - Server-side validation with express-validator
7. **API Utilities** - Centralized API management

## Backend Setup

### 1. Environment Variables

Create a `server/.env` file with these variables:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/dream-holidays

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Email Configuration for Password Reset
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Server Configuration
PORT=5001
NODE_ENV=development
```

### 2. Database Setup

Make sure MongoDB is running on your system:

- **Windows**: Start MongoDB service
- **Mac**: `brew services start mongodb/brew/mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### 3. Gmail Setup for Password Reset

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account Settings → Security → App Passwords
3. Generate an app password for "Mail"
4. Use this 16-character password as `EMAIL_PASS`

## API Endpoints

### Authentication Routes (`/api/auth/`)

| Method | Endpoint             | Description              | Auth Required |
| ------ | -------------------- | ------------------------ | ------------- |
| POST   | `/register`          | Register new user        | No            |
| POST   | `/login`             | Login user               | No            |
| GET    | `/me`                | Get current user profile | Yes           |
| POST   | `/forgot-password`   | Send password reset code | No            |
| POST   | `/verify-reset-code` | Verify reset code        | No            |
| POST   | `/reset-password`    | Reset password           | No            |

### Request/Response Examples

#### Register User

```javascript
// Request
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "password": "securepassword123"
}

// Response
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "rewardPoints": 0
  }
}
```

#### Login User

```javascript
// Request
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword123"
}

// Response
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": { /* user object */ }
}
```

## Frontend Implementation

### 1. API Utility (`client/src/utils/api.js`)

Centralized API management with:

- Automatic token handling
- Error handling
- Consistent request/response format

### 2. Authentication Flow

#### Registration Flow:

1. User fills registration form
2. Frontend validates passwords match
3. API call to `/api/auth/register`
4. Token and user data stored in localStorage
5. Redirect to payment method page

#### Login Flow:

1. User enters email/password
2. API call to `/api/auth/login`
3. Token and user data stored in localStorage
4. Redirect to home page

#### Forgot Password Flow:

1. **Step 1**: User enters email → API sends verification code
2. **Step 2**: User enters 6-digit code → API verifies and returns reset token
3. **Step 3**: User sets new password → API updates password

### 3. Local Storage Management

```javascript
// Save user data
auth.saveUserData(token, user);

// Get user data
const { token, user } = auth.getUserData();

// Check if authenticated
const isLoggedIn = auth.isAuthenticated();

// Logout
auth.logout();
```

## Security Features

### 1. Password Security

- **Hashing**: bcrypt with 12 salt rounds
- **Validation**: Minimum 8 characters required
- **No plain text storage**: Passwords never stored in plain text

### 2. JWT Tokens

- **Expiration**: 30 days for auth tokens, 15 minutes for reset tokens
- **Secure**: Signed with strong secret key
- **Stateless**: No server-side session storage

### 3. Input Validation

- **Email format validation**
- **Phone number validation**
- **Password strength requirements**
- **SQL injection protection** with express-validator

### 4. Rate Limiting (Recommended for Production)

Add rate limiting middleware to prevent brute force attacks:

```javascript
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
});

app.use("/api/auth/login", authLimiter);
```

## Testing the System

### 1. Start the Servers

```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

### 2. Test Registration

1. Go to `/register`
2. Fill out the form with valid data
3. Check that user is created in MongoDB
4. Verify redirect to payment method page

### 3. Test Login

1. Go to `/login`
2. Use registered credentials
3. Verify successful login and redirect

### 4. Test Forgot Password

1. Go to `/login` → "Forgot Password?"
2. Enter registered email
3. Check email for verification code
4. Complete the 3-step process

## Database Schema

### User Model

```javascript
{
  name: String,           // Full name
  email: String,          // Unique email
  password: String,       // Hashed password
  phone: String,          // Phone number
  role: String,           // 'user' or 'admin'
  avatar: {
    url: String,          // Avatar URL
    publicId: String      // Cloudinary public ID
  },
  rewardPoints: Number,   // Loyalty points
  isVerified: Boolean,    // Email verification status
  createdAt: Date,        // Registration date
  updatedAt: Date         // Last update
}
```

## Error Handling

### Common Error Responses

```javascript
// Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    }
  ]
}

// Authentication Error
{
  "success": false,
  "message": "Invalid email or password"
}

// Server Error
{
  "success": false,
  "message": "Server error during registration"
}
```

## Production Considerations

### 1. Environment Variables

- Use strong, random JWT secrets
- Use production MongoDB URI
- Configure proper email service (SendGrid, etc.)

### 2. Security Enhancements

- Add rate limiting
- Implement HTTPS
- Add CORS configuration
- Use helmet for security headers
- Add request logging

### 3. Database Optimization

- Add database indexes
- Implement connection pooling
- Add database backup strategy

### 4. Monitoring

- Add error logging (Winston, etc.)
- Implement health checks
- Add performance monitoring

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**

   - Check if MongoDB is running
   - Verify MONGO_URI in .env file

2. **Email Not Sending**

   - Check Gmail app password
   - Verify EMAIL_USER and EMAIL_PASS

3. **JWT Token Errors**

   - Check JWT_SECRET in .env file
   - Verify token format in requests

4. **CORS Errors**

   - Ensure CORS is enabled in server.js
   - Check API URLs in frontend

5. **Validation Errors**
   - Check required fields
   - Verify data formats (email, phone)

## Next Steps

1. **Add Email Verification**: Verify email addresses during registration
2. **Social Login**: Add Google/Facebook authentication
3. **Role-Based Access**: Implement admin/user role permissions
4. **Profile Management**: Add user profile update functionality
5. **Password Change**: Add change password feature for logged-in users

The authentication system is now fully functional and ready for use!
