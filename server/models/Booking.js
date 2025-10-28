import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  passportNumber: {
    type: String,
    trim: true
  },
  nationality: {
    type: String,
    trim: true
  }
});

const paymentSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true
  },
  cardholderName: {
    type: String,
    required: true,
    trim: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  // CVV is not stored for security reasons
  paymentMethod: {
    type: String,
    default: 'credit_card'
  },
  transactionId: {
    type: String,
    unique: true
  }
});

const flightDetailsSchema = new mongoose.Schema({
  flightNumber: String,
  airline: String,
  aircraftModel: String,
  departureAirport: String,
  arrivalAirport: String,
  departureTime: Date,
  arrivalTime: Date,
  duration: String,
  stops: Number,
  price: {
    total: String,
    currency: String
  },
  itineraries: [{
    segments: [{
      carrierCode: String,
      number: String,
      aircraft: {
        code: String
      },
      departure: {
        iataCode: String,
        at: Date
      },
      arrival: {
        iataCode: String,
        at: Date
      },
      duration: String
    }]
  }]
});

const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  passenger: {
    type: passengerSchema,
    required: true
  },
  flight: {
    type: flightDetailsSchema,
    required: true
  },
  payment: {
    type: paymentSchema,
    required: true
  },
  searchParams: {
    departure_id: String,
    arrival_id: String,
    outbound_date: String,
    return_date: String,
    adults: Number,
    children: Number,
    infants: Number,
    travel_class: String,
    type: String
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
  },
  cancellationDate: {
    type: Date
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Generate booking reference before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    this.bookingReference = 'BK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Index for efficient queries
bookingSchema.index({ userId: 1, bookingDate: -1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ status: 1 });

export default mongoose.model('Booking', bookingSchema);