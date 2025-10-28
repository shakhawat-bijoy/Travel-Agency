import React, { useState } from "react";
import { searchFlights } from "../../api/flights";
import AirportAutocomplete from "../common/AirportAutocomplete";

export default function FlightSearch() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await searchFlights({
        origin,
        destination,
        departureDate,
        returnDate: returnDate || undefined,
        adults: 1,
        max: 10,
        currency: "USD",
      });
      setResults(data);
      console.log("Amadeus response", data);
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
        <div className="flex gap-2">
          <AirportAutocomplete
            value={origin}
            onChange={setOrigin}
            placeholder="From (City or Airport)"
          />
          <AirportAutocomplete
            value={destination}
            onChange={setDestination}
            placeholder="To (City or Airport)"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="border p-2"
          />
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="border p-2"
          />
        </div>
        <button type="submit" className="bg-teal-600 text-white px-4 py-2">
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="text-red-600 mt-2">{error}</div>}

      {results && (
        <div className="mt-4">
          <pre className="text-xs max-h-80 overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
