import Airport from '../models/Airport.js';
import { getBangladeshAirports, searchAirportsByCountry, getAirportDetails } from '../utils/amadeusClient.js';

class AirportService {

    // Sync Bangladesh airports with database
    static async syncBangladeshAirports() {
        try {
            console.log('Starting Bangladesh airports sync...');

            // Get Bangladesh airports from Amadeus API
            const bangladeshAirports = await getBangladeshAirports();

            if (!bangladeshAirports || bangladeshAirports.length === 0) {
                throw new Error('No Bangladesh airports data received from Amadeus');
            }

            // Transform data for database storage
            const airportsData = bangladeshAirports.map(airport => ({
                iataCode: airport.iataCode,
                name: airport.name,
                city: airport.city,
                country: airport.country || 'Bangladesh',
                countryCode: 'BD',
                coordinates: airport.coordinates,
                timeZone: airport.timeZone,
                type: airport.type || 'AIRPORT',
                isInternational: airport.isInternational || false,
                detailedName: airport.detailedName,
                cityCountry: airport.cityCountry,
                source: airport.source || 'amadeus_direct',
                amadeusData: {
                    subType: airport.type,
                    analytics: airport.analytics || {},
                    lastUpdated: new Date()
                },
                isActive: true
            }));

            // Bulk upsert airports
            const result = await Airport.bulkUpsertAirports(airportsData);

            console.log(`Bangladesh airports sync completed:`, {
                upserted: result.upsertedCount,
                modified: result.modifiedCount,
                matched: result.matchedCount,
                total: airportsData.length
            });

            return {
                success: true,
                message: 'Bangladesh airports synced successfully',
                stats: {
                    total: airportsData.length,
                    upserted: result.upsertedCount,
                    modified: result.modifiedCount,
                    matched: result.matchedCount
                },
                airports: airportsData
            };

        } catch (error) {
            console.error('Error syncing Bangladesh airports:', error);
            return {
                success: false,
                message: 'Failed to sync Bangladesh airports',
                error: error.message
            };
        }
    }

    // Sync airports by country code
    static async syncAirportsByCountry(countryCode, limit = 50) {
        try {
            console.log(`Starting airports sync for country: ${countryCode}`);

            // Get airports from Amadeus API
            const airports = await searchAirportsByCountry(countryCode, limit);

            if (!airports || airports.length === 0) {
                throw new Error(`No airports data received for country ${countryCode}`);
            }

            // Transform data for database storage
            const airportsData = airports.map(airport => ({
                iataCode: airport.iataCode,
                name: airport.name,
                city: airport.city,
                country: airport.country,
                countryCode: countryCode.toUpperCase(),
                coordinates: airport.coordinates,
                timeZone: airport.timeZone,
                type: airport.type || 'AIRPORT',
                detailedName: airport.detailedName,
                cityCountry: airport.cityCountry,
                source: 'amadeus_search',
                amadeusData: {
                    subType: airport.type,
                    lastUpdated: new Date()
                },
                isActive: true
            }));

            // Bulk upsert airports
            const result = await Airport.bulkUpsertAirports(airportsData);

            console.log(`Country ${countryCode} airports sync completed:`, {
                upserted: result.upsertedCount,
                modified: result.modifiedCount,
                matched: result.matchedCount,
                total: airportsData.length
            });

            return {
                success: true,
                message: `Airports for ${countryCode} synced successfully`,
                stats: {
                    total: airportsData.length,
                    upserted: result.upsertedCount,
                    modified: result.modifiedCount,
                    matched: result.matchedCount
                },
                airports: airportsData
            };

        } catch (error) {
            console.error(`Error syncing airports for country ${countryCode}:`, error);
            return {
                success: false,
                message: `Failed to sync airports for ${countryCode}`,
                error: error.message
            };
        }
    }

    // Update airport details from Amadeus
    static async updateAirportDetails(iataCode) {
        try {
            console.log(`Updating airport details for: ${iataCode}`);

            // Get detailed airport information from Amadeus
            const airportDetails = await getAirportDetails(iataCode);

            if (!airportDetails) {
                throw new Error(`No airport details found for ${iataCode}`);
            }

            // Find existing airport or create new one
            let airport = await Airport.findOne({ iataCode: iataCode.toUpperCase() });

            if (airport) {
                // Update existing airport
                await airport.updateFromAmadeus(airportDetails);
                console.log(`Updated existing airport: ${iataCode}`);
            } else {
                // Create new airport
                airport = new Airport({
                    iataCode: airportDetails.iataCode,
                    name: airportDetails.name,
                    city: airportDetails.city,
                    country: airportDetails.country,
                    countryCode: airportDetails.country === 'Bangladesh' ? 'BD' : null,
                    coordinates: airportDetails.coordinates,
                    timeZone: airportDetails.timeZone,
                    type: airportDetails.type || 'AIRPORT',
                    detailedName: airportDetails.detailedName,
                    cityCountry: airportDetails.cityCountry,
                    source: 'amadeus_direct',
                    amadeusData: {
                        subType: airportDetails.type,
                        analytics: airportDetails.analytics || {},
                        lastUpdated: new Date()
                    },
                    isActive: true
                });

                await airport.save();
                console.log(`Created new airport: ${iataCode}`);
            }

            return {
                success: true,
                message: `Airport ${iataCode} updated successfully`,
                airport: airport
            };

        } catch (error) {
            console.error(`Error updating airport ${iataCode}:`, error);
            return {
                success: false,
                message: `Failed to update airport ${iataCode}`,
                error: error.message
            };
        }
    }

    // Get airports from database with search functionality
    static async searchAirportsInDB(searchTerm, options = {}) {
        try {
            const airports = await Airport.searchAirports(searchTerm, options);

            // Increment search count for found airports
            if (airports.length > 0) {
                const airportIds = airports.map(a => a._id);
                await Airport.updateMany(
                    { _id: { $in: airportIds } },
                    {
                        $inc: { searchCount: 1 },
                        $set: { lastSearched: new Date() }
                    }
                );
            }

            return airports;
        } catch (error) {
            console.error('Error searching airports in database:', error);
            throw error;
        }
    }

    // Get airports by country from database
    static async getAirportsByCountryFromDB(countryCode, options = {}) {
        try {
            const airports = await Airport.findByCountry(countryCode, options);
            return airports;
        } catch (error) {
            console.error(`Error getting airports for country ${countryCode}:`, error);
            throw error;
        }
    }

    // Get popular airports from database
    static async getPopularAirports(limit = 20) {
        try {
            const airports = await Airport.getPopularAirports(limit);
            return airports;
        } catch (error) {
            console.error('Error getting popular airports:', error);
            throw error;
        }
    }

    // Sync airports that need updating
    static async syncOutdatedAirports(daysOld = 30) {
        try {
            console.log(`Syncing airports older than ${daysOld} days...`);

            const outdatedAirports = await Airport.getAirportsNeedingUpdate(daysOld);

            if (outdatedAirports.length === 0) {
                return {
                    success: true,
                    message: 'No airports need updating',
                    updated: 0
                };
            }

            let updated = 0;
            let errors = 0;

            // Update airports in batches to avoid rate limiting
            const batchSize = 5;
            for (let i = 0; i < outdatedAirports.length; i += batchSize) {
                const batch = outdatedAirports.slice(i, i + batchSize);

                const updatePromises = batch.map(async (airport) => {
                    try {
                        const result = await this.updateAirportDetails(airport.iataCode);
                        if (result.success) updated++;
                        else errors++;
                    } catch (error) {
                        console.error(`Failed to update airport ${airport.iataCode}:`, error);
                        errors++;
                    }
                });

                await Promise.all(updatePromises);

                // Add delay between batches to respect rate limits
                if (i + batchSize < outdatedAirports.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            console.log(`Outdated airports sync completed: ${updated} updated, ${errors} errors`);

            return {
                success: true,
                message: `Updated ${updated} airports, ${errors} errors`,
                updated,
                errors,
                total: outdatedAirports.length
            };

        } catch (error) {
            console.error('Error syncing outdated airports:', error);
            return {
                success: false,
                message: 'Failed to sync outdated airports',
                error: error.message
            };
        }
    }

    // Get database statistics
    static async getDatabaseStats() {
        try {
            const stats = await Airport.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAirports: { $sum: 1 },
                        activeAirports: { $sum: { $cond: ['$isActive', 1, 0] } },
                        internationalAirports: { $sum: { $cond: ['$isInternational', 1, 0] } },
                        countriesCount: { $addToSet: '$countryCode' },
                        totalSearches: { $sum: '$searchCount' },
                        avgSearchCount: { $avg: '$searchCount' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalAirports: 1,
                        activeAirports: 1,
                        internationalAirports: 1,
                        countriesCount: { $size: '$countriesCount' },
                        totalSearches: 1,
                        avgSearchCount: { $round: ['$avgSearchCount', 2] }
                    }
                }
            ]);

            const bangladeshStats = await Airport.countDocuments({ countryCode: 'BD', isActive: true });

            return {
                ...stats[0],
                bangladeshAirports: bangladeshStats
            };

        } catch (error) {
            console.error('Error getting database stats:', error);
            throw error;
        }
    }
}

export default AirportService;