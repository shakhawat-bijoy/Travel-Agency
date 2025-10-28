import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AirportService from '../services/airportService.js';
import '../models/Airport.js'; // Ensure model is loaded

// Load environment variables
dotenv.config();

async function initBangladeshAirports() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-booking');
        console.log('Connected to MongoDB successfully');

        // Sync Bangladesh airports
        console.log('\n=== Starting Bangladesh Airports Initialization ===');
        const result = await AirportService.syncBangladeshAirports();

        if (result.success) {
            console.log('\n✅ Bangladesh airports initialized successfully!');
            console.log('Statistics:', result.stats);

            console.log('\n📊 Airports added/updated:');
            result.airports.forEach(airport => {
                console.log(`  • ${airport.detailedName} - ${airport.cityCountry} (${airport.isInternational ? 'International' : 'Domestic'})`);
            });

            // Get database stats
            console.log('\n=== Database Statistics ===');
            const stats = await AirportService.getDatabaseStats();
            console.log('Total airports in database:', stats.totalAirports);
            console.log('Active airports:', stats.activeAirports);
            console.log('International airports:', stats.internationalAirports);
            console.log('Bangladesh airports:', stats.bangladeshAirports);
            console.log('Countries covered:', stats.countriesCount);

        } else {
            console.error('\n❌ Failed to initialize Bangladesh airports');
            console.error('Error:', result.error);
            process.exit(1);
        }

    } catch (error) {
        console.error('\n💥 Initialization failed:', error);
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the initialization
console.log('🚀 Bangladesh Airports Database Initialization');
console.log('='.repeat(50));
initBangladeshAirports();