import axios from "axios";

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
  const CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
  const CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log('Environment variables check:', {
      CLIENT_ID: CLIENT_ID ? 'SET' : 'NOT SET',
      CLIENT_SECRET: CLIENT_SECRET ? 'SET' : 'NOT SET'
    });
    throw new Error(
      "AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET must be set in .env"
    );
  }

  const url = `${AMADEUS_BASE}/v1/security/oauth2/token`;
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);

  const res = await axios.post(url, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const { access_token, expires_in } = res.data;
  cachedToken = access_token;
  tokenExpiresAt = Date.now() + (expires_in - 60) * 1000; // refresh 1 min early
  return cachedToken;
}

async function searchFlights(queryParams) {
  const token = await getAccessToken();
  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
  const url = `${AMADEUS_BASE}/v2/shopping/flight-offers`;
  const res = await axios.get(url, {
    params: queryParams,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  return res.data;
}

async function searchAirports(keyword) {
  const token = await getAccessToken();
  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
  const url = `${AMADEUS_BASE}/v1/reference-data/locations`;
  const res = await axios.get(url, {
    params: {
      subType: "AIRPORT,CITY",
      keyword: keyword,
      "page[limit]": 10,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  return res.data;
}

async function searchAirlines(keyword) {
  const token = await getAccessToken();
  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
  const url = `${AMADEUS_BASE}/v1/reference-data/airlines`;
  
  // Amadeus Airlines API searches by airline code (2-3 letter IATA codes)
  // It returns all airlines if no code is specified, or specific airline(s) if code(s) provided
  const params = {};
  
  // Only add airlineCodes parameter if we have a valid-looking code
  if (keyword && keyword.trim().length > 0) {
    params.airlineCodes = keyword.toUpperCase().trim();
  }
  
  const res = await axios.get(url, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  return res.data;
}

async function getBangladeshAirports() {
  const token = await getAccessToken();
  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";

  try {
    // First, try to search for Bangladesh airports using the locations API
    console.log("Searching for Bangladesh airports via Amadeus API...");

    const searchUrl = `${AMADEUS_BASE}/v1/reference-data/locations`;
    const searchResponse = await axios.get(searchUrl, {
      params: {
        subType: "AIRPORT",
        keyword: "Bangladesh",
        "page[limit]": 20,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    let airportsFromSearch = [];
    if (searchResponse.data && searchResponse.data.data) {
      airportsFromSearch = searchResponse.data.data
        .filter(location =>
          location.address?.countryCode === 'BD' ||
          location.address?.countryName?.toLowerCase().includes('bangladesh')
        )
        .map(location => ({
          id: location.iataCode,
          name: location.name,
          city: location.address?.cityName || location.name,
          country: location.address?.countryName || 'Bangladesh',
          iataCode: location.iataCode,
          type: location.subType,
          timeZone: location.timeZoneOffset,
          geoCode: location.geoCode,
          detailedName: `${location.name} (${location.iataCode})`,
          cityCountry: `${location.address?.cityName || location.name}, Bangladesh`,
          coordinates: location.geoCode ? {
            latitude: location.geoCode.latitude,
            longitude: location.geoCode.longitude
          } : null,
          isInternational: ['DAC', 'CGP', 'CXB', 'SYL'].includes(location.iataCode),
          source: 'amadeus_search'
        }));
    }

    // Bangladesh's major airports with their IATA codes (fallback and additional airports)
    const bangladeshAirportCodes = [
      'DAC', // Hazrat Shahjalal International Airport, Dhaka
      'CGP', // Shah Amanat International Airport, Chittagong
      'SPD', // Saidpur Airport
      'RJH', // Rajshahi Airport
      'JSR', // Jessore Airport
      'BZL', // Barisal Airport
      'CXB', // Cox's Bazar Airport
      'SYL'  // Sylhet Osmani International Airport
    ];

    // Get detailed information for known airports that might not be in search results
    const knownAirportCodes = bangladeshAirportCodes.filter(code =>
      !airportsFromSearch.some(airport => airport.iataCode === code)
    );

    const airportPromises = knownAirportCodes.map(async (code) => {
      try {
        const url = `${AMADEUS_BASE}/v1/reference-data/locations/${code}`;
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const location = res.data.data;
        return {
          id: location.iataCode,
          name: location.name,
          city: location.address?.cityName || location.name,
          country: location.address?.countryName || 'Bangladesh',
          iataCode: location.iataCode,
          type: location.subType,
          timeZone: location.timeZoneOffset,
          geoCode: location.geoCode,
          detailedName: `${location.name} (${location.iataCode})`,
          cityCountry: `${location.address?.cityName || location.name}, Bangladesh`,
          coordinates: location.geoCode ? {
            latitude: location.geoCode.latitude,
            longitude: location.geoCode.longitude
          } : null,
          isInternational: ['DAC', 'CGP', 'CXB', 'SYL'].includes(location.iataCode),
          source: 'amadeus_direct'
        };
      } catch (error) {
        console.warn(`Could not fetch details for airport ${code}:`, error.message);
        // Return basic info if API call fails
        return {
          id: code,
          name: getBangladeshAirportName(code),
          city: getBangladeshAirportCity(code),
          country: 'Bangladesh',
          iataCode: code,
          type: 'AIRPORT',
          detailedName: `${getBangladeshAirportName(code)} (${code})`,
          cityCountry: `${getBangladeshAirportCity(code)}, Bangladesh`,
          isInternational: ['DAC', 'CGP', 'CXB', 'SYL'].includes(code),
          source: 'static_fallback'
        };
      }
    });

    const airportsFromDirect = await Promise.all(airportPromises);

    // Combine results from search and direct API calls
    const allAirports = [...airportsFromSearch, ...airportsFromDirect.filter(airport => airport !== null)];

    // Remove duplicates based on IATA code
    const uniqueAirports = allAirports.reduce((acc, airport) => {
      if (!acc.find(existing => existing.iataCode === airport.iataCode)) {
        acc.push(airport);
      }
      return acc;
    }, []);

    // Sort by importance (international first, then by city name)
    uniqueAirports.sort((a, b) => {
      if (a.isInternational && !b.isInternational) return -1;
      if (!a.isInternational && b.isInternational) return 1;
      return a.city.localeCompare(b.city);
    });

    console.log(`Found ${uniqueAirports.length} Bangladesh airports from Amadeus API`);
    return uniqueAirports;

  } catch (error) {
    console.error('Error fetching Bangladesh airports from Amadeus:', error.response?.data || error.message);
    // Fallback to static data if API fails
    console.log('Falling back to static Bangladesh airports data');
    return getBangladeshAirportsStatic();
  }
}

// Helper function to get airport names
function getBangladeshAirportName(code) {
  const names = {
    'DAC': 'Hazrat Shahjalal International Airport',
    'CGP': 'Shah Amanat International Airport',
    'SPD': 'Saidpur Airport',
    'RJH': 'Rajshahi Airport',
    'JSR': 'Jessore Airport',
    'BZL': 'Barisal Airport',
    'CXB': "Cox's Bazar Airport",
    'SYL': 'Sylhet Osmani International Airport'
  };
  return names[code] || `${code} Airport`;
}

// Helper function to get airport cities
function getBangladeshAirportCity(code) {
  const cities = {
    'DAC': 'Dhaka',
    'CGP': 'Chittagong',
    'SPD': 'Saidpur',
    'RJH': 'Rajshahi',
    'JSR': 'Jessore',
    'BZL': 'Barisal',
    'CXB': "Cox's Bazar",
    'SYL': 'Sylhet'
  };
  return cities[code] || 'Bangladesh';
}

// Static fallback data for Bangladesh airports
function getBangladeshAirportsStatic() {
  return [
    {
      id: 'DAC',
      name: 'Hazrat Shahjalal International Airport',
      city: 'Dhaka',
      country: 'Bangladesh',
      iataCode: 'DAC',
      type: 'AIRPORT',
      detailedName: 'Hazrat Shahjalal International Airport (DAC)',
      cityCountry: 'Dhaka, Bangladesh',
      isInternational: true
    },
    {
      id: 'CGP',
      name: 'Shah Amanat International Airport',
      city: 'Chittagong',
      country: 'Bangladesh',
      iataCode: 'CGP',
      type: 'AIRPORT',
      detailedName: 'Shah Amanat International Airport (CGP)',
      cityCountry: 'Chittagong, Bangladesh',
      isInternational: true
    },
    {
      id: 'CXB',
      name: "Cox's Bazar Airport",
      city: "Cox's Bazar",
      country: 'Bangladesh',
      iataCode: 'CXB',
      type: 'AIRPORT',
      detailedName: "Cox's Bazar Airport (CXB)",
      cityCountry: "Cox's Bazar, Bangladesh",
      isInternational: true
    },
    {
      id: 'SYL',
      name: 'Sylhet Osmani International Airport',
      city: 'Sylhet',
      country: 'Bangladesh',
      iataCode: 'SYL',
      type: 'AIRPORT',
      detailedName: 'Sylhet Osmani International Airport (SYL)',
      cityCountry: 'Sylhet, Bangladesh',
      isInternational: true
    },
    {
      id: 'SPD',
      name: 'Saidpur Airport',
      city: 'Saidpur',
      country: 'Bangladesh',
      iataCode: 'SPD',
      type: 'AIRPORT',
      detailedName: 'Saidpur Airport (SPD)',
      cityCountry: 'Saidpur, Bangladesh',
      isInternational: false
    },
    {
      id: 'RJH',
      name: 'Rajshahi Airport',
      city: 'Rajshahi',
      country: 'Bangladesh',
      iataCode: 'RJH',
      type: 'AIRPORT',
      detailedName: 'Rajshahi Airport (RJH)',
      cityCountry: 'Rajshahi, Bangladesh',
      isInternational: false
    },
    {
      id: 'JSR',
      name: 'Jessore Airport',
      city: 'Jessore',
      country: 'Bangladesh',
      iataCode: 'JSR',
      type: 'AIRPORT',
      detailedName: 'Jessore Airport (JSR)',
      cityCountry: 'Jessore, Bangladesh',
      isInternational: false
    },
    {
      id: 'BZL',
      name: 'Barisal Airport',
      city: 'Barisal',
      country: 'Bangladesh',
      iataCode: 'BZL',
      type: 'AIRPORT',
      detailedName: 'Barisal Airport (BZL)',
      cityCountry: 'Barisal, Bangladesh',
      isInternational: false
    }
  ];
}

// Search airports by country code using Amadeus API
async function searchAirportsByCountry(countryCode, limit = 50) {
  const token = await getAccessToken();
  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";

  try {
    const url = `${AMADEUS_BASE}/v1/reference-data/locations`;
    const res = await axios.get(url, {
      params: {
        subType: "AIRPORT",
        countryCode: countryCode,
        "page[limit]": limit,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (res.data && res.data.data) {
      return res.data.data.map(location => ({
        id: location.iataCode,
        name: location.name,
        city: location.address?.cityName || location.name,
        country: location.address?.countryName || countryCode,
        iataCode: location.iataCode,
        type: location.subType,
        timeZone: location.timeZoneOffset,
        geoCode: location.geoCode,
        detailedName: `${location.name} (${location.iataCode})`,
        cityCountry: `${location.address?.cityName || location.name}, ${location.address?.countryName || countryCode}`,
        coordinates: location.geoCode ? {
          latitude: location.geoCode.latitude,
          longitude: location.geoCode.longitude
        } : null
      }));
    }

    return [];
  } catch (error) {
    console.error(`Error fetching airports for country ${countryCode}:`, error.response?.data || error.message);
    return [];
  }
}

// Get airport details by IATA code
async function getAirportDetails(iataCode) {
  const token = await getAccessToken();
  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";

  try {
    const url = `${AMADEUS_BASE}/v1/reference-data/locations/${iataCode}`;
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (res.data && res.data.data) {
      const location = res.data.data;
      return {
        id: location.iataCode,
        name: location.name,
        city: location.address?.cityName || location.name,
        country: location.address?.countryName || location.address?.countryCode,
        iataCode: location.iataCode,
        type: location.subType,
        timeZone: location.timeZoneOffset,
        geoCode: location.geoCode,
        detailedName: `${location.name} (${location.iataCode})`,
        cityCountry: `${location.address?.cityName || location.name}, ${location.address?.countryName || location.address?.countryCode}`,
        coordinates: location.geoCode ? {
          latitude: location.geoCode.latitude,
          longitude: location.geoCode.longitude
        } : null,
        analytics: location.analytics || null
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching airport details for ${iataCode}:`, error.response?.data || error.message);
    return null;
  }
}

export { searchFlights, searchAirports, searchAirlines, getBangladeshAirports, searchAirportsByCountry, getAirportDetails };
