import React, { useState, useEffect, useRef } from "react";
import { searchAirports } from "../../api/flights";

export default function AirportAutocomplete({ onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchAirports(query);
        setResults(data.data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Airport search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(airport) {
    onChange(airport.iataCode);
    setQuery(`${airport.name} (${airport.iataCode})`);
    setShowDropdown(false);
  }

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        className="border p-2 w-full rounded"
      />

      {loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((airport) => (
            <div
              key={airport.id}
              onClick={() => handleSelect(airport)}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
            >
              <div className="font-semibold text-sm">
                {airport.name} ({airport.iataCode})
              </div>
              <div className="text-xs text-gray-600">
                {airport.address?.cityName}, {airport.address?.countryName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
