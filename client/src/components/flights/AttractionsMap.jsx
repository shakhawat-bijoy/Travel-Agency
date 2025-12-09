import { useEffect, useState } from "react";
import Button from "../common/Buttton";

let MapContainer, TileLayer, Marker, Popup;

const AttractionsMap = () => {
  const [ready, setReady] = useState(false);
  const position = [48.8584, 2.2945]; // Eiffel Tower

  useEffect(() => {
    // Load Leaflet only in browser
    (async () => {
      if (typeof window !== "undefined") {
        const L = (await import("leaflet")).default;

        // Load React-Leaflet components dynamically
        const leaflet = await import("react-leaflet");
        MapContainer = leaflet.MapContainer;
        TileLayer = leaflet.TileLayer;
        Marker = leaflet.Marker;
        Popup = leaflet.Popup;

        // Load Leaflet CSS
        await import("leaflet/dist/leaflet.css");

        // Fix marker icons
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        setReady(true);
      }
    })();
  }, []);

  return (
    <>
      <div className="max-w-[1230px] mx-auto md:mt-20 my-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-[#000] text-xl sm:text-2xl md:text-[32px] font-semibold font-montserrat">
              Let's go places together
            </h1>
            <p className="text-sm md:text-base font-normal font-montserrat">
              Discover the latest offers and news and start planning your next trip with us.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              text="See All"
              className="px-4 py-2 text-black rounded-md border border-[#8DD3BB] text-sm font-medium whitespace-nowrap"
            />
          </div>
        </div>
      </div>

      <div className="w-full h-[300px] sm:h-[400px] md:h-[500px]">
        {ready && MapContainer && (
          <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                Eiffel Tower, Paris <br /> A beautiful landmark in the heart of Paris.
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </>
  );
};

export default AttractionsMap;
