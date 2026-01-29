import HotelBooking from '../models/HotelBooking.js';

// @desc    Create a new hotel booking
// @route   POST /api/hotels/book
// @access  Private
export const createHotelBooking = async (req, res) => {
  try {
    const { hotel, offer, guest, payment, totalAmount, currency, userId } = req.body;

    const booking = new HotelBooking({
      userId: userId || req.user?._id,
      hotel,
      offer,
      guest,
      payment,
      totalAmount,
      currency: currency || 'USD',
      status: 'confirmed'
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Hotel booking confirmed successfully',
      data: booking
    });
  } catch (error) {
    console.error('Hotel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hotel booking',
      error: error.message
    });
  }
};

// @desc    Get all hotel bookings for a user
// @route   GET /api/hotels/bookings/:userId
// @access  Private
export const getUserHotelBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await HotelBooking.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel bookings',
      error: error.message
    });
  }
};

// @desc    Delete a hotel booking
// @route   DELETE /api/hotels/bookings/:id
// @access  Private
export const deleteHotelBooking = async (req, res) => {
  try {
    const booking = await HotelBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
};
