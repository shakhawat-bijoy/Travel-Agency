const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function searchFlights(payload) {
  console.log("Searching flights with payload:", payload);

  const res = await fetch(`${API_BASE}/api/flights/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Flight search error:", data);
    throw new Error(data.error || "Flight search failed");
  }

  console.log("Flight search success:", data);
  return data;
}

export async function searchAirports(keyword) {
  console.log("Searching airports for:", keyword);

  const res = await fetch(
    `${API_BASE}/api/flights/airports?keyword=${encodeURIComponent(keyword)}`,
    {
      credentials: "include",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("Airport search error:", data);
    throw new Error(data.error || "Airport search failed");
  }

  console.log("Airport search success:", data);
  return data;
}

export async function searchAirlines(keyword) {
  console.log("Searching airlines for:", keyword);

  const res = await fetch(
    `${API_BASE}/api/flights/airlines?keyword=${encodeURIComponent(keyword)}`,
    {
      credentials: "include",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("Airline search error:", data);
    throw new Error(data.error || "Airline search failed");
  }

  console.log("Airline search success:", data);
  return data;
}
