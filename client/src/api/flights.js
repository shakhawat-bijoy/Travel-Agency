const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Helper function for API calls with error handling
async function apiCall(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // Try to parse JSON response
    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      console.error("Failed to parse response:", parseError);
      throw new Error("Invalid response from server");
    }

    if (!res.ok) {
      console.error("API error:", data);
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    // Network errors or fetch failures
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error("Network error:", error);
      throw new Error("Unable to connect to server. Please check your internet connection.");
    }
    throw error;
  }
}

export async function searchFlights(payload) {
  console.log("Searching flights with payload:", payload);

  try {
    const data = await apiCall(`${API_BASE}/api/flights/search`, {
      method: "POST",
      body: JSON.stringify(payload),
      credentials: "include",
    });

    console.log("Flight search success:", data);
    return data;
  } catch (error) {
    console.error("Flight search error:", error);
    throw new Error(error.message || "Flight search failed");
  }
}

export async function searchAirports(keyword) {
  console.log("Searching airports for:", keyword);

  try {
    const data = await apiCall(
      `${API_BASE}/api/flights/airports?keyword=${encodeURIComponent(keyword)}`,
      {
        credentials: "include",
      }
    );

    console.log("Airport search success:", data);
    return data;
  } catch (error) {
    console.error("Airport search error:", error);
    throw new Error(error.message || "Airport search failed");
  }
}
