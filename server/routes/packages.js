import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    bookPackage,
    getUserPackageBookings,
    getAllPackageBookings,
    getPackageBookingById,
    getPackageBookingByReference,
    cancelPackageBooking,
    updatePackageBookingStatus,
    deletePackageBooking,
    getPackageBookingsByEmail,
    submitCustomPackageRequest,
    getUserCustomPackageRequests
} from '../controllers/packageController.js';

const router = express.Router();

// Book a package
router.post('/book', authenticate, bookPackage);

// Get user's package bookings
router.get('/bookings/:userId', getUserPackageBookings);

// Get all package bookings (admin)
router.get('/bookings/all', getAllPackageBookings);

// Get package booking by ID
router.get('/:bookingId', getPackageBookingById);

// Get package booking by reference
router.get('/reference/:reference', getPackageBookingByReference);

// Get package bookings by email
router.get('/email/:email', getPackageBookingsByEmail);

// Cancel package booking
router.put('/:bookingId/cancel', authenticate, cancelPackageBooking);

// Update booking status
router.put('/:bookingId/status', authenticate, updatePackageBookingStatus);

// Delete package booking
router.delete('/:bookingId', authenticate, deletePackageBooking);

// Custom package requests
router.post('/custom-requests', authenticate, submitCustomPackageRequest);
router.get('/custom-requests/:userId', authenticate, getUserCustomPackageRequests);

export default router;
