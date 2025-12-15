import PackageBooking from '../models/PackageBooking.js';
import CustomPackageRequest from '../models/CustomPackageRequest.js';
import User from '../models/User.js';
import SavedCard from '../models/SavedCard.js';

// Book a package
export const bookPackage = async (req, res) => {
    try {
        const { packageData, travelers, payment, selectedDate, numberOfTravelers, totalPrice, userId } = req.body;

        // Validate required fields
        if (!packageData || !travelers || !payment || !selectedDate || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate travelers array
        if (!Array.isArray(travelers) || travelers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one traveler is required'
            });
        }

        // Validate each traveler
        for (let traveler of travelers) {
            if (!traveler.firstName || !traveler.lastName || !traveler.email || !traveler.phone || !traveler.dateOfBirth) {
                return res.status(400).json({
                    success: false,
                    message: 'All traveler fields are required'
                });
            }
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create package booking
        const packageBooking = new PackageBooking({
            userId,
            packageData,
            travelers,
            payment: {
                cardNumber: payment.cardNumber,
                expiryDate: payment.expiryDate,
                cardholderName: payment.cardholderName,
                cvv: payment.cvv || null,
                savedCardId: payment.savedCardId || null,
                paymentMethod: payment.savedCardId ? 'saved_card' : 'new_card'
            },
            selectedDate: new Date(selectedDate),
            numberOfTravelers,
            totalPrice,
            status: 'confirmed'
        });

        // Save to database
        await packageBooking.save();

        // Populate user details for response
        await packageBooking.populate('userId', 'firstName lastName email phone');

        res.status(201).json({
            success: true,
            message: 'Package booking created successfully',
            data: packageBooking
        });

    } catch (error) {
        console.error('Error booking package:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error booking package'
        });
    }
};

// Get user's package bookings
export const getUserPackageBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get bookings with pagination
        const skip = (page - 1) * limit;
        const bookings = await PackageBooking.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'firstName lastName email phone');

        const total = await PackageBooking.countDocuments({ userId });

        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching user package bookings:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching bookings'
        });
    }
};

// Get all package bookings
export const getAllPackageBookings = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;

        const skip = (page - 1) * limit;
        const bookings = await PackageBooking.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'firstName lastName email phone');

        const total = await PackageBooking.countDocuments();

        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching all package bookings:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching bookings'
        });
    }
};

// Get package booking by ID
export const getPackageBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await PackageBooking.findById(bookingId)
            .populate('userId', 'firstName lastName email phone');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.error('Error fetching package booking:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching booking'
        });
    }
};

// Get package booking by reference
export const getPackageBookingByReference = async (req, res) => {
    try {
        const { reference } = req.params;

        const booking = await PackageBooking.findOne({ bookingReference: reference })
            .populate('userId', 'firstName lastName email phone');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.error('Error fetching package booking by reference:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching booking'
        });
    }
};

// Cancel package booking
export const cancelPackageBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await PackageBooking.findByIdAndUpdate(
            bookingId,
            { status: 'cancelled' },
            { new: true }
        ).populate('userId', 'firstName lastName email phone');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });

    } catch (error) {
        console.error('Error cancelling package booking:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error cancelling booking'
        });
    }
};

// Update package booking status
export const updatePackageBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const booking = await PackageBooking.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true }
        ).populate('userId', 'firstName lastName email phone');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking
        });

    } catch (error) {
        console.error('Error updating package booking status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating booking'
        });
    }
};

// Delete package booking (admin only)
export const deletePackageBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await PackageBooking.findByIdAndDelete(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
            data: booking
        });

    } catch (error) {
        console.error('Error deleting package booking:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting booking'
        });
    }
};

// Get package bookings by email
export const getPackageBookingsByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Find user by email first
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const skip = (page - 1) * limit;
        const bookings = await PackageBooking.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'firstName lastName email phone');

        const total = await PackageBooking.countDocuments({ userId: user._id });

        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching package bookings by email:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching bookings'
        });
    }
};

// Submit a custom package request
export const submitCustomPackageRequest = async (req, res) => {
    try {
        const {
            destination,
            duration,
            travelers = 1,
            startDate,
            endDate,
            budget = 'moderate',
            accommodation = 'standard',
            activities = [],
            meals = 'breakfast',
            transportation = 'flight',
            specialRequests = '',
            notes = ''
        } = req.body;

        const userId = req.user?._id || req.body.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required to submit a custom package request'
            });
        }

        if (!destination || !duration || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Destination, duration, start date, and end date are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const request = await CustomPackageRequest.create({
            userId,
            destination,
            duration,
            travelers,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            budget,
            accommodation,
            activities,
            meals,
            transportation,
            specialRequests,
            notes
        });

        res.status(201).json({
            success: true,
            message: 'Custom package request submitted successfully',
            data: request
        });
    } catch (error) {
        console.error('Error submitting custom package request:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error submitting custom package request'
        });
    }
};

// Get a user's custom package requests
export const getUserCustomPackageRequests = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const requesterId = req.user?._id?.toString();
        const isAdmin = req.user?.role === 'admin';
        if (requesterId && requesterId !== userId && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You are not allowed to view these requests'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const skip = (page - 1) * limit;
        const requests = await CustomPackageRequest.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await CustomPackageRequest.countDocuments({ userId });

        res.status(200).json({
            success: true,
            data: requests,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching custom package requests:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching custom package requests'
        });
    }
};
