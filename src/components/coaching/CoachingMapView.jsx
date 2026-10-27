import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Star, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Map center update helper
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Custom Marker icons
const createCustomIcon = (sport = 'Sport', isSelected = false) => {
  return L.divIcon({
    className: 'custom-coaching-pin',
    html: `
      <div style="
        background: ${isSelected ? '#B6FF3B' : '#00D4FF'};
        color: #0B0F14;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 11px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        border: 2px solid #FFFFFF;
        cursor: pointer;
      ">
        ${sport.slice(0, 2).toUpperCase()}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

export default function CoachingMapView({ academies, userCoords, onSelectAcademy }) {
  const defaultCenter = [18.5314, 73.8446]; // Pune center
  const mapCenter = userCoords ? [userCoords.lat, userCoords.lng] : defaultCenter;

  return (
    <div className="bg-[#141B24] border border-[#293442] rounded-2xl overflow-hidden shadow-xl h-[600px] relative">
      <MapContainer
        center={mapCenter}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <ChangeView center={mapCenter} zoom={12} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userCoords && (
          <Marker
            position={[userCoords.lat, userCoords.lng]}
            icon={L.divIcon({
              className: 'user-pin',
              html: `
                <div style="
                  background: #B6FF3B;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  border: 3px solid #0B0F14;
                  box-shadow: 0 0 10px #B6FF3B;
                "></div>
              `,
              iconSize: [18, 18],
              iconAnchor: [9, 9]
            })}
          >
            <Popup>
              <div className="text-xs font-bold text-gray-900">
                📍 Your Selected Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Academy Markers */}
        {academies.map((acad) => {
          if (!acad.lat || !acad.lng) return null;
          return (
            <Marker
              key={acad.id}
              position={[acad.lat, acad.lng]}
              icon={createCustomIcon(acad.sports[0])}
            >
              <Popup>
                <div className="p-1 max-w-[200px] text-gray-900">
                  <div className="font-bold text-sm leading-tight">{acad.name}</div>
                  <div className="text-[11px] text-gray-600 mt-0.5">{acad.locality}, {acad.city}</div>
                  <div className="text-[11px] font-bold text-emerald-700 mt-1">
                    ₹{acad.monthlyFeeMin.toLocaleString('en-IN')} / month
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <Link
                      to={`/coaching/${acad.id}`}
                      className="inline-block text-xs font-bold text-blue-600 hover:underline"
                    >
                      View Academy Details →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Info Badge */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#141B24]/90 backdrop-blur-md border border-[#293442] px-3.5 py-2 rounded-xl text-xs text-white shadow-lg flex items-center gap-2">
        <Navigation className="w-3.5 h-3.5 text-[#00D4FF]" />
        <span>Displaying {academies.length} sports academies across Pune</span>
      </div>
    </div>
  );
}
