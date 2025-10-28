import mongoose from 'mongoose';

const flightSearchSchema = new mongoose.Schema({
    // User information (if logged in)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },

    // Search parameters
    searchParams: {
        departure_id: {
            type: String,
            required: true
        },
        arrival_id: {
            type: String,
            required: true
        },
        outbound_date: {
            type: Date,
            required: true
        },
        return_date: {
            type: Date,
            required: false
        },
        adults: {
            type: Number,
            default: 1,
            min: 1,
            max: 9
        },
        children: {
            type: Number,
            default: 0,
            min: 0,
            max: 9
        },
        infants: {
            type: Number,
            default: 0,
            min: 0,
            max: 9
        },
        travel_class: {
            type: String,
            enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
            default: 'ECONOMY'
        },
        currency: {
            type: String,
            default: 'USD'
        },
        type: {
            type: String,
            enum: ['round_trip', 'one_way'],
            default: 'round_trip'
        }
    },

    // Search results metadata
    searchResults: {
        totalFlights: {
            type: Number,
            default: 0
        },
        searchTime: {
            type: Number, // milliseconds
            default: 0
        },
        source: {
            type: String,
            default: 'amadeus'
        },
        success: {
            type: Boolean,
            default: false
        },
        errorMessage: {
            type: String,
            required: false
        }
    },

    // Flight results (store top results for analytics)
    flights: [{
        flightId: String,
        price: {
            total: String,
            currency: String,
            base: String
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
                duration: String,
                numberOfStops: Number
            }]
        }],
        validatingAirlineCodes: [String]
    }],

    // Session information
    sessionId: {
        type: String,
        required: false
    },
    ipAddress: {
        type: String,
        required: false
    },
    userAgent: {
        type: String,
        required: false
    },

    // Timestamps
    searchedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better query performance
flightSearchSchema.index({ userId: 1, searchedAt: -1 });
flightSearchSchema.index({ 'searchParams.departure_id': 1, 'searchParams.arrival_id': 1 });
flightSearchSchema.index({ searchedAt: -1 });
flightSearchSchema.index({ sessionId: 1 });

// Virtual for popular routes
flightSearchSchema.virtual('route').get(function () {
    return `${this.searchParams.departure_id}-${this.searchParams.arrival_id}`;
});

// Static method to get popular routes
flightSearchSchema.statics.getPopularRoutes = function (limit = 10) {
    return this.aggregate([
        {
            $group: {
                _id: {
                    departure: '$searchParams.departure_id',
                    arrival: '$searchParams.arrival_id'
                },
                count: { $sum: 1 },
                avgPrice: { $avg: { $toDouble: '$flights.price.total' } },
                lastSearched: { $max: '$searchedAt' }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: limit
        }
    ]);
};

// Static method to get search analytics
flightSearchSchema.statics.getSearchAnalytics = function (days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
        {
            $match: {
                searchedAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$searchedAt'
                    }
                },
                totalSearches: { $sum: 1 },
                successfulSearches: {
                    $sum: { $cond: ['$searchResults.success', 1, 0] }
                },
                avgSearchTime: { $avg: '$searchResults.searchTime' },
                uniqueUsers: { $addToSet: '$userId' }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);
};

const FlightSearch = mongoose.model('FlightSearch', flightSearchSchema);

export default FlightSearch;