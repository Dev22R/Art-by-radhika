import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Search, MapPin, Crosshair, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Custom Royal Marker Icon to avoid Leaflet asset path 404s
const createRoyalIcon = () => {
  return L.divIcon({
    className: 'custom-royal-pin',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 44px;
        transform: translate(-50%, -100%);
        cursor: pointer;
      ">
        <svg viewBox="0 0 24 32" width="36" height="44" style="filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.35));">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#4A151B" stroke="#D4AF37" stroke-width="1.5"/>
          <circle cx="12" cy="11" r="5" fill="#D4AF37"/>
          <circle cx="12" cy="11" r="2.5" fill="#FAF6F0"/>
        </svg>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
  });
};

export const LocationPickerMap = ({
  initialLat,
  initialLng,
  onLocationSelect,
  externalQuery = '',
  height = '320px',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const lastGeocodedCoordsRef = useRef({ lat: null, lng: null });

  const defaultCenter = [
    initialLat && !isNaN(initialLat) ? parseFloat(initialLat) : 22.7196,
    initialLng && !isNaN(initialLng) ? parseFloat(initialLng) : 75.8577,
  ];

  const [currentCoords, setCurrentCoords] = useState({
    lat: initialLat && !isNaN(initialLat) ? parseFloat(initialLat) : null,
    lng: initialLng && !isNaN(initialLng) ? parseFloat(initialLng) : null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);

  // Reverse Geocoding with OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    lastGeocodedCoordsRef.current = { lat, lng };
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (!res.ok) throw new Error('Geocoding service unavailable');
      const data = await res.json();

      const addr = data.address || {};
      const streetOrVenue =
        addr.amenity ||
        addr.building ||
        addr.road ||
        addr.residential ||
        data.name ||
        '';
      const houseNumber = addr.house_number ? `${addr.house_number}, ` : '';
      const addressLine = houseNumber + (streetOrVenue || data.display_name?.split(',')[0] || '');

      // Extract Village, Town, or Locality for Area
      const areaName =
        addr.suburb ||
        addr.neighbourhood ||
        addr.village ||
        addr.town ||
        addr.hamlet ||
        addr.residential ||
        addr.subdistrict ||
        '';

      // Extract Major City / District cleanly (e.g. Indore, Ujjain, Bhopal, etc.)
      let cityName =
        addr.city ||
        addr.city_district ||
        addr.district ||
        addr.state_district ||
        addr.county ||
        addr.town ||
        addr.municipality ||
        '';

      // Clean up "District" suffix if returned by OpenStreetMap (e.g. "Indore District" -> "Indore")
      cityName = cityName.replace(/\s+District$/i, '').trim();

      const parsedLocation = {
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6)),
        addressLine: addressLine || '',
        area: areaName,
        city: cityName || 'Indore',
        state: addr.state || 'Madhya Pradesh',
        pincode: addr.postcode || '',
        displayName: data.display_name || '',
      };

      if (onLocationSelect) {
        onLocationSelect(parsedLocation);
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
      if (onLocationSelect) {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
        });
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Helper to place or move marker
  const updateMarkerPosition = (lat, lng, zoom = 16) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([lat, lng], zoom);

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], {
        icon: createRoyalIcon(),
        draggable: true,
      }).addTo(mapInstanceRef.current);

      marker.on('dragend', (ev) => {
        const newPos = ev.target.getLatLng();
        setCurrentCoords({ lat: newPos.lat, lng: newPos.lng });
        reverseGeocode(newPos.lat, newPos.lng);
      });

      markerRef.current = marker;
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: initialLat && initialLng ? 16 : 13,
      zoomControl: false,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial marker if initial coords exist
    if (initialLat && initialLng && !isNaN(initialLat) && !isNaN(initialLng)) {
      const marker = L.marker([parseFloat(initialLat), parseFloat(initialLng)], {
        icon: createRoyalIcon(),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        setCurrentCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      markerRef.current = marker;
    }

    // Click on map to place/move marker
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setCurrentCoords({ lat, lng });
      updateMarkerPosition(lat, lng, map.getZoom());
      reverseGeocode(lat, lng);
    });

    mapInstanceRef.current = map;

    // Invalidate size after render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync coords from parent if changed externally
  useEffect(() => {
    if (initialLat && initialLng && !isNaN(initialLat) && !isNaN(initialLng)) {
      const lat = parseFloat(initialLat);
      const lng = parseFloat(initialLng);
      if (
        lastGeocodedCoordsRef.current.lat !== lat ||
        lastGeocodedCoordsRef.current.lng !== lng
      ) {
        setCurrentCoords({ lat, lng });
        updateMarkerPosition(lat, lng);
      }
    }
  }, [initialLat, initialLng]);

  // 1. AUTO-SEARCH FOR MAP SEARCH BAR (1-Second Debounce)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery.trim()
          )}&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setSearchResults(data || []);

        // If results found, auto-jump to the top match on map!
        if (data && data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          setCurrentCoords({ lat, lng });
          updateMarkerPosition(lat, lng, 16);
          reverseGeocode(lat, lng);
        }
      } catch (err) {
        console.error('Auto search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. AUTO-DETECT LOCATION FROM FORM FIELDS (1-Second Debounce)
  useEffect(() => {
    if (!externalQuery || !externalQuery.trim() || externalQuery.trim().length < 3) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            externalQuery.trim()
          )}&limit=1&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setCurrentCoords({ lat, lng });
          updateMarkerPosition(lat, lng, 16);
          // Update parent coordinates quietly
          if (onLocationSelect) {
            onLocationSelect({
              latitude: parseFloat(lat.toFixed(6)),
              longitude: parseFloat(lng.toFixed(6)),
              fromFormDetect: true,
            });
          }
        }
      } catch (err) {
        console.error('Form address detect error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [externalQuery]);

  const selectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setCurrentCoords({ lat, lng });
    setSearchResults([]);
    setSearchQuery(item.display_name?.split(',')[0] || item.display_name || '');
    updateMarkerPosition(lat, lng, 16);
    reverseGeocode(lat, lng);
  };

  // Locate User GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        updateMarkerPosition(latitude, longitude, 17);
        reverseGeocode(latitude, longitude);
        toast.success('Found your current location! ✨');
      },
      (err) => {
        setLocatingUser(false);
        toast.error('Could not get your location. Please check permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2.5">
      {/* Search Bar (Auto 1-sec detect, without manual search button) & GPS Locate */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8A3324] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type hotel, resort, colony or city (auto detects in 1s)..."
              className="w-full pl-9 pr-10 py-2 rounded-xl border border-[#D4AF37]/50 bg-[#FFFDF9] text-xs font-semibold text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
            />
            {isSearching && (
              <div className="absolute right-3 top-2.5 pointer-events-none">
                <Loader2 className="w-4 h-4 animate-spin text-[#8A3324]" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE1] border border-[#D4AF37]/50 text-[#8A3324] shadow-sm transition-colors cursor-pointer shrink-0"
            title="Use current GPS location"
          >
            {locatingUser ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#8A3324]" />
            ) : (
              <Crosshair className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Search Autocomplete Suggestions */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border-2 border-[#D4AF37]/50 shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => selectSearchResult(item)}
                className="p-2.5 hover:bg-[#FAF6F0] text-xs text-[#2C1810] border-b border-[#D4AF37]/15 last:border-b-0 cursor-pointer flex items-start gap-2 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#8A3324] shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-snug">{item.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-inner bg-[#F3ECE1]">
        <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />

        {/* Geocoding Loading Indicator */}
        {isGeocoding && (
          <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-sm text-[#D4AF37] text-[11px] font-semibold flex items-center gap-2 shadow-md">
            <Loader2 className="w-3 h-3 animate-spin text-[#D4AF37]" />
            <span>Detecting address details...</span>
          </div>
        )}

        {/* Helper Badge */}
        <div className="absolute bottom-2 left-2 z-20 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-sm text-[10px] text-[#4A151B] font-semibold shadow border border-[#D4AF37]/40 pointer-events-none">
          Click or drag pin on map
        </div>
      </div>

      {/* Pin Status & Google Maps Link */}
      {currentCoords.lat && currentCoords.lng && (
        <div className="flex items-center justify-between text-[11px] text-[#4A151B]/80 px-1">
          <div className="flex items-center gap-1.5 font-medium text-[#2D6A4F]">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F] inline-block animate-pulse" />
            <span>Location Pin Set</span>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8A3324] hover:text-[#4A151B] font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
