import mongoose from 'mongoose';

const flightResultSchema = new mongoose.Schema({
    // Reference to the search that generated these results
    searchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FlightSearch',
        required: true
    },

    // Complete flight data from Amadeus
    flights: [{
        id: String,
        price: {
            total: String,
            currency: String,
            base: String,
            fees: [{
                amount: String,
                type: String
            }],
            grandTotal: String
        },
        itineraries: [{
            duration: String,
            segments: [{
                departure: {
                    iataCode: String,
                    terminal: String,
                    at: Date
                },
                arrival: {
                    iataCode: String,
                    terminal: String,
                    at: Date
                },
                carrierCode: String,
                number: String,
                aircraft: {
                    code: String
                },
                operating: {
                    carrierCode: String
                },
                duration: String,
                id: String,
                numberOfStops: {
                    type: Number,
                    default: 0
                },
                blacklistedInEU: {
                    type: Boolean,
                    default: false
                }
            }]
        }],

        // Enhanced flight details for display
        flightNumber: String,
        aircraftModel: String,
        departureAirport: String,
        arrivalAirport: String,
        departureTime: Date,
        arrivalTime: Date,
        duration: String,
        stops: Number,
        airline: String,

        // Additional metadata
        travelerPricings: [{
            travelerId: String,
            fareOption: String,
            travelerType: String,
            price: {
                currency: String,
                total: String,
                base: String
            },
            fareDetailsBySegment: [{
                segmentId: String,
                cabin: String,
                fareBasis: String,
                brandedFare: String,
                class: String,
                includedCheckedBags: {
                    quantity: Number
                }
            }]
        }],

        validatingAirlineCodes: [String],
        lastTicketingDate: Date,
        numberOfBookableSeats: Number,
        oneWay: {
            type: Boolean,
            default: false
        }
    }],

    // Amadeus API metadata
    meta: {
        count: Number,
        links: {
            self: String
        }
    },

    // Dictionaries from Amadeus (airlines, aircraft, etc.)
    dictionaries: {
        locations: mongoose.Schema.Types.Mixed,
        aircraft: mongoose.Schema.Types.Mixed,
        currencies: mongoose.Schema.Types.Mixed,
        carriers: mongoose.Schema.Types.Mixed
    },

    // Cache information
    cacheExpiry: {
        type: Date,
        default: function () {
            // Cache for 30 minutes
            return new Date(Date.now() + 30 * 60 * 1000);
        }
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
flightResultSchema.index({ searchId: 1 });
flightResultSchema.index({ cacheExpiry: 1 });
flightResultSchema.index({ isActive: 1, cacheExpiry: 1 });

// Method to check if cache is still valid
flightResultSchema.methods.isValidCache = function () {
    return this.isActive && new Date() < this.cacheExpiry;
};

// Static method to find valid cached results
flightResultSchema.statics.findValidCache = function (searchId) {
    return this.findOne({
        searchId,
        isActive: true,
        cacheExpiry: { $gt: new Date() }
    });
};

// Static method to cleanup expired cache
flightResultSchema.statics.cleanupExpiredCache = function () {
    return this.updateMany(
        { cacheExpiry: { $lt: new Date() } },
        { isActive: false }
    );
};

const FlightResult = mongoose.model('FlightResult', flightResultSchema);

export default FlightResult;