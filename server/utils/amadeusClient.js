import axios from "axios";

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
  const CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
  const CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

  console.log('[Amadeus] Auth check:', {
    BASE_URL: AMADEUS_BASE,
    CLIENT_ID_SET: !!CLIENT_ID,
    CLIENT_SECRET_SET: !!CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV
  });

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('[Amadeus] ERROR: Missing credentials');
    throw new Error(
      "AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET must be set in environment variables"
    );
  }

  try {
    const url = `${AMADEUS_BASE}/v1/security/oauth2/token`;
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);

    console.log('[Amadeus] Requesting token...');
    const res = await axios.post(url, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 10000
    });

    const { access_token, expires_in } = res.data;
    cachedToken = access_token;
    tokenExpiresAt = Date.now() + (expires_in - 60) * 1000;
    console.log('[Amadeus] Token obtained successfully');
    return cachedToken;
  } catch (error) {
    console.error('[Amadeus] Token error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(`Amadeus authentication failed: ${error.message}`);
  }
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

// Search cities (IATA city codes) using Amadeus reference data
async function searchCities(keyword, limit = 10) {
  const token = await getAccessToken();
  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
  const url = `${AMADEUS_BASE}/v1/reference-data/locations`;

  const res = await axios.get(url, {
    params: {
      keyword,
      subType: 'CITY',
      view: 'LIGHT',
      page: { limit }
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    timeout: 10000
  });

  const locations = res.data?.data || [];
  return locations
    .filter(loc => loc?.iataCode)
    .map(loc => ({
      iataCode: loc.iataCode,
      name: loc.name,
      city: loc.address?.cityName || loc.name,
      country: loc.address?.countryName || loc.address?.countryCode,
      geoCode: loc.geoCode || null
    }));
}

// Search hotel offers by city code (Amadeus Hotel Search)
async function searchHotelOffers({
  cityCode,
  checkInDate,
  checkOutDate,
  adults = 2,
  roomQuantity = 1,
  currency = 'USD',
  limit = 60,
  radiusKm = 5,
  includeOffers = false,
  maxOffers = 1
}) {
  const token = await getAccessToken();
  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";

  const safeLimit = Math.max(1, Math.min(Number(limit) || 60, 60));
  const safeRadiusKm = Math.max(1, Math.min(Number(radiusKm) || 5, 10));

  // Step 1: Fetch hotelIds available for the city
  const byCityUrl = `${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city`;
  const byCityRes = await axios.get(byCityUrl, {
    params: {
      cityCode,
      radius: safeRadiusKm,
      radiusUnit: 'KM'
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    timeout: 20000
  });

  const hotelsByCity = byCityRes.data?.data || [];
  const hotelIdsAll = hotelsByCity
    .map(h => h?.hotelId)
    .filter(Boolean);

  // Amadeus supports multiple hotelIds per call; keep chunk size conservative.
  const chunkSize = 20;
  const maxBatches = 3; // 3 * 20 = 60 (clamped by safeLimit)
  const hotelIdsRequested = hotelIdsAll.slice(0, safeLimit);

  const hotelIdChunks = [];
  for (let i = 0; i < hotelIdsRequested.length; i += chunkSize) {
    if (hotelIdChunks.length >= maxBatches) break;
    hotelIdChunks.push(hotelIdsRequested.slice(i, i + chunkSize));
  }

  if (hotelIdChunks.length === 0) {
    return {
      data: [],
      raw: process.env.NODE_ENV === 'development' ? byCityRes.data : undefined,
      meta: {
        ...(byCityRes.data?.meta || null),
        requested: safeLimit,
        available: hotelIdsAll.length,
        radiusKm: safeRadiusKm
      }
    };
  }

  // Step 2: Fetch offers for those hotelIds
  // Amadeus supports fetching offers by multiple hotelIds via v3.
  const offersUrlV3 = `${AMADEUS_BASE}/v3/shopping/hotel-offers`;

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const requestOffersV3 = async (ids) => {
    return axios.get(offersUrlV3, {
      params: {
        hotelIds: ids.join(','),
        checkInDate,
        checkOutDate,
        adults,
        roomQuantity,
        currency,
        bestRateOnly: true
      },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
      timeout: 20000
    });
  };

  const requestOffersV3WithRetry = async (ids, retries = 2) => {
    try {
      return await requestOffersV3(ids);
    } catch (error) {
      const status = error.response?.status;
      if (status === 429 && retries > 0) {
        const attempt = 3 - retries;
        const backoffMs = 800 * attempt;
        await sleep(backoffMs);
        return requestOffersV3WithRetry(ids, retries - 1);
      }
      throw error;
    }
  };

  const fetchOffersForIds = async (ids) => {
    if (!ids || ids.length === 0) return [];

    try {
      const res = await requestOffersV3WithRetry(ids);
      return res.data?.data || [];
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.errors?.[0]?.detail;
      const code = error.response?.data?.errors?.[0]?.code;
      const title = error.response?.data?.errors?.[0]?.title;

      // If v3 is not enabled, try single-hotel endpoint as a last resort.
      if (status === 404 || (detail && String(detail).toLowerCase().includes("targeted resource doesn't exist"))) {
        const byHotelUrl = `${AMADEUS_BASE}/v2/shopping/hotel-offers/by-hotel`;
        const fallbackRes = await axios.get(byHotelUrl, {
          params: {
            hotelId: ids[0],
            checkInDate,
            checkOutDate,
            adults,
            roomQuantity,
            currency,
            bestRateOnly: true
          },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          },
          timeout: 20000
        });

        return fallbackRes.data?.data || [];
      }

      // Some hotelIds returned by by-city are not valid for offers; split and skip only bad ids.
      const invalidProperty = status === 400 && (
        String(code) === '1257' ||
        String(title).toUpperCase().includes('INVALID PROPERTY') ||
        String(detail).toUpperCase().includes('INVALID PROPERTY')
      );

      if (invalidProperty) {
        if (ids.length === 1) return [];

        // Bounded split: try left + right once, no deep recursion.
        const mid = Math.floor(ids.length / 2);
        const leftIds = ids.slice(0, mid);
        const rightIds = ids.slice(mid);

        let left = [];
        let right = [];

        try {
          left = await requestOffersV3WithRetry(leftIds);
          left = left.data?.data || [];
        } catch {
          left = [];
        }

        // small delay to avoid bursts
        await sleep(250);

        try {
          right = await requestOffersV3WithRetry(rightIds);
          right = right.data?.data || [];
        } catch {
          right = [];
        }

        return [...left, ...right];
      }

      throw error;
    }
  };

  // Sequential fetch to avoid triggering Amadeus rate limits.
  const offersData = [];
  for (const chunk of hotelIdChunks) {
    const chunkData = await fetchOffersForIds(chunk);
    offersData.push(...chunkData);
    // stop early if we already have enough
    if (offersData.length >= safeLimit) break;
    await sleep(250);
  }
  const safeMaxOffers = Math.max(1, Math.min(Number(maxOffers) || 1, 20));

  const simplified = offersData.map(item => {
    const hotel = item.hotel || {};
    const allOffers = Array.isArray(item.offers) ? item.offers : [];
    const firstOffer = allOffers[0];
    const price = firstOffer?.price || {};

    const base = {
      hotelId: hotel.hotelId,
      name: hotel.name,
      cityCode: hotel.cityCode,
      rating: hotel.rating,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      address: hotel.address || null,
      amenities: hotel.amenities || [],
      offer: firstOffer ? {
        id: firstOffer.id,
        checkInDate: firstOffer.checkInDate,
        checkOutDate: firstOffer.checkOutDate,
        roomQuantity: firstOffer.roomQuantity,
        adults,
        price: {
          total: price.total,
          currency: price.currency
        }
      } : null
    };

    if (!includeOffers) return base;

    return {
      ...base,
      hotel,
      offers: allOffers.slice(0, safeMaxOffers)
    };
  });

  // De-duplicate by hotelId (can happen across chunks)
  const deduped = [];
  const seen = new Set();
  for (const h of simplified) {
    const key = h.hotelId || h.name;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(h);
  }

  return {
    data: deduped,
    raw: process.env.NODE_ENV === 'development' ? { byCity: byCityRes.data } : undefined,
    meta: {
      requested: safeLimit,
      returned: deduped.length,
      radiusKm: safeRadiusKm,
      batches: hotelIdChunks.length,
      includeOffers: !!includeOffers,
      maxOffers: includeOffers ? safeMaxOffers : 0
    }
  };
}

// Get full offer details by offerId (Amadeus)
async function getHotelOfferById(offerId) {
  const token = await getAccessToken();
  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
  const url = `${AMADEUS_BASE}/v3/shopping/hotel-offers/${encodeURIComponent(offerId)}`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    timeout: 20000
  });

  return res.data;
}

// Get hotel details (geo/address) by hotelIds
async function getHotelsByIds(hotelIds) {
  const token = await getAccessToken();
  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
  const url = `${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-hotels`;

  const ids = Array.isArray(hotelIds) ? hotelIds : String(hotelIds || '').split(',');
  const normalizedIds = ids.map(id => String(id).trim()).filter(Boolean).slice(0, 20);

  if (normalizedIds.length === 0) {
    return { data: [] };
  }

  const res = await axios.get(url, {
    params: {
      hotelIds: normalizedIds.join(',')
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    timeout: 20000
  });

  return res.data;
}

// Manual Bangladesh airports data (always available)
const bangladeshAirportsData = [
  {
    iataCode: 'DAC',
    name: 'Hazrat Shahjalal International Airport',
    subType: 'AIRPORT',
    address: {
      cityName: 'Dhaka',
      countryName: 'Bangladesh',
      countryCode: 'BD'
    },
    geoCode: {
      latitude: 23.8433,
      longitude: 90.3978
    },
    timeZoneOffset: '+06:00'
  },
  {
    iataCode: 'CGP',
    name: 'Shah Amanat International Airport',
    subType: 'AIRPORT',
    address: {
      cityName: 'Chittagong',
      countryName: 'Bangladesh',
      countryCode: 'BD'
    },
    geoCode: {
      latitude: 22.2496,
      longitude: 91.8133
    },
    timeZoneOffset: '+06:00'
  },
  {
    iataCode: 'CXB',
    name: "Cox's Bazar Airport",
    subType: 'AIRPORT',
    address: {
      cityName: "Cox's Bazar",
      countryName: 'Bangladesh',
      countryCode: 'BD'
    },
    geoCode: {
      latitude: 21.4522,
      longitude: 91.9639
    },
    timeZoneOffset: '+06:00'
  },
  {
    iataCode: 'SYL',
    name: 'Osmani International Airport',
    subType: 'AIRPORT',
    address: {
      cityName: 'Sylhet',
      countryName: 'Bangladesh',
      countryCode: 'BD'
    },
    geoCode: {
      latitude: 24.9633,
      longitude: 91.8667
    },
    timeZoneOffset: '+06:00'
  },
  {
    iataCode: 'JSR',
    name: 'Jessore Airport',
    subType: 'AIRPORT',
    address: {
      cityName: 'Jessore',
      countryName: 'Bangladesh',
      countryCode: 'BD'
    },
    geoCode: {
      latitude: 23.1838,
      longitude: 89.1608
    },
    timeZoneOffset: '+06:00'
  },
  {
    iataCode: 'RJH',
    name: 'Shah Makhdum Airport',
    subType: 'AIRPORT',
    address: {
      cityName: 'Rajshahi',
      countryName: 'Bangladesh',
      countryCode: 'BD'
    },
    geoCode: {
      latitude: 24.4372,
      longitude: 88.6165
    },
    timeZoneOffset: '+06:00'
  },
  {
    iataCode: 'BZL',
    name: 'Barisal Airport',
    subType: 'AIRPORT',
    address: {
      cityName: 'Barisal',
      countryName: 'Bangladesh',
      countryCode: 'BD'
    },
    geoCode: {
      latitude: 22.8010,
      longitude: 90.3012
    },
    timeZoneOffset: '+06:00'
  },
  {
    iataCode: 'SPD',
    name: 'Saidpur Airport',
    subType: 'AIRPORT',
    address: {
      cityName: 'Saidpur',
      countryName: 'Bangladesh',
      countryCode: 'BD'
    },
    geoCode: {
      latitude: 25.7592,
      longitude: 88.9089
    },
    timeZoneOffset: '+06:00'
  }
];

// Function to check if search query matches Bangladesh airports
function matchesBangladeshAirport(airport, keyword) {
  const lowerKeyword = keyword.toLowerCase();
  const cityName = airport.address.cityName.toLowerCase();
  const airportName = airport.name.toLowerCase();
  const iataCode = airport.iataCode.toLowerCase();
  
  return (
    cityName.includes(lowerKeyword) ||
    lowerKeyword.includes(cityName) ||
    airportName.includes(lowerKeyword) ||
    iataCode === lowerKeyword ||
    lowerKeyword === 'bangladesh' ||
    lowerKeyword === 'bd'
  );
}

// Fallback function to try known airport codes
async function tryFallbackAirports(keyword, token, url) {
  const lowerKeyword = keyword.toLowerCase();
  const allLocations = [];

  // First, check if it matches any Bangladesh airport
  const matchingBDAirports = bangladeshAirportsData.filter(airport => 
    matchesBangladeshAirport(airport, keyword)
  );

  if (matchingBDAirports.length > 0) {
    console.log(`✓ Found ${matchingBDAirports.length} Bangladesh airports in manual data`);
    allLocations.push(...matchingBDAirports);
    return {
      data: allLocations,
      meta: { count: allLocations.length }
    };
  }

  // If not Bangladesh, try other known cities via API
  const knownCityAirports = {
    'bangkok': ['BKK', 'DMK'],
    'mumbai': ['BOM'],
    'delhi': ['DEL'],
    'kolkata': ['CCU'],
    'singapore': ['SIN'],
    'kuala lumpur': ['KUL'],
    'jakarta': ['CGK'],
    'manila': ['MNL'],
    'ho chi minh': ['SGN'],
    'hanoi': ['HAN'],
  };

  const codes = knownCityAirports[lowerKeyword];

  if (codes) {
    console.log(`✓ Found known codes for "${keyword}": ${codes.join(', ')}`);
    for (const code of codes) {
      try {
        const airportUrl = `${url}/${code}`;
        const airportRes = await axios.get(airportUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (airportRes.data && airportRes.data.data) {
          const airport = airportRes.data.data;
          allLocations.push(airport);
          console.log(`✓ Added from fallback: ${airport.name} (${code})`);
        }
      } catch (error) {
        console.warn(`Could not fetch details for code ${code}:`, error.message);
      }
    }
  }

  return {
    data: allLocations,
    meta: { count: allLocations.length }
  };
}

async function searchAirports(keyword, limit = 20) {
  const token = await getAccessToken();
  const AMADEUS_BASE = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
  const url = `${AMADEUS_BASE}/v1/reference-data/locations`;
  
  console.log(`\n=== Airport Search for: "${keyword}" ===`);
  
  // First search for both airports and cities
  const res = await axios.get(url, {
    params: {
      subType: "AIRPORT,CITY",
      keyword: keyword,
      "page[limit]": Math.min(limit, 20), // Amadeus max is 20
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const results = res.data.data || [];
  console.log(`Initial search returned ${results.length} results`);
  
  const allLocations = [];
  const addedCodes = new Set(); // Track added airport codes to avoid duplicates

  // Separate airports and cities
  const airports = results.filter(loc => loc.subType === 'AIRPORT');
  const cities = results.filter(loc => loc.subType === 'CITY');
  
  console.log(`Found ${airports.length} airports and ${cities.length} cities`);
  
  // If no results at all, try the fallback immediately
  if (results.length === 0) {
    console.log(`⚠️  No results from Amadeus API for "${keyword}", trying fallback...`);
    const fallbackResult = await tryFallbackAirports(keyword, token, url);
    if (fallbackResult.data.length > 0) {
      console.log(`✓ Fallback successful! Found ${fallbackResult.data.length} airports`);
      return {
        data: fallbackResult.data,
        meta: { count: fallbackResult.data.length }
      };
    }
    console.log(`✗ Fallback also returned no results`);
    return { data: [], meta: { count: 0 } };
  }

  // Add all airports first
  airports.forEach(airport => {
    if (!addedCodes.has(airport.iataCode)) {
      allLocations.push(airport);
      addedCodes.add(airport.iataCode);
      console.log(`✓ Added airport: ${airport.name} (${airport.iataCode}) - ${airport.address?.cityName}`);
    }
  });

  // For each city found, try to get its airports
  for (const city of cities) {
    const cityName = city.address?.cityName || city.name;
    const cityCode = city.iataCode;

    try {
      console.log(`\n→ Searching airports for city: ${cityName} (${cityCode})`);
      
      // Try multiple search strategies
      const searchStrategies = [
        { keyword: cityName, desc: 'city name' },
        { keyword: cityCode, desc: 'city code' },
      ];

      for (const strategy of searchStrategies) {
        try {
          const cityAirportsRes = await axios.get(url, {
            params: {
              subType: "AIRPORT",
              keyword: strategy.keyword,
              "page[limit]": 15,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          });

          const cityAirports = cityAirportsRes.data.data || [];
          console.log(`  Found ${cityAirports.length} airports using ${strategy.desc}: "${strategy.keyword}"`);
          
          // Add airports from this city that aren't already in the list
          let addedCount = 0;
          for (const airport of cityAirports) {
            const airportCity = airport.address?.cityName?.toLowerCase();
            const searchCity = cityName.toLowerCase();
            
            // More flexible matching - check if city names are similar
            const isMatch = airportCity === searchCity || 
                           airportCity?.includes(searchCity) || 
                           searchCity.includes(airportCity);
            
            if (isMatch && !addedCodes.has(airport.iataCode)) {
              allLocations.push(airport);
              addedCodes.add(airport.iataCode);
              addedCount++;
              console.log(`  ✓ Added: ${airport.name} (${airport.iataCode})`);
            }
          }
          
          if (addedCount > 0) {
            console.log(`  Total added from ${strategy.desc}: ${addedCount}`);
            break; // If we found airports with this strategy, no need to try others
          }
        } catch (strategyError) {
          console.warn(`  Failed ${strategy.desc} search:`, strategyError.message);
        }
      }
    } catch (error) {
      console.warn(`Could not fetch airports for city ${cityName}:`, error.message);
    }
  }

  // If no airports found after all attempts, try the fallback
  if (allLocations.length === 0) {
    console.log(`⚠️  No airports found after all attempts, trying fallback...`);
    const fallbackResult = await tryFallbackAirports(keyword, token, url);
    allLocations.push(...fallbackResult.data);
  }

  // ALWAYS inject matching Bangladesh airports (manual injection)
  console.log(`\n🇧🇩 Checking Bangladesh airports for injection...`);
  const matchingBDAirports = bangladeshAirportsData.filter(airport => 
    matchesBangladeshAirport(airport, keyword) && !addedCodes.has(airport.iataCode)
  );

  if (matchingBDAirports.length > 0) {
    console.log(`✓ Injecting ${matchingBDAirports.length} Bangladesh airports:`);
    matchingBDAirports.forEach(airport => {
      // Add to beginning for higher priority
      allLocations.unshift(airport);
      addedCodes.add(airport.iataCode);
      console.log(`  ✓ ${airport.name} (${airport.iataCode}) - ${airport.address.cityName}`);
    });
  } else {
    console.log(`  No matching Bangladesh airports for "${keyword}"`);
  }

  console.log(`\n=== Total airports found: ${allLocations.length} ===\n`);

  // Return in the same format as original API
  return {
    ...res.data,
    data: allLocations.slice(0, Math.min(limit, 50)) // Allow more results since we're combining
  };
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
  // return [
  //   {
  //     id: 'DAC',
  //     name: 'Hazrat Shahjalal International Airport',
  //     city: 'Dhaka',
  //     country: 'Bangladesh',
  //     iataCode: 'DAC',
  //     type: 'AIRPORT',
  //     detailedName: 'Hazrat Shahjalal International Airport (DAC)',
  //     cityCountry: 'Dhaka, Bangladesh',
  //     isInternational: true
  //   },
  //   {
  //     id: 'CGP',
  //     name: 'Shah Amanat International Airport',
  //     city: 'Chittagong',
  //     country: 'Bangladesh',
  //     iataCode: 'CGP',
  //     type: 'AIRPORT',
  //     detailedName: 'Shah Amanat International Airport (CGP)',
  //     cityCountry: 'Chittagong, Bangladesh',
  //     isInternational: true
  //   },
  //   {
  //     id: 'CXB',
  //     name: "Cox's Bazar Airport",
  //     city: "Cox's Bazar",
  //     country: 'Bangladesh',
  //     iataCode: 'CXB',
  //     type: 'AIRPORT',
  //     detailedName: "Cox's Bazar Airport (CXB)",
  //     cityCountry: "Cox's Bazar, Bangladesh",
  //     isInternational: true
  //   },
  //   {
  //     id: 'SYL',
  //     name: 'Sylhet Osmani International Airport',
  //     city: 'Sylhet',
  //     country: 'Bangladesh',
  //     iataCode: 'SYL',
  //     type: 'AIRPORT',
  //     detailedName: 'Sylhet Osmani International Airport (SYL)',
  //     cityCountry: 'Sylhet, Bangladesh',
  //     isInternational: true
  //   },
  //   {
  //     id: 'SPD',
  //     name: 'Saidpur Airport',
  //     city: 'Saidpur',
  //     country: 'Bangladesh',
  //     iataCode: 'SPD',
  //     type: 'AIRPORT',
  //     detailedName: 'Saidpur Airport (SPD)',
  //     cityCountry: 'Saidpur, Bangladesh',
  //     isInternational: false
  //   },
  //   {
  //     id: 'RJH',
  //     name: 'Rajshahi Airport',
  //     city: 'Rajshahi',
  //     country: 'Bangladesh',
  //     iataCode: 'RJH',
  //     type: 'AIRPORT',
  //     detailedName: 'Rajshahi Airport (RJH)',
  //     cityCountry: 'Rajshahi, Bangladesh',
  //     isInternational: false
  //   },
  //   {
  //     id: 'JSR',
  //     name: 'Jessore Airport',
  //     city: 'Jessore',
  //     country: 'Bangladesh',
  //     iataCode: 'JSR',
  //     type: 'AIRPORT',
  //     detailedName: 'Jessore Airport (JSR)',
  //     cityCountry: 'Jessore, Bangladesh',
  //     isInternational: false
  //   },
  //   {
  //     id: 'BZL',
  //     name: 'Barisal Airport',
  //     city: 'Barisal',
  //     country: 'Bangladesh',
  //     iataCode: 'BZL',
  //     type: 'AIRPORT',
  //     detailedName: 'Barisal Airport (BZL)',
  //     cityCountry: 'Barisal, Bangladesh',
  //     isInternational: false
  //   }
  // ];
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

export { searchFlights, searchAirports, getBangladeshAirports, searchAirportsByCountry, getAirportDetails, searchCities, searchHotelOffers, getHotelOfferById, getHotelsByIds };
