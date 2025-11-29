import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Property } from '../types/property';
import { formatPrice } from '../utils/priceFormatter';
import { formatSize } from '../utils/sizeFormatter';
import { Navigation, Satellite, MapPin, Maximize, ArrowRight } from 'lucide-react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getUserLocationIcon, getPropertyTypeIcon } from '../utils/leafletIcons';
import MarkerClusterGroup from 'react-leaflet-cluster';




interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  onMarkerClick?: (property: Property) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Component to handle tile layer switching
function TileLayerSwitcher({ isSatelliteView }: { isSatelliteView: boolean }) {
  return isSatelliteView ? (
    <TileLayer
      key="satellite"
      attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.esri.com/en-us/legal/terms/full-master-agreement">Esri Terms of Use</a>'
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      maxZoom={19}
    />
  ) : (
    <TileLayer
      key="map"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={19}
    />
  );
}

export function PropertyMap({ properties, center = [29.3909, 76.9635], onMarkerClick }: PropertyMapProps) {
  // Load saved map view preference from localStorage, default to map view
  const [isSatelliteView, setIsSatelliteView] = useState(() => {
    const saved = localStorage.getItem('mapViewPreference');
    return saved === 'satellite';
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Helper function to get coordinates for a property (location first, then landmark_location as fallback)
  const getPropertyCoords = (property: Property): { coords: [number, number] | null; isLandmark: boolean } => {
    // Try exact location first
    if (property.location && property.location.includes(',')) {
      const coords = property.location.split(',').map((c) => parseFloat(c.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return { coords: [coords[0], coords[1]], isLandmark: false };
      }
    }

    // Fallback to landmark_location
    if (property.landmark_location && property.landmark_location.includes(',')) {
      const coords = property.landmark_location.split(',').map((c) => parseFloat(c.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return { coords: [coords[0], coords[1]], isLandmark: true };
      }
    }

    return { coords: null, isLandmark: false };
  };

  // Filter properties that have either location or landmark_location
  const propertiesWithCoords = properties.filter(
    (p) => {
      const { coords } = getPropertyCoords(p);
      return coords !== null;
    }
  );

  // Create user location icon (memoized to avoid recreating on each render)
  const userIcon = useMemo(() => getUserLocationIcon(), []);

  // Update map center when center prop changes
  useEffect(() => {
    setMapCenter(center);
  }, [center]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const userPos: [number, number] = [lat, lng];
        setUserLocation(userPos);
        setMapCenter(userPos);
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'Failed to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="h-full w-full relative z-[8]">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-full w-full rounded-lg"
        scrollWheelZoom={true}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <MapUpdater center={mapCenter} />
        <TileLayerSwitcher isSatelliteView={isSatelliteView} />

        {/* Accuracy circles - rendered outside cluster group */}
        {propertiesWithCoords.map((property) => {
          const { coords, isLandmark } = getPropertyCoords(property);
          if (!coords || isLandmark) return null;
          const accuracy = property.location_accuracy ? parseFloat(property.location_accuracy) : NaN;
          const radius = !isNaN(accuracy) ? accuracy : 500;

          return (
            <Circle
              key={`circle-${property.id}`}
              center={coords}
              radius={radius}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2,
                opacity: 0.5,
              }}
            />
          );
        })}

        {/* Property markers with clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          iconCreateFunction={(cluster: any) => {

            const count = cluster.getChildCount();
            let sizeClass = 'w-10 h-10 text-sm';

            if (count > 100) {
              sizeClass = 'w-14 h-14 text-base';
            } else if (count > 10) {
              sizeClass = 'w-12 h-12 text-sm';
            }

            return L.divIcon({
              html: `<div class="${sizeClass} flex items-center justify-center bg-blue-600 text-white rounded-full border-4 border-white shadow-lg font-bold">${count}</div>`,
              className: 'custom-cluster-icon',
              iconSize: L.point(40, 40, true),
            });
          }}

        >
          {propertiesWithCoords.map((property) => {
            const { coords, isLandmark } = getPropertyCoords(property);
            if (!coords) return null;
            const markerIcon = getPropertyTypeIcon(property.type, isLandmark);

            return (
              <Marker
                key={`marker-${property.id}`}
                position={coords}
                icon={markerIcon}
              >
                <Popup>
                  <div className="w-full">
                    {/* Header with Type and Price */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide leading-tight">
                          {property.type}
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 whitespace-nowrap">
                          {formatPrice(property.price_min, property.price_max, true)}
                        </span>
                      </div>
                    </div>

                    {/* Body with Details */}
                    <div className="p-4 space-y-3">
                      {/* Location */}
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 p-1 bg-blue-50 rounded-full shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {property.area}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {property.city}
                          </p>
                        </div>
                      </div>

                      {/* Size */}
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 bg-purple-50 rounded-full shrink-0">
                          <Maximize className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <p className="text-sm text-gray-700 font-medium">
                          {formatSize(property.size_min, property.size_max, property.size_unit)}
                        </p>
                      </div>

                      {/* Landmark / Accuracy Info */}
                      {(isLandmark || property.location_accuracy) && (
                        <div className="pt-2 mt-1 border-t border-gray-100">
                          {isLandmark ? (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-orange-600 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                Approximate Location
                              </p>
                              {property.landmark_location && (
                                <p className="text-xs text-gray-500 pl-3">
                                  Near {property.landmark_location}
                                </p>
                              )}
                            </div>
                          ) : (
                            property.location_accuracy && (
                              <p className="text-xs text-green-600 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Exact Location (±{property.location_accuracy}m)
                              </p>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Action */}
                    {onMarkerClick && (
                      <div className="px-4 pb-4 pt-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkerClick(property);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm hover:shadow active:scale-[0.98]"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </Popup>

              </Marker>
            );
          })}
        </MarkerClusterGroup>


        {/* User Location Marker */}
        {userLocation && (
          <Marker
            key={`user-location-${userLocation[0]}-${userLocation[1]}`}
            position={userLocation}
            icon={userIcon}
            zIndexOffset={1000}
            riseOnHover={true}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-1">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-sm">Your Location</h3>
                </div>
                <p className="text-xs text-gray-500">
                  {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Control Buttons Container */}
      <div className="absolute inset-0 pointer-events-none z-[2000]" style={{ zIndex: 2000 }}>
        {/* Satellite View Toggle Button - Top Right */}
        <button
          type="button"
          onClick={() => {
            const newView = !isSatelliteView;
            setIsSatelliteView(newView);
            // Save preference immediately
            localStorage.setItem('mapViewPreference', newView ? 'satellite' : 'map');
          }}
          className={`absolute top-2 right-2 pointer-events-auto flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg shadow-lg transition-colors ${isSatelliteView
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          title={isSatelliteView ? 'Switch to Map View' : 'Switch to Satellite View'}
        >
          <Satellite
            className="w-4 h-4 flex-shrink-0"
            strokeWidth={2.5}
          />
          <span className="hidden sm:inline">{isSatelliteView ? 'Satellite' : 'Map'}</span>
        </button>

        {/* Current Location Button - Bottom Right */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="absolute bottom-2 right-2 pointer-events-auto flex items-center justify-center w-10 h-10 bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
          title="Get Current Location"
        >
          <Navigation
            className={`w-5 h-5 flex-shrink-0 ${isGettingLocation ? 'animate-spin' : ''}`}
            strokeWidth={2.5}
          />
        </button>
      </div>
    </div>
  );
}
