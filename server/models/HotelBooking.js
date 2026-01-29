import mongoose from 'mongoose';

const hotelBookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guest: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: Date,
    passportNumber: String,
    nationality: String
  },
  hotel: {
    hotelId: { type: String, required: true },
    name: { type: String, required: true },
    address: mongoose.Schema.Types.Mixed,
    cityCode: String,
    latitude: Number,
    longitude: Number
  },
  offer: {
    id: { type: String, required: true },
    checkInDate: { type: String, required: true },
    checkOutDate: { type: String, required: true },
    roomQuantity: { type: Number, required: true },
    adults: { type: Number, required: true },
    room: mongoose.Schema.Types.Mixed,
    price: {
      total: { type: String, required: true },
      currency: { type: String, required: true }
    }
  },
  payment: {
    cardNumber: String,
    cardholderName: String,
    expiryDate: String,
    transactionId: String
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending', 'failed'],
    default: 'confirmed'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate booking reference before saving
hotelBookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    this.bookingReference = 'HB' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

const HotelBooking = mongoose.model('HotelBooking', hotelBookingSchema);
export default HotelBooking;
