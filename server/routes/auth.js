import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Email transporter configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('phoneNumber').isMobilePhone().withMessage('Please enter a valid phone number'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, phoneNumber, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            phone: phoneNumber,
            password, // Password will be hashed by the pre-save middleware
        });

        // Generate token
        const token = generateToken(user._id);

        // Remove password from response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            rewardPoints: user.rewardPoints,
            avatar: user.avatar?.url || 'https://via.placeholder.com/150',
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required'),
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Remove password from response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            rewardPoints: user.rewardPoints,
            avatar: user.avatar?.url || 'https://via.placeholder.com/150',
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        
        // Check if it's a MongoDB connection error
        if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
            return res.status(503).json({
                success: false,
                message: 'Database connection error. Please try again later.',
                error: 'Database unavailable'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        console.log('Raw user data from DB:', {
            avatar: req.user.avatar,
            coverImage: req.user.coverImage
        });

        const user = {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            role: req.user.role,
            rewardPoints: req.user.rewardPoints,
            avatar: req.user.avatar?.url || 'https://via.placeholder.com/150',
            coverImage: req.user.coverImage?.url || '',
            address: req.user.address,
            dateOfBirth: req.user.dateOfBirth,
            bio: req.user.bio,
            location: req.user.location,
            website: req.user.website,
            createdAt: req.user.createdAt
        };

        console.log('Processed user data being sent:', {
            avatar: user.avatar,
            coverImage: user.coverImage
        });

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone, address, dateOfBirth, bio, location, website } = req.body;

        // Find user and update
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user fields
        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;
        if (website !== undefined) user.website = website;

        await user.save();

        // Return updated user data
        const updatedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            rewardPoints: user.rewardPoints,
            avatar: user.avatar?.url || 'https://via.placeholder.com/150',
            coverImage: user.coverImage?.url || '',
            address: user.address,
            dateOfBirth: user.dateOfBirth,
            bio: user.bio,
            location: user.location,
            website: user.website,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/auth/upload-image
// @desc    Upload profile or cover image (store in MongoDB as Base64)
// @access  Private
router.post('/upload-image', protect, upload.single('image'), async (req, res) => {
    try {
        console.log('Upload endpoint hit');
        console.log('File:', req.file);
        console.log('Body:', req.body);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const { type } = req.body; // 'profile' or 'cover'

        if (!type || !['profile', 'cover'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image type. Must be "profile" or "cover"'
            });
        }

        // Find user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Read file and convert to Base64
        const fs = await import('fs');
        const fileBuffer = fs.readFileSync(req.file.path);
        const base64Image = fileBuffer.toString('base64');
        const mimeType = req.file.mimetype;

        // Create data URL for direct embedding
        const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

        console.log('Converting image to Base64 for MongoDB storage');
        console.log('File size:', fileBuffer.length, 'bytes');
        console.log('MIME type:', mimeType);

        // Update user with new image (stored as Base64 in MongoDB)
        if (type === 'profile') {
            user.avatar = {
                url: imageDataUrl,
                publicId: null, // Not needed for Base64 storage
                mimeType: mimeType,
                size: fileBuffer.length
            };
        } else {
            user.coverImage = {
                url: imageDataUrl,
                publicId: null, // Not needed for Base64 storage
                mimeType: mimeType,
                size: fileBuffer.length
            };
        }

        await user.save();

        // Clean up temporary file
        try {
            fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
            console.log('Failed to cleanup temp file:', cleanupError.message);
        }

        console.log('Image stored in MongoDB successfully');
        console.log('User avatar after save:', user.avatar ? 'Base64 data stored' : 'No avatar');
        console.log('User coverImage after save:', user.coverImage ? 'Base64 data stored' : 'No cover image');

        res.json({
            success: true,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} image uploaded and stored in MongoDB successfully`,
            imageUrl: imageDataUrl
        });

    } catch (error) {
        console.error('Image upload error:', error);

        // Clean up temporary file on error
        if (req.file && req.file.path) {
            try {
                const fs = await import('fs');
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.log('Failed to cleanup temp file on error:', cleanupError.message);
            }
        }

        res.status(500).json({
            success: false,
            message: `Failed to upload image: ${error.message}`
        });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User with this email does not exist'
            });
        }

        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code with expiration (5 minutes)
        verificationCodes.set(email, {
            code: verificationCode,
            expires: Date.now() + 5 * 60 * 1000, // 5 minutes
            userId: user._id
        });

        // Create email transporter
        const transporter = createTransporter();

        // Email template
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset - Dream Holidays',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #14b8a6, #0891b2); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Dream Holidays</h1>
          </div>
          
          <div style="padding: 40px 30px; background: #f8fafc;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              We received a request to reset your password. Use the verification code below to proceed:
            </p>
            
            <div style="background: white; border: 2px solid #14b8a6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0;">Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #14b8a6; letter-spacing: 8px; font-family: monospace;">
                ${verificationCode}
              </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              This code will expire in 5 minutes for security reasons.
            </p>
            
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request this password reset, please ignore this email or contact our support team.
            </p>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 Dream Holidays. All rights reserved.
            </p>
          </div>
        </div>
      `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Verification code sent to your email'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send verification code'
        });
    }
});

// @route   POST /api/auth/verify-reset-code
// @desc    Verify password reset code
// @access  Public
router.post('/verify-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        // Check if code exists and is valid
        const storedData = verificationCodes.get(email);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code'
            });
        }

        // Check if code has expired
        if (Date.now() > storedData.expires) {
            verificationCodes.delete(email);
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired'
            });
        }

        // Check if code matches
        if (storedData.code !== code) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: storedData.userId, email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({
            success: true,
            message: 'Code verified successfully',
            resetToken
        });

    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify code'
        });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with verified token
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword, email } = req.body;

        // Verify reset token
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

        if (decoded.email !== email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset token'
            });
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user password
        user.password = hashedPassword;
        await user.save();

        // Clean up verification code
        verificationCodes.delete(email);

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                success: false,
                message: 'Reset token has expired'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to reset password'
        });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, [
    body('currentPassword').exists().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Find user with password field
        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isPasswordMatch = await user.matchPassword(currentPassword);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
});

// @route   DELETE /api/auth/delete-account
// @desc    Delete user account
// @access  Private
router.delete('/delete-account', protect, async (req, res) => {
    try {
        console.log('Delete account request for user:', req.user._id);

        // Find and delete user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete user images from Cloudinary if they exist
        try {
            if (user.avatar?.publicId) {
                await deleteFromCloudinary(user.avatar.publicId);
            }
            if (user.coverImage?.publicId) {
                await deleteFromCloudinary(user.coverImage.publicId);
            }
        } catch (imageError) {
            console.log('Failed to delete user images:', imageError.message);
            // Continue with account deletion even if image deletion fails
        }

        // Delete user from database
        await User.findByIdAndDelete(req.user._id);

        console.log('User account deleted successfully:', req.user._id);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
});

export default router;