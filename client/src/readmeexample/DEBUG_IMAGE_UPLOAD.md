# Debug Image Upload Issues

## Added Debugging Features

### 1. Frontend Debugging (Account.jsx)

- ✅ Added console logs for user data received from API
- ✅ Added console logs for avatar and cover image URLs
- ✅ Added image load/error event handlers
- ✅ Added upload success debugging
- ✅ Added ID "coverAvatar" to cover photo
- ✅ Added ID "profileAvatar" to profile photo

### 2. Backend Debugging (auth.js)

- ✅ Added console logs for raw user data from database
- ✅ Added console logs for processed user data being sent
- ✅ Added console logs for user data after save

## Debug Steps

### Step 1: Check Browser Console

Open browser console and look for these logs when loading account page:

```
User data received: {name: "...", avatar: "...", coverImage: "..."}
Avatar URL: [URL or empty]
Cover Image URL: [URL or empty]
```

### Step 2: Test Image Upload

1. Upload a profile image
2. Check console for:

```
Uploading image: {fileName: "...", fileSize: ..., type: "profile"}
Upload response: {success: true, imageUrl: "..."}
Upload successful, updating UI with: [URL]
Updating field: avatar
Updated userInfo: {avatar: "[URL]", ...}
```

### Step 3: Check Server Console

Look for these logs in server console:

```
Upload endpoint hit
File: {filename: "...", path: "..."}
Body: {type: "profile"}
Using local storage (Cloudinary not configured)
Image uploaded successfully: http://localhost:5001/uploads/...
User avatar after save: {url: "...", publicId: null}
```

### Step 4: Check Database

Verify data is saved to MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.findOne({ email: "your-email" }, { avatar: 1, coverImage: 1 });
```

## Common Issues & Solutions

### Issue 1: Images not loading from database

**Check**: Browser console for "User data received"
**Solution**: Verify API is returning correct URLs

### Issue 2: Upload succeeds but image doesn't show

**Check**: Console for "Upload successful, updating UI with"
**Solution**: Verify state update is working

### Issue 3: Server errors during upload

**Check**: Server console for error messages
**Solution**: Verify uploads directory exists and permissions

### Issue 4: Images show broken/404

**Check**: Network tab for failed image requests
**Solution**: Verify server is serving static files from /uploads

## Quick Test Commands

### Test 1: Check if uploads directory exists

```bash
ls -la server/uploads/
```

### Test 2: Test static file serving

```bash
# After uploading an image, test direct access:
curl http://localhost:5001/uploads/[filename]
```

### Test 3: Check MongoDB data

```javascript
// In MongoDB shell
use dream-holidays
db.users.find({}, {name: 1, avatar: 1, coverImage: 1}).pretty()
```

## Expected Behavior

### Successful Upload Flow:

1. ✅ File selected and validated
2. ✅ Upload request sent to server
3. ✅ File saved to server/uploads/
4. ✅ URL saved to MongoDB
5. ✅ Response sent to frontend
6. ✅ UI updated with new image
7. ✅ Image displays immediately

### Successful Load Flow:

1. ✅ Account page loads
2. ✅ API call to /api/auth/me
3. ✅ User data retrieved from MongoDB
4. ✅ Avatar and cover URLs included in response
5. ✅ Images display on page

## Troubleshooting Checklist

- [ ] Server running on port 5001
- [ ] Client running and connected to server
- [ ] uploads directory exists in server folder
- [ ] MongoDB connected and user data exists
- [ ] Browser console shows no JavaScript errors
- [ ] Network tab shows successful API calls
- [ ] Server console shows upload logs

Run through these debug steps to identify where the issue is occurring!
