import { create, find, countDocuments, findById } from '../models/Booking';
import { findById as _findById } from '../models/User';
import sendEmail from '../utils/sendEmail';

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export async function createBooking(req, res) {
  try {
    req.body.user = req.user.id;

    const booking = await create(req.body);

    // Populate booking details
    await booking.populate([
      { path: 'user', select: 'name email' },
      { path: 'tour', select: 'title destination price' },
      { path: 'hotel', select: 'name address' }
    ]);

    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
export async function getAllBookings(req, res) {
  try {
    const { status, bookingType, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.status = status;
    if (bookingType) query.bookingType = bookingType;

    const skip = (page - 1) * limit;

    const bookings = await find(query)
      .populate('user', 'name email')
      .populate('tour', 'title destination')
      .populate('hotel', 'name address.city')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / limit),
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export async function getMyBookings(req, res) {
  try {
    const bookings = await find({ user: req.user.id })
      .populate('tour', 'title destination coverImage')
      .populate('hotel', 'name address coverImage')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export async function getBooking(req, res) {
  try {
    const booking = await findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('tour')
      .populate('hotel');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user is booking owner or admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export async function updateBookingStatus(req, res) {
  try {
    const { status } = req.body;

    const booking = await findById(req.params.id)
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;
    await booking.save();

    // Send email notification
    const message = `
      <h1>Booking Status Updated</h1>
      <p>Your booking (${booking.confirmationCode}) status has been updated to: <strong>${status}</strong></p>
      <p>Thank you for choosing Dream Holidays!</p>
    `;

    try {
      await sendEmail({
        email: booking.user.email,
        subject: 'Booking Status Update',
        html: message
      });
    } catch (err) {
      console.log('Email send error:', err);
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private
export async function updatePaymentStatus(req, res) {
  try {
    const { paymentStatus, transactionId } = req.body;

    const booking = await findById(req.params.id)
      .populate('user', 'name email rewardPoints');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.paymentStatus = paymentStatus;
    booking.transactionId = transactionId;

    if (paymentStatus === 'paid') {
      booking.paidAt = Date.now();
      booking.status = 'confirmed';

      // Add reward points to user
      const user = await _findById(booking.user._id);
      user.rewardPoints += booking.rewardPointsEarned;
      await user.save();

      // Send email notification
      const message = `
        <h1>Payment Successful</h1>
        <p>Your payment for booking (${booking.confirmationCode}) has been successful.</p>
        <p>Thank you for choosing Dream Holidays!</p>
      `;

      try {
        await sendEmail({
          email: booking.user.email,
          subject: 'Payment Successful',
          html: message
        });
      } catch (err) {
        console.log('Email send error:', err);
      }
    }

    await booking.save();

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}