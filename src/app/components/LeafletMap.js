
"use client"

import { useEffect, useState, useRef } from "react"
import { GoogleMap, LoadScript, Marker, InfoWindow, Polyline, DirectionsService, DirectionsRenderer } from "@react-google-maps/api"
// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyCelDo4I5cPQ72TfCTQW-arhPZ7ALNcp8w";

// Define city coordinates for routing
const cityLocations = {
  Delhi: { lat: 28.6139, lng: 77.209 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Kolhapur: { lat: 16.7050, lng: 74.2433 }, // Added Kolhapur coordinates
};

// Default location (Kolhapur) when no coordinates are available
const DEFAULT_LOCATION = { lat: 18.5614, lng: 73.9449 };

// Map container styles
const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
};

// Custom marker icons
const markerIcons = {
  driver: {
    url: "https://maps.google.com/mapfiles/ms/icons/blue.png",
    scaledSize: { width: 40, height: 40 },
    labelOrigin: { x: 20, y: -10 },
  },
  pickup: {
    url: "https://maps.google.com/mapfiles/ms/icons/green.png",
    scaledSize: { width: 30, height: 30 },
    labelOrigin: { x: 15, y: -10 },
  },
  dropoff: {
    url: "https://maps.google.com/mapfiles/ms/icons/red.png",
    scaledSize: { width: 30, height: 30 },
    labelOrigin: { x: 15, y: -10 },
  },
  car: {
    url: "https://maps.google.com/mapfiles/ms/micons/cabs.png",
    scaledSize: { width: 40, height: 40 },
    labelOrigin: { x: 20, y: -10 },
  },
};

const LeafletMap = ({ 
  location, 
  driverName, 
  cabNumber, 
  routeFrom, 
  routeTo,
  onMapReady 
}) => {
  // Google Maps reference
  const mapRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  
  // Convert location format from {latitude, longitude} to {lat, lng} for Google Maps
  const [driverLocation, setDriverLocation] = useState({
    lat: location?.latitude || DEFAULT_LOCATION.lat,
    lng: location?.longitude || DEFAULT_LOCATION.lng
  });
  
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [directions, setDirections] = useState(null);
  const [directionsRequested, setDirectionsRequested] = useState(false);


  const getCityCoordinates = (cityName) => {
    if (!cityName) return null;
    
    // Check if it's a known city
    const knownCity = Object.keys(cityLocations).find(
      city => cityName.toLowerCase().includes(city.toLowerCase())
    );
    
    if (knownCity) {
      return cityLocations[knownCity];
    }
    
    // Default to Kolhapur if city not found
    console.log(`City coordinates not found for: ${cityName}, using default`);
    return DEFAULT_LOCATION;
  };


  // Log initial props
  useEffect(() => {
    console.log("🔄 Map component mounted with props:", {
      location,
      driverName,
      cabNumber,
      routeFrom,
      routeTo
    });
  }, [cabNumber, driverName, location, routeFrom, routeTo]);
  
  // Add state for route path
  const [routePath, setRoutePath] = useState([]);
  
  // Update driver position when location changes from WebSocket
  useEffect(() => {
    console.log("🔍 Location data received:", location);
    
    if (location?.latitude && location?.longitude) {
      console.log("📍 Valid location data - updating driver position:", {
        lat: location.latitude,
        lng: location.longitude,
        timestamp: location.timestamp || new Date()
      });
      
      // Parse coordinates as floats to ensure they're numbers
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setDriverLocation({
          lat: lat,
          lng: lng
        });
        
        setLastUpdated(new Date(location.timestamp || new Date()));
        
        // Center map on driver if map is loaded
        if (mapRef.current && isMapLoaded) {
          mapRef.current.panTo({
            lat: lat,
            lng: lng
          });
        }
      } else {
        console.warn("⚠️ Invalid coordinates received:", location);
      }
    } else {
      console.warn("⚠️ Invalid or missing location data. Using default location.");
    }
  }, [location, isMapLoaded]);
  
  // Set pickup and dropoff locations based on routeFrom and routeTo
  useEffect(() => {
    if (routeFrom) {
      const fromCoords = getCityCoordinates(routeFrom);
      setPickupLocation(fromCoords);
    }
    
    if (routeTo) {
      const toCoords = getCityCoordinates(routeTo);
      setDropoffLocation(toCoords);
    }
  }, [routeFrom, routeTo]);
  
  // Request directions when pickup and dropoff locations are set
  useEffect(() => {
    if (isMapLoaded && pickupLocation && dropoffLocation && !directionsRequested) {
      setDirectionsRequested(true);
      console.log("Requesting directions between:", pickupLocation, dropoffLocation);
    }
  }, [isMapLoaded, pickupLocation, dropoffLocation, directionsRequested]);
  
  // Handle map load
  const handleMapLoad = (map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
    
    if (onMapReady) {
      console.log("🗺️ Google Maps instance created and ready");
      onMapReady(map);
      
      // Force a resize to ensure the map renders correctly
      setTimeout(() => {
        if (map) {
          map.panTo(driverLocation);
        }
      }, 100);
    }
  };
  
  // Handle directions response
  const directionsCallback = (response) => {
    console.log("Directions API response:", response);
    
    if (response !== null && response.status === 'OK') {
      setDirections(response);
      
      // Extract path points from the response for custom rendering if needed
      const route = response.routes[0];
      const points = [];
      const legs = route.legs;
      
      for (let i = 0; i < legs.length; i++) {
        const steps = legs[i].steps;
        for (let j = 0; j < steps.length; j++) {
          const nextSegment = steps[j].path;
          for (let k = 0; k < nextSegment.length; k++) {
            points.push(nextSegment[k]);
          }
        }
      }
      
      setRoutePath(points);
      
      // Calculate and log the total distance
      const totalDistance = route.legs.reduce((total, leg) => total + leg.distance.value, 0) / 1000;
      console.log(`Total route distance: ${totalDistance.toFixed(2)} km`);
    } else {
      console.error("Error fetching directions:", response);
      
      // Fallback to straight line if directions fail
      if (pickupLocation && dropoffLocation) {
        setRoutePath([pickupLocation, dropoffLocation]);
      }
    }
  };
  // Create info window content for markers
  const createDriverInfoContent = () => (
    <div className="p-3">
      <h3 className="font-bold text-lg">{driverName || "Driver"}</h3>
      <p className="text-sm"><strong>Cab:</strong> {cabNumber || "N/A"}</p>
      <p className="text-sm">
        <strong>Current Location:</strong> {driverLocation.lat.toFixed(6)}, {driverLocation.lng.toFixed(6)}
      </p>
      <p className="text-sm"><strong>Last Updated:</strong> {lastUpdated.toLocaleTimeString()}</p>
      {routeFrom && routeTo && (
        <p className="text-sm mt-1"><strong>Route:</strong> {routeFrom} → {routeTo}</p>
      )}
    </div>
  );
  
  // Add this function to calculate distance between points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-lg relative">
      {/* Route information panel */}
      <div className="absolute top-2 left-2 z-10 bg-white bg-opacity-90 text-black text-xs p-2 rounded shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div className="flex-1">
            <p className="font-medium">{routeFrom || "Origin"}</p>
          </div>
        </div>
        <div className="h-4 border-l-2 border-dashed border-gray-400 ml-1.5"></div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="flex-1">
            <p className="font-medium">{routeTo || "Destination"}</p>
          </div>
        </div>
      </div>
      
      {/* Driver location indicator */}
      <div className="absolute top-2 right-2 z-10 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        <div>Driver: {driverName || "Unknown"}</div>
        <div>Location: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}</div>
        <div>Updated: {lastUpdated.toLocaleTimeString()}</div>
      </div>
      
      <LoadScript 
        googleMapsApiKey={GOOGLE_MAPS_API_KEY} 
        loadingElement={
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p>Loading Maps...</p>
            </div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={driverLocation}
          zoom={12}
          options={{
            ...mapOptions,
            styles: [
              {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ color: "#7c93a3" }, { lightness: "-10" }]
              },
              {
                featureType: "administrative.country",
                elementType: "geometry",
                stylers: [{ visibility: "on" }]
              },
              {
                featureType: "administrative.province",
                elementType: "geometry.stroke",
                stylers: [{ color: "#a5b1bf" }, { visibility: "on" }, { weight: "1.00" }]
              },
              {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#3a4051" }]
              },
              {
                featureType: "landscape",
                elementType: "geometry.fill",
                stylers: [{ color: "#f1f5f9" }]
              },
              {
                featureType: "road",
                elementType: "geometry.fill",
                stylers: [{ color: "#ffffff" }]
              },
              {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#cbd6e2" }]
              },
              {
                featureType: "water",
                elementType: "geometry.fill",
                stylers: [{ color: "#a3ccff" }]
              }
            ]
          }}
          onLoad={handleMapLoad}
        >
          {/* Request directions when both locations are set */}
          {pickupLocation && dropoffLocation && !directions && (
            <DirectionsService
              options={{
                origin: pickupLocation,
                destination: dropoffLocation,
                travelMode: "DRIVING",
                optimizeWaypoints: true,
              }}
              callback={directionsCallback}
            />
          )}
          
          {/* Render directions */}
          {directions && (
            <DirectionsRenderer
              options={{
                directions: directions,
                suppressMarkers: true, // We'll add our own custom markers
                polylineOptions: {
                  strokeColor: "#4285F4",
                  strokeOpacity: 0.8,
                  strokeWeight: 5
                }
              }}
            />
          )}
          
          {/* Driver marker with car icon - this is the real-time position */}
          <Marker
            position={driverLocation}
            icon={markerIcons.car}
            label={{ text: driverName || "Driver", color: "#ffffff", fontWeight: "bold" }}
            onClick={() => setSelectedMarker("driver")}
            animation={window.google?.maps.Animation.BOUNCE}
          />
          
          {/* Pickup location marker */}
          {pickupLocation && (
            <Marker
              position={pickupLocation}
              icon={markerIcons.pickup}
              label={{ text: routeFrom || "Pickup", color: "#ffffff" }}
              onClick={() => setSelectedMarker("pickup")}
            />
          )}
          
          {/* Dropoff location marker */}
          {dropoffLocation && (
            <Marker
              position={dropoffLocation}
              icon={markerIcons.dropoff}
              label={{ text: routeTo || "Dropoff", color: "#ffffff" }}
              onClick={() => setSelectedMarker("dropoff")}
            />
          )}
          
          {/* Info windows */}
          {selectedMarker === "driver" && (
            <InfoWindow
              position={driverLocation}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-3">
                <h3 className="font-bold text-lg">{driverName || "Driver"}</h3>
                <p className="text-sm"><strong>Cab:</strong> {cabNumber || "N/A"}</p>
                <p className="text-sm">
                  <strong>Current Location:</strong> {driverLocation.lat.toFixed(6)}, {driverLocation.lng.toFixed(6)}
                </p>
                <p className="text-sm"><strong>Last Updated:</strong> {lastUpdated.toLocaleTimeString()}</p>
                {routeFrom && routeTo && (
                  <p className="text-sm mt-1"><strong>Route:</strong> {routeFrom} → {routeTo}</p>
                )}
                {directions && directions.routes && directions.routes[0] && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-sm">
                      <strong>Total Distance:</strong> {directions.routes[0].legs[0].distance.text}
                    </p>
                    <p className="text-sm">
                      <strong>Estimated Time:</strong> {directions.routes[0].legs[0].duration.text}
                    </p>
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
          
          {/* Pickup info window */}
          {selectedMarker === "pickup" && pickupLocation && (
            <InfoWindow
              position={pickupLocation}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2">
                <h3 className="font-bold">Starting Point</h3>
                <p className="text-sm">{routeFrom || "Origin"}</p>
                <p className="text-sm mt-1">
                  <strong>Coordinates:</strong> {pickupLocation.lat.toFixed(6)}, {pickupLocation.lng.toFixed(6)}
                </p>
              </div>
            </InfoWindow>
          )}
          
          {/* Dropoff info window */}
          {selectedMarker === "dropoff" && dropoffLocation && (
            <InfoWindow
              position={dropoffLocation}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2">
                <h3 className="font-bold">Destination</h3>
                <p className="text-sm">{routeTo || "Destination"}</p>
                <p className="text-sm mt-1">
                  <strong>Coordinates:</strong> {dropoffLocation.lat.toFixed(6)}, {dropoffLocation.lng.toFixed(6)}
                </p>
                {pickupLocation && directions && directions.routes && directions.routes[0] && (
                  <p className="text-sm mt-1">
                    <strong>Distance:</strong> {directions.routes[0].legs[0].distance.text}
                    <br />
                    <strong>Duration:</strong> {directions.routes[0].legs[0].duration.text}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default LeafletMap;