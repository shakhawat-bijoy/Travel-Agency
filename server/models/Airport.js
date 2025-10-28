import mongoose from 'mongoose';

const airportSchema = new mongoose.Schema({
    // Basic airport information
    iataCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3
    },
    icaoCode: {
        type: String,
        uppercase: true,
        minlength: 4,
        maxlength: 4,
        sparse: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    countryCode: {
        type: String,
        uppercase: true,
        minlength: 2,
        maxlength: 2
    },

    // Location information
    coordinates: {
        latitude: {
            type: Number,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180
        }
    },
    timeZone: {
        type: String,
        trim: true
    },
    elevation: {
        type: Number // in meters
    },

    // Airport classification
    type: {
        type: String,
        enum: ['AIRPORT', 'CITY', 'HELIPORT', 'RAIL_STATION', 'BUS_STATION'],
        default: 'AIRPORT'
    },
    isInternational: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // Enhanced information
    detailedName: {
        type: String,
        trim: true
    },
    cityCountry: {
        type: String,
        trim: true
    },

    // Amadeus specific data
    amadeusData: {
        subType: String,
        analytics: {
            travelers: {
                score: Number
            }
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },

    // Data source tracking
    source: {
        type: String,
        enum: ['amadeus_search', 'amadeus_direct', 'static_fallback', 'manual'],
        default: 'amadeus_direct'
    },

    // Popularity and usage statistics
    searchCount: {
        type: Number,
        default: 0
    },
    lastSearched: {
        type: Date
    },

    // Additional metadata
    aliases: [String], // Alternative names
    tags: [String], // For categorization (e.g., 'hub', 'budget', 'cargo')

    // Operational information
    runways: [{
        length: Number, // in meters
        width: Number,  // in meters
        surface: String
    }],
    terminals: [{
        name: String,
        code: String,
        capacity: Number
    }]
}, {
    timestamps: true
});

// Indexes for efficient queries
airportSchema.index({ iataCode: 1 });
airportSchema.index({ country: 1, isActive: 1 });
airportSchema.index({ countryCode: 1, isActive: 1 });
airportSchema.index({ city: 1, country: 1 });
airportSchema.index({ isInternational: 1, isActive: 1 });
airportSchema.index({ searchCount: -1 });
airportSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

// Text index for search functionality
airportSchema.index({
    name: 'text',
    city: 'text',
    country: 'text',
    iataCode: 'text',
    detailedName: 'text'
});

// Virtual for full display name
airportSchema.virtual('fullName').get(function () {
    return this.detailedName || `${this.name} (${this.iataCode})`;
});

// Virtual for location string
airportSchema.virtual('location').get(function () {
    return this.cityCountry || `${this.city}, ${this.country}`;
});

// Method to increment search count
airportSchema.methods.incrementSearchCount = function () {
    this.searchCount += 1;
    this.lastSearched = new Date();
    return this.save();
};

// Method to update from Amadeus data
airportSchema.methods.updateFromAmadeus = function (amadeusData) {
    if (amadeusData.name) this.name = amadeusData.name;
    if (amadeusData.city) this.city = amadeusData.city;
    if (amadeusData.country) this.country = amadeusData.country;
    if (amadeusData.countryCode) this.countryCode = amadeusData.countryCode;
    if (amadeusData.coordinates) this.coordinates = amadeusData.coordinates;
    if (amadeusData.timeZone) this.timeZone = amadeusData.timeZone;
    if (amadeusData.type) this.amadeusData.subType = amadeusData.type;
    if (amadeusData.detailedName) this.detailedName = amadeusData.detailedName;
    if (amadeusData.cityCountry) this.cityCountry = amadeusData.cityCountry;

    this.amadeusData.lastUpdated = new Date();
    this.source = amadeusData.source || 'amadeus_direct';

    return this.save();
};

// Static method to find airports by country
airportSchema.statics.findByCountry = function (countryCode, options = {}) {
    const query = {
        $or: [
            { countryCode: countryCode.toUpperCase() },
            { country: new RegExp(countryCode, 'i') }
        ],
        isActive: true
    };

    if (options.international !== undefined) {
        query.isInternational = options.international;
    }

    return this.find(query)
        .sort({ isInternational: -1, searchCount: -1, city: 1 })
        .limit(options.limit || 50);
};

// Static method to search airports
airportSchema.statics.searchAirports = function (searchTerm, options = {}) {
    const query = {
        $or: [
            { iataCode: new RegExp(searchTerm, 'i') },
            { name: new RegExp(searchTerm, 'i') },
            { city: new RegExp(searchTerm, 'i') },
            { country: new RegExp(searchTerm, 'i') }
        ],
        isActive: true
    };

    if (options.country) {
        query.$and = [
            { $or: query.$or },
            {
                $or: [
                    { countryCode: options.country.toUpperCase() },
                    { country: new RegExp(options.country, 'i') }
                ]
            }
        ];
        delete query.$or;
    }

    return this.find(query)
        .sort({ searchCount: -1, isInternational: -1 })
        .limit(options.limit || 15);
};

// Static method to get popular airports
airportSchema.statics.getPopularAirports = function (limit = 20) {
    return this.find({ isActive: true })
        .sort({ searchCount: -1, isInternational: -1 })
        .limit(limit);
};

// Static method to bulk upsert airports
airportSchema.statics.bulkUpsertAirports = async function (airportsData) {
    const operations = airportsData.map(airportData => ({
        updateOne: {
            filter: { iataCode: airportData.iataCode },
            update: {
                $set: {
                    ...airportData,
                    'amadeusData.lastUpdated': new Date()
                }
            },
            upsert: true
        }
    }));

    return this.bulkWrite(operations);
};

// Static method to get airports needing update
airportSchema.statics.getAirportsNeedingUpdate = function (daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.find({
        isActive: true,
        $or: [
            { 'amadeusData.lastUpdated': { $lt: cutoffDate } },
            { 'amadeusData.lastUpdated': { $exists: false } }
        ]
    });
};

const Airport = mongoose.model('Airport', airportSchema);

export default Airport;