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
  // Basic flight information
  id: String,
  flightNumber: String,
  airline: String,
  airlineName: String,
  aircraftModel: String,
  aircraftCode: String,

  // Route information
  departureAirport: String,
  arrivalAirport: String,
  departureTime: Date,
  arrivalTime: Date,
  duration: String,
  stops: Number,
  oneWay: Boolean,

  // Location details
  departureLocation: {
    iataCode: String,
    name: String,
    city: String,
    country: String,
    fullName: String,
    cityCountry: String
  },
  arrivalLocation: {
    iataCode: String,
    name: String,
    city: String,
    country: String,
    fullName: String,
    cityCountry: String
  },

  // Stop locations for layover flights
  stopLocations: [{
    iataCode: String,
    name: String,
    city: String,
    country: String,
    fullName: String,
    cityCountry: String
  }],

  // Comprehensive price information
  price: {
    total: String,
    currency: String,
    base: String,
    grandTotal: String,
    originalCurrency: String,
    originalTotal: String,
    conversionRate: Number,

    // Price breakdown
    breakdown: {
      basePrice: String,
      taxes: String,
      supplierFees: String,
      otherFees: String,
      totalFees: String
    },

    // Discount information
    discount: {
      hasDiscount: Boolean,
      amount: String,
      percentage: Number,
      originalPrice: String,
      savings: String
    },

    // Per traveler pricing
    perTraveler: [{
      travelerId: String,
      travelerType: String,
      price: {
        total: String,
        base: String,
        currency: String
      }
    }]
  },

  // Complete itinerary information
  itineraries: [{
    duration: String,
    segments: [{
      id: String,
      carrierCode: String,
      carrierName: String,
      number: String,
      aircraft: {
        code: String,
        name: String
      },
      departure: {
        iataCode: String,
        terminal: String,
        at: Date,
        name: String,
        city: String,
        country: String,
        fullName: String,
        cityCountry: String
      },
      arrival: {
        iataCode: String,
        terminal: String,
        at: Date,
        name: String,
        city: String,
        country: String,
        fullName: String,
        cityCountry: String
      },
      duration: String,
      numberOfStops: Number,
      blacklistedInEU: Boolean,
      operating: mongoose.Schema.Types.Mixed
    }]
  }],

  // Additional flight metadata
  travelerPricings: [mongoose.Schema.Types.Mixed],
  validatingAirlineCodes: [String],
  lastTicketingDate: Date,
  numberOfBookableSeats: Number,
  instantTicketingRequired: Boolean,
  nonHomogeneous: Boolean,
  paymentCardRequired: Boolean,

  // Fare details by segment
  fareDetailsBySegment: [{
    segmentId: String,
    cabin: String,
    fareBasis: String,
    class: String,
    brandedFare: String,
    includedCheckedBags: {
      quantity: Number,
      weight: Number,
      weightUnit: String
    }
  }]
});

const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
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
    type: String,
    default: '{}'
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate booking reference before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    this.bookingReference = 'BK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Also generate on validation to ensure it's always present
bookingSchema.pre('validate', function (next) {
  if (!this.bookingReference) {
    this.bookingReference = 'BK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Virtual to parse searchParams as object
bookingSchema.virtual('searchParamsObject').get(function () {
  try {
    return JSON.parse(this.searchParams || '{}');
  } catch (error) {
    return {};
  }
});

// Index for efficient queries
bookingSchema.index({ userId: 1, bookingDate: -1 });
// Note: bookingReference already has an index from unique: true
bookingSchema.index({ status: 1 });

export default mongoose.model('Booking', bookingSchema);