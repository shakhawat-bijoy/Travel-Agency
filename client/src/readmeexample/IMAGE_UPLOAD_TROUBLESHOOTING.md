# Image Upload Troubleshooting Guide

## Issues Fixed

### 1. Frontend Issues

- ✅ Removed unused imports (Upload, Save, Heart)
- ✅ Fixed mt-24 margin issue (removed from Account page)
- ✅ Added file validation (type and size)
- ✅ Enhanced error handling with detailed messages
- ✅ Added debugging logs

### 2. Backend Issues

- ✅ Created uploads directory (`server/uploads`)
- ✅ Added static file serving for uploads
- ✅ Enhanced upload endpoint with fallback to local storage
- ✅ Added comprehensive error handling and logging
- ✅ Fixed ES6 module imports

### 3. API Issues

- ✅ Enhanced uploadImage function with better error handling
- ✅ Added debugging logs for API calls
- ✅ Proper error propagation

## How to Test Image Upload

### 1. Start the Server

```bash
cd server
npm start
```

### 2. Start the Client

```bash
cd client
npm start
```

### 3. Test Upload

1. Navigate to `/account`
2. Click the camera icon on profile picture or "Upload Cover" button
3. Select an image file (JPEG, PNG, GIF, WebP, max 5MB)
4. Check browser console for debugging information
5. Check server console for upload logs

## Configuration Options

### Option 1: Local Storage (Default)

Images are stored in `server/uploads/` directory and served at `/uploads/filename`

### Option 2: Cloudinary (Recommended for Production)

Add to your `server/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Debugging Steps

### 1. Check Browser Console

- Look for upload request logs
- Check for any JavaScript errors
- Verify API response data

### 2. Check Server Console

- Look for "Upload endpoint hit" message
- Check file and body data logs
- Verify image processing logs

### 3. Check Network Tab

- Verify POST request to `/api/auth/upload-image`
- Check request headers include Authorization
- Verify FormData is being sent correctly

### 4. Check File System

- Verify `server/uploads/` directory exists
- Check if uploaded files appear in uploads directory
- Verify file permissions

## Common Issues & Solutions

### Issue: "No image file provided"

**Solution:** Check that the file input is properly configured and file is selected

### Issue: "Invalid image type"

**Solution:** Ensure you're uploading JPEG, PNG, GIF, or WebP files

### Issue: "Image size must be less than 5MB"

**Solution:** Compress or resize your image before uploading

### Issue: Images not displaying

**Solution:**

1. Check if server is serving static files from `/uploads`
2. Verify image URL in database matches actual file location
3. Check browser network tab for 404 errors on image requests

### Issue: Upload fails silently

**Solution:**

1. Check browser console for errors
2. Verify server is running and accessible
3. Check authentication token is valid

## File Structure

```
server/
├── uploads/           # Local image storage
├── middleware/
│   └── upload.js     # Multer configuration
├── utils/
│   └── cloudinary.js # Cloudinary utilities
├── routes/
│   └── auth.js       # Upload endpoint
└── server.js         # Static file serving

client/
├── src/
│   ├── pages/
│   │   └── Account.jsx    # Image upload UI
│   └── utils/
│       └── api.js         # Upload API calls
```

## Success Indicators

- ✅ Browser console shows successful upload logs
- ✅ Server console shows "Image uploaded successfully"
- ✅ Image appears immediately in the UI
- ✅ Image persists after page refresh
- ✅ Image URL is saved in database

If you're still experiencing issues, check the browser and server console logs for specific error messages.
