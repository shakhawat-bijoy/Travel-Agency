# Enhanced Flights API Examples

## Flight Search with Enhanced Pricing

### Basic Flight Search

```bash
GET /api/flights/search?departure_id=DAC&arrival_id=DXB&outbound_date=2024-12-15&adults=1&currency=USD
```

### Response includes enhanced pricing information:

```json
{
  "success": true,
  "data": {
    "flights": [
      {
        "id": "1",
        "price": {
          "total": "450.00",
          "currency": "USD",
          "base": "380.00",
          "fees": [
            { "type": "TAXES", "amount": "85.00" },
            { "type": "SUPPLIER", "amount": "15.00" }
          ],
          "breakdown": {
            "basePrice": 380.0,
            "totalFees": 100.0,
            "taxes": 85.0,
            "supplierFees": 15.0,
            "otherFees": 0
          },
          "discount": {
            "hasDiscount": true,
            "amount": 30.0,
            "percentage": 6,
            "originalPrice": 480.0,
            "savings": 30.0
          },
          "perTraveler": [
            {
              "travelerId": "1",
              "travelerType": "ADULT",
              "price": {
                "total": "450.00",
                "base": "380.00",
                "currency": "USD"
              }
            }
          ]
        },
        "flightNumber": "EK582",
        "airline": "EK",
        "departureAirport": "DAC",
        "arrivalAirport": "DXB",
        "duration": "PT7H30M",
        "stops": 0
      }
    ]
  }
}
```

## Bangladesh Airports

### Get All Bangladesh Airports

```bash
GET /api/flights/airports/bangladesh
```

### Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "DAC",
      "name": "Hazrat Shahjalal International Airport",
      "city": "Dhaka",
      "country": "Bangladesh",
      "iataCode": "DAC",
      "detailedName": "Hazrat Shahjalal International Airport (DAC)",
      "cityCountry": "Dhaka, Bangladesh",
      "isInternational": true,
      "coordinates": {
        "latitude": 23.8433,
        "longitude": 90.3978
      }
    },
    {
      "id": "CGP",
      "name": "Shah Amanat International Airport",
      "city": "Chittagong",
      "country": "Bangladesh",
      "iataCode": "CGP",
      "detailedName": "Shah Amanat International Airport (CGP)",
      "cityCountry": "Chittagong, Bangladesh",
      "isInternational": true
    }
  ],
  "total": 8,
  "country": "Bangladesh"
}
```

### Search Airports by Country

```bash
GET /api/flights/airports?query=dhaka&country=bangladesh
```

## Price Analysis

### Get Price Analysis for Search Results

```bash
GET /api/flights/price-analysis/{searchId}
```

### Response:

```json
{
  "success": true,
  "data": {
    "priceStatistics": {
      "minimum": 420.0,
      "maximum": 850.0,
      "average": 635.5,
      "currency": "USD",
      "totalFlights": 15
    },
    "bestDeals": {
      "cheapest": {
        "id": "1",
        "price": {
          "total": "420.00",
          "discount": {
            "hasDiscount": false
          }
        },
        "flightNumber": "BG147",
        "airline": "BG"
      },
      "bestValue": [
        {
          "id": "3",
          "price": {
            "total": "480.00",
            "discount": {
              "hasDiscount": true,
              "percentage": 15,
              "savings": 85.0
            }
          },
          "flightNumber": "EK582",
          "discountPercentage": 15
        }
      ]
    },
    "discountAnalysis": {
      "flightsWithDiscounts": 8,
      "totalPossibleSavings": 245.0,
      "averageDiscountPercentage": 8.5,
      "topDiscounts": [
        {
          "id": "3",
          "flightNumber": "EK582",
          "originalPrice": 565.0,
          "discountedPrice": 480.0,
          "savings": 85.0,
          "percentage": 15
        }
      ]
    },
    "recommendations": {
      "bestOverall": "1",
      "bestValue": "3",
      "quickest": "7",
      "mostConvenient": "2"
    }
  }
}
```

## Key Features

### Enhanced Pricing Information

- **Base Price**: The core flight price before taxes and fees
- **Fee Breakdown**: Detailed breakdown of taxes, supplier fees, and other charges
- **Discount Detection**: Automatic detection of discounts and promotional pricing
- **Savings Calculation**: Shows original price vs discounted price
- **Per Traveler Pricing**: Individual pricing for each passenger type

### Bangladesh Airport Support

- Complete list of all major Bangladesh airports
- International vs domestic airport classification
- Detailed airport information including coordinates
- Enhanced search with country filtering

### Price Analysis

- Statistical analysis of all flight options
- Best deal recommendations
- Price range categorization (budget, mid-range, premium)
- Discount analysis and savings opportunities
- Smart recommendations based on different criteria

### Usage Tips

1. Use the Bangladesh airports endpoint to get accurate IATA codes
2. Check the discount information to find the best deals
3. Use price analysis to compare options effectively
4. Filter by country when searching for specific region airports

## Popular Routes from Bangladesh

### Get Popular Flight Routes

```bash
GET /api/flights/popular-routes/bangladesh
```

### Response:

```json
{
  "success": true,
  "data": {
    "international": [
      {
        "from": {
          "code": "DAC",
          "name": "Dhaka",
          "airport": "Hazrat Shahjalal International Airport"
        },
        "to": {
          "code": "DXB",
          "name": "Dubai",
          "airport": "Dubai International Airport"
        },
        "popularity": 95,
        "averagePrice": {
          "min": 420,
          "max": 680,
          "currency": "USD"
        },
        "airlines": ["EK", "FZ", "BG"],
        "flightTime": "PT7H30M"
      }
    ],
    "domestic": [
      {
        "from": {
          "code": "DAC",
          "name": "Dhaka",
          "airport": "Hazrat Shahjalal International Airport"
        },
        "to": {
          "code": "CGP",
          "name": "Chittagong",
          "airport": "Shah Amanat International Airport"
        },
        "popularity": 95,
        "averagePrice": {
          "min": 80,
          "max": 150,
          "currency": "USD"
        },
        "airlines": ["BG", "US"],
        "flightTime": "PT1H15M",
        "domestic": true
      }
    ]
  },
  "total": 13,
  "country": "Bangladesh"
}
```

### Updated Usage Tips

1. Use the Bangladesh airports endpoint to get accurate IATA codes
2. Check the discount information to find the best deals
3. Use price analysis to compare options effectively
4. Filter by country when searching for specific region airports
5. Use popular routes to discover trending destinations from Bangladesh
6. Check both international and domestic route options
7. Monitor discount percentages to find the best savings opportunities

## Enhanced Airport Search

### Get Airports by Country Code

```bash
GET /api/flights/airports/country/BD?limit=20
```

### Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "DAC",
      "name": "Hazrat Shahjalal International Airport",
      "city": "Dhaka",
      "country": "Bangladesh",
      "iataCode": "DAC",
      "detailedName": "Hazrat Shahjalal International Airport (DAC)",
      "coordinates": {
        "latitude": 23.8433,
        "longitude": 90.3978
      }
    }
  ],
  "total": 8,
  "countryCode": "BD",
  "source": "amadeus"
}
```

### Get Detailed Airport Information

```bash
GET /api/flights/airport/DAC
```

### Response:

```json
{
  "success": true,
  "data": {
    "id": "DAC",
    "name": "Hazrat Shahjalal International Airport",
    "city": "Dhaka",
    "country": "Bangladesh",
    "iataCode": "DAC",
    "type": "AIRPORT",
    "timeZone": "+06:00",
    "detailedName": "Hazrat Shahjalal International Airport (DAC)",
    "cityCountry": "Dhaka, Bangladesh",
    "coordinates": {
      "latitude": 23.8433,
      "longitude": 90.3978
    },
    "analytics": {
      "travelers": {
        "score": 85
      }
    }
  },
  "iataCode": "DAC",
  "source": "amadeus"
}
```

## Complete API Endpoints Summary

### Flight Search

- `GET /api/flights/search` - Search flights with enhanced pricing
- `GET /api/flights/results/:searchId` - Get cached flight results
- `GET /api/flights/price-analysis/:searchId` - Get price analysis

### Airport Information

- `GET /api/flights/airports?query=keyword` - Search airports by keyword
- `GET /api/flights/airports/bangladesh` - Get all Bangladesh airports
- `GET /api/flights/airports/country/:countryCode` - Get airports by country
- `GET /api/flights/airport/:iataCode` - Get detailed airport info

### Routes and Booking

- `GET /api/flights/popular-routes/bangladesh` - Popular routes from Bangladesh
- `POST /api/flights/book` - Book a flight
- `GET /api/flights/bookings/:userId` - Get user bookings

### Final Usage Tips

1. All airport data is fetched directly from Amadeus API for maximum accuracy
2. Bangladesh airports include both search results and known airport codes
3. Use country code "BD" for Bangladesh airport searches
4. Enhanced pricing shows discounts, fees breakdown, and savings
5. Price analysis provides comprehensive flight comparison data
6. Popular routes include both international and domestic options
7. Airport details include coordinates, timezone, and analytics data

## Database Operations

### Sync Bangladesh Airports to Database

```bash
POST /api/flights/airports/sync/bangladesh
```

### Response:

```json
{
  "success": true,
  "message": "Bangladesh airports synced successfully",
  "data": {
    "stats": {
      "total": 8,
      "upserted": 8,
      "modified": 0,
      "matched": 0
    },
    "airports": [
      {
        "iataCode": "DAC",
        "name": "Hazrat Shahjalal International Airport",
        "city": "Dhaka",
        "country": "Bangladesh",
        "isInternational": true
      }
    ]
  }
}
```

### Search Airports from Database

```bash
GET /api/flights/airports/db/search?query=dhaka&country=bangladesh&limit=10
```

### Get Airports by Country from Database

```bash
GET /api/flights/airports/db/country/BD?limit=20&international=true
```

### Get Popular Airports from Database

```bash
GET /api/flights/airports/db/popular?limit=15
```

### Get Database Statistics

```bash
GET /api/flights/airports/db/stats
```

### Response:

```json
{
  "success": true,
  "data": {
    "totalAirports": 150,
    "activeAirports": 148,
    "internationalAirports": 45,
    "countriesCount": 25,
    "totalSearches": 1250,
    "avgSearchCount": 8.33,
    "bangladeshAirports": 8
  }
}
```

### Sync Outdated Airports

```bash
PUT /api/flights/airports/sync/outdated
Content-Type: application/json

{
  "daysOld": 30
}
```

## Database Initialization

### Run the initialization script:

```bash
cd server
node scripts/initBangladeshAirports.js
```

This script will:

1. Connect to your MongoDB database
2. Fetch all Bangladesh airports from Amadeus API
3. Store them in the database with enhanced information
4. Display statistics and results

## Database Features

### Airport Model Features:

- **Complete Airport Data**: IATA codes, names, cities, countries, coordinates
- **Enhanced Information**: Detailed names, city-country combinations, timezone
- **Classification**: International vs domestic, active status
- **Search Optimization**: Text indexes for fast searching
- **Usage Tracking**: Search counts and last searched timestamps
- **Data Source Tracking**: Tracks whether data came from Amadeus API or static fallback
- **Bulk Operations**: Efficient bulk upsert operations for syncing

### Service Features:

- **Smart Syncing**: Combines API search results with known airport codes
- **Error Handling**: Graceful fallback to static data if API fails
- **Batch Processing**: Handles large datasets efficiently
- **Update Management**: Tracks and updates outdated airport information
- **Search Functionality**: Advanced search with country filtering
- **Statistics**: Comprehensive database statistics and analytics

### Performance Optimizations:

- **Indexes**: Optimized database indexes for fast queries
- **Caching**: Search count tracking for popularity-based sorting
- **Bulk Operations**: Efficient bulk upsert operations
- **Rate Limiting**: Respects API rate limits during batch updates
