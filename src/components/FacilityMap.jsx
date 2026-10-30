import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { MapPin, Star, AlertTriangle, ArrowRight } from 'lucide-react';

export default function FacilityMap({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  referenceCoords
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // Fix default Leaflet icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });

      // Default center: reference coords or Bengaluru center
      const centerLat = referenceCoords ? referenceCoords.lat : 12.9716;
      const centerLng = referenceCoords ? referenceCoords.lng : 77.6245;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 12,
          zoomControl: true,
          scrollWheelZoom: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.warn('Leaflet map initialization warning:', err);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view when referenceCoords change
  useEffect(() => {
    if (mapInstanceRef.current && referenceCoords) {
      mapInstanceRef.current.setView([referenceCoords.lat, referenceCoords.lng], 13);
    }
  }, [referenceCoords]);

  // Update markers when facilities list changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    facilities.forEach((fac) => {
      // Custom styled HTML marker pin
      const isSelected = selectedFacilityId === fac.id;
      const customPinHtml = `
        <div style="
          width: 32px;
          height: 32px;
          background: ${isSelected ? 'linear-gradient(135deg, #DC2626, #991B1B)' : 'linear-gradient(135deg, #EF4444, #DC2626)'};
          border: ${isSelected ? '2px solid #FFFFFF' : '2px solid rgba(255,255,255,0.85)'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 12px;
          box-shadow: 0 4px 14px rgba(220,38,38,0.5);
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: transform 0.15s ease;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customPinHtml,
        className: 'sportlink-map-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="min-width: 200px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #FDA4AF; letter-spacing: 0.5px;">${fac.sport}</span>
            <span style="font-size: 10px; color: #94A3B8;">${fac.area}</span>
          </div>
          <h4 style="font-size: 15px; font-weight: 800; margin: 0 0 4px 0; color: #F5F7FA; font-family: sans-serif;">${fac.name}</h4>
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 8px; border-top: 1px solid #293442; padding-top: 6px;">
            <span style="font-size: 14px; font-weight: 800; color: #FECDD3;">₹${fac.pricing.offPeak}<span style="font-size: 10px; font-weight: normal; color: #94A3B8;">/hr</span></span>
            <a href="/facilities/${fac.id}" style="display: inline-block; font-size: 11px; font-weight: 700; color: #FFFFFF; background: linear-gradient(135deg, #DC2626, #E11D48); padding: 4px 10px; border-radius: 999px; text-decoration: none; box-shadow: 0 2px 10px rgba(225,29,72,0.4);">View Details →</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectFacility) onSelectFacility(fac.id);
      });

      markersRef.current[fac.id] = marker;
    });

    // Fit bounds if multiple facilities
    if (facilities.length > 1) {
      const bounds = L.latLngBounds(facilities.map((f) => [f.lat, f.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [facilities, selectedFacilityId]);

  if (mapError) {
    return (
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-8 text-center text-[#94A3B8] h-96 flex flex-col items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-amber-400 mb-3" />
        <h4 className="text-base font-bold text-[#F5F7FA]">Map Display Unavailable</h4>
        <p className="text-xs text-[#94A3B8] max-w-sm mt-1">
          OpenStreetMap tiles could not be initialized in this network environment. Please switch to Grid or List view to browse facilities.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-[#293442] shadow-xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-[1000] bg-[#0B0F14]/90 border border-[#293442] px-3 py-1.5 rounded-lg text-[11px] text-[#94A3B8] backdrop-blur-sm shadow-md">
        Interactive Map &bull; {facilities.length} Grounds Listed
      </div>
    </div>
  );
}
