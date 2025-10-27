import { Schema, model } from 'mongoose';

const bookingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingType: {
    type: String,
    enum: ['tour', 'hotel', 'flight'],
    required: true
  },
  // Tour booking details
  tour: {
    type: Schema.Types.ObjectId,
    ref: 'Tour'
  },
  tourDate: Date,
  
  // Hotel booking details
  hotel: {
    type: Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  roomType: String,
  checkIn: Date,
  checkOut: Date,
  
  // Flight booking details
  flightDetails: {
    airline: String,
    flightNumber: String,
    departure: {
      airport: String,
      city: String,
      date: Date
    },
    arrival: {
      airport: String,
      city: String,
      date: Date
    },
    class: String
  },
  
  // Guest information
  guests: [{
    name: String,
    age: Number,
    email: String,
    phone: String,
    passportNumber: String
  }],
  numberOfGuests: {
    type: Number,
    required: true
  },
  
  // Payment details
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['bkash', 'sslcommerz', 'card', 'cash'],
    required: true
  },
  transactionId: String,
  paidAt: Date,
  
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  // Special requests
  specialRequests: String,
  
  // Reward points
  rewardPointsEarned: {
    type: Number,
    default: 0
  },
  rewardPointsUsed: {
    type: Number,
    default: 0
  },
  
  // Cancellation
  cancellationReason: String,
  cancelledAt: Date,
  refundAmount: Number,
  
  // Confirmation
  confirmationCode: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate confirmation code before saving
bookingSchema.pre('save', function(next) {
  if (!this.confirmationCode) {
    this.confirmationCode = 'DH' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Calculate reward points (1% of total amount)
bookingSchema.pre('save', function(next) {
  if (this.paymentStatus === 'paid' && !this.rewardPointsEarned) {
    this.rewardPointsEarned = Math.floor(this.totalAmount * 0.01);
  }
  next();
});

export default model('Booking', bookingSchema);