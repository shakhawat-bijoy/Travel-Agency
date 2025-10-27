# Database Avatar Integration Guide

## Overview

Updated the image upload system to use the existing `avatar` field from the database instead of a separate `profileImage` field. All profile pictures now use `avatar.url` from the database.

## Changes Made

### 1. Database Schema (User Model)

- ✅ **Removed**: `profileImage` field (no longer needed)
- ✅ **Using**: `avatar.url` for profile pictures
- ✅ **Keeping**: `coverImage.url` for cover photos

```javascript
// User Schema Structure
avatar: {
  url: String (default: 'https://via.placeholder.com/150'),
  publicId: String (for Cloudinary)
},
coverImage: {
  url: String,
  publicId: String (for Cloudinary)
}
```

### 2. Backend API Updates

#### Upload Endpoint (`/api/auth/upload-image`)

- ✅ **Profile uploads**: Save to `user.avatar`
- ✅ **Cover uploads**: Save to `user.coverImage`
- ✅ **Old image cleanup**: Deletes previous images from Cloudinary
- ✅ **Fallback storage**: Uses local storage if Cloudinary not configured

#### User Data Endpoints

- ✅ **Login route**: Returns `avatar: user.avatar?.url`
- ✅ **Registration route**: Returns `avatar: user.avatar?.url`
- ✅ **Profile route** (`/me`): Returns `avatar: user.avatar?.url`
- ✅ **Update profile route**: Returns `avatar: user.avatar?.url`

### 3. Frontend Updates

#### Account.jsx

- ✅ **State management**: Uses `avatar` instead of `profileImage`
- ✅ **Image display**: Shows `userInfo.avatar` for profile picture
- ✅ **Upload handling**: Updates `avatar` field on successful upload
- ✅ **Placeholder handling**: Shows default icon when no avatar or placeholder URL

#### Data Flow

```javascript
// Frontend state structure
userInfo: {
  avatar: 'https://cloudinary.com/image.jpg', // or local URL
  coverImage: 'https://cloudinary.com/cover.jpg',
  // ... other fields
}
```

## How It Works

### 1. Profile Picture Upload

1. User clicks camera icon on profile picture
2. File is validated (type, size)
3. FormData sent to `/api/auth/upload-image` with `type: 'profile'`
4. Backend saves image and updates `user.avatar.url`
5. Frontend receives new image URL and updates display
6. Image persists in database for future sessions

### 2. Cover Photo Upload

1. User clicks "Upload Cover" button
2. File is validated (type, size)
3. FormData sent to `/api/auth/upload-image` with `type: 'cover'`
4. Backend saves image and updates `user.coverImage.url`
5. Frontend receives new image URL and updates display
6. Image persists in database for future sessions

### 3. Data Persistence

- **Database**: All image URLs stored in MongoDB
- **Authentication**: Avatar URL included in login/registration responses
- **Profile loading**: Avatar loaded from database on account page visit
- **Real-time updates**: Images appear immediately after upload

## API Response Format

### Login/Registration Response

```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://cloudinary.com/image.jpg"
    // ... other fields
  }
}
```

### Profile Data Response

```json
{
  "success": true,
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://cloudinary.com/image.jpg",
    "coverImage": "https://cloudinary.com/cover.jpg"
    // ... other fields
  }
}
```

### Upload Response

```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "imageUrl": "https://cloudinary.com/new-image.jpg"
}
```

## Storage Options

### Option 1: Cloudinary (Recommended)

- Images stored in cloud
- Automatic optimization
- CDN delivery
- Requires environment variables:
  ```env
  CLOUDINARY_CLOUD_NAME=your-cloud-name
  CLOUDINARY_API_KEY=your-api-key
  CLOUDINARY_API_SECRET=your-api-secret
  ```

### Option 2: Local Storage (Development)

- Images stored in `server/uploads/`
- Served at `/uploads/filename`
- No additional configuration needed
- Not recommended for production

## Benefits

1. **Consistency**: Uses existing database schema
2. **Simplicity**: Single field for profile pictures
3. **Persistence**: Images saved to database
4. **Flexibility**: Works with both Cloudinary and local storage
5. **Performance**: Images loaded from database on each session
6. **Scalability**: Cloudinary integration for production use

## Testing

1. **Upload Test**: Upload profile and cover images
2. **Persistence Test**: Refresh page, images should remain
3. **Database Test**: Check MongoDB for updated avatar URLs
4. **API Test**: Login should return avatar URL
5. **Fallback Test**: Works without Cloudinary configuration

The system now properly integrates with your existing database structure and uses the `avatar` field as intended.
