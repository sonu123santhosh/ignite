import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

// Fix Leaflet's default marker icons in Vite/bundlers
const customTrialIcon = new L.DivIcon({
  className: 'custom-trial-pin',
  html: `
    <div style="
      background-color: #B6FF3B;
      color: #0B0F14;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 14px;
      box-shadow: 0 0 15px rgba(182, 255, 59, 0.6);
      border: 2px solid #0B0F14;
    ">
      ★
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const userLocationIcon = new L.DivIcon({
  className: 'custom-user-pin',
  html: `
    <div style="
      background-color: #00D4FF;
      color: #0B0F14;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.8);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

// Helper component to center map when coords change
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function TrialsMapView({ trials, userCoords }) {
  const defaultCenter = userCoords
    ? [userCoords.lat, userCoords.lng]
    : [18.5204, 73.8567]; // Pune center

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-[#293442] shadow-2xl relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={defaultCenter} />

        {/* Dark-styled OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]} icon={userLocationIcon}>
            <Popup className="custom-leaflet-popup">
              <div className="text-xs p-1">
                <strong className="text-black font-bold">Your Detected Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Trial Markers */}
        {trials.map((trial) => {
          if (!trial.lat || !trial.lng) return null;
          return (
            <Marker
              key={trial.id}
              position={[trial.lat, trial.lng]}
              icon={customTrialIcon}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 space-y-2 max-w-[220px]">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black text-[#B6FF3B]">
                    {trial.sport}
                  </span>
                  <h4 className="font-bold text-xs text-black leading-tight line-clamp-2">
                    {trial.title}
                  </h4>
                  <div className="text-[11px] text-gray-700">
                    <div>{trial.organisationName}</div>
                    <div className="text-gray-500">{trial.venue}</div>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-black flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{trial.trialDate}</span>
                  </div>
                  <Link
                    to={`/trials/${trial.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline pt-1"
                  >
                    <span>View Trial Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
