// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";
// import Sidebar from "../slidebar/page";
// import axios from "axios";
// import { PDFDownloadLink } from "@react-pdf/renderer";
// import InvoicePDF from "../components/InvoicePDF";
// import { MapPin, X } from 'lucide-react';
// import LeafletMap from "../components/LeafletMap";
// import baseURL from "@/utils/api";
// import Image from 'next/image';


// // Create a driver location storage
// const driverLocations = {};

// const CabSearch = () => {
//   const [cabNumber, setCabNumber] = useState("")
//   const [cabDetails, setCabDetails] = useState([])
//   const [filteredCabs, setFilteredCabs] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [fromDate, setFromDate] = useState("")
//   const [toDate, setToDate] = useState("")
//   const [activeModal, setActiveModal] = useState("")
//   const [selectedDetail, setSelectedDetail] = useState(null)
//   const [cab, setcab] = useState("")
//   const [companyLogo, setCompanyLogo] = useState("")
//   const [signature, setSignature] = useState("")
//   const [companyInfo, setCompanyInfo] = useState("")
//   const [subCompanyName, setCompanyName] = useState("")
//   const [invoiceNumber, setInvoiceNumber] = useState("")
//   const [wsConnected, setWsConnected] = useState(false)
//   const wsRef = useRef(null)
//   const adminId = useRef(`admin-${Date.now()}`)
//   const [showMap, setShowMap] = useState(false)
//   const [selectedDriver, setSelectedDriver] = useState(null)
//   const [notification, setNotification] = useState("")
//   const [routeCoordinates, setRouteCoordinates] = useState({})
//   const [driverRoutes, setDriverRoutes] = useState({})
//   const [mapLoaded, setMapLoaded] = useState(false)
//   const [currentDistance, setCurrentDistance] = useState(0)
//   const [remainingDistance, setRemainingDistance] = useState(0)
//   const [clickedCoordinates, setClickedCoordinates] = useState(null)
//   const[cabData,setCabData]=useState(null)
//   // Add state for image modal
//   const [imageModalOpen, setImageModalOpen] = useState(false)
//   const [selectedImage, setSelectedImage] = useState("")

//   // Track location update interval
//   const locationIntervalRef = useRef(null)
//   // Map reference for Leaflet
//   const mapRef = useRef(null)
//   const markerRef = useRef(null)
//   const routeLayerRef = useRef(null)
//   const routeMarkersRef = useRef([])

//   // Define showNotification callback first since it's used in other functions
//   const showNotification = useCallback((msg) => {
//     setNotification(msg);
//     setTimeout(() => setNotification(""), 3000);
//   }, []);

//   // Define cleanupMap callback before it's used
//   const cleanupMap = useCallback(() => {
//     // Clean up Leaflet map if it exists
//     if (mapRef.current && typeof mapRef.current.remove === 'function') {
//       mapRef.current.remove();
//     }

//     // Reset references
//     mapRef.current = null;
//     markerRef.current = null;

//     if (routeLayerRef.current) {
//       routeLayerRef.current = null;
//     }

//     // Clear route markers
//     routeMarkersRef.current = [];
//   }, []);

//   // Define initializeMap callback before it's used in useEffect
//   const initializeMap = useCallback(() => {
//     if (typeof window === "undefined" || !window.L) {
//       console.log("Leaflet not loaded yet");
//       return;
//     }
  
//     const L = window.L;
//     const mapContainer = document.getElementById("map-container");
  
//     if (!mapContainer) {
//       return;
//     }
  
//     // Set explicit height to ensure the container is visible
//     mapContainer.style.height = "100%";
//     mapContainer.style.width = "100%";
  
//     // Clean up any existing map
//     cleanupMap();
  
//     try {
//       // Get the current driver's location
//       const driverLocation = selectedDriver?.driver?.location;
  
//       // Check if driver's location is available
//       if (!driverLocation) {
//         console.error("Driver location is not available.");
//         return; // Exit if no location is available
//       }
  
//       // Create the map using Leaflet and zoom directly to the driver's location
//       const map = L.map("map-container").setView(
//         [driverLocation.latitude, driverLocation.longitude],
//         15 // Zoom level to directly focus on the driver's location
//       );
  
//       // Add OpenStreetMap tiles
//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution:
//           '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);
  
//       // Create custom marker icon for driver
//       const driverIcon = L.icon({
//         iconUrl: "https://maps.google.com/mapfiles/ms/micons/cabs.png",
//         iconSize: [32, 32],
//         iconAnchor: [16, 32],
//         popupAnchor: [0, -32],
//       });
  
//       // Create marker for the driver's current position
//       const marker = L.marker([driverLocation.latitude, driverLocation.longitude], {
//         icon: driverIcon,
//       }).addTo(map);
  
//       // Add popup with driver and route information
//       marker
//         .bindPopup(
//           `
//           <div style="color: #333; padding: 8px; min-width: 200px;">
//             <strong style="font-size: 14px;">${selectedDriver.driver?.name || "Driver"}</strong><br>
//             <div style="margin-top: 5px;">
//               <strong>Cab:</strong> ${selectedDriver.cab?.cabNumber || "N/A"}<br>
//               <strong>Current Location:</strong> (${driverLocation.latitude.toFixed(6)}, ${driverLocation.longitude.toFixed(6)})<br>
//             </div>
//           </div>
//         `
//         )
//         .openPopup();
  
//       // Save references for future use
//       mapRef.current = map;
//       markerRef.current = marker;
  
//       // Force a resize to ensure the map renders correctly
//       setTimeout(() => {
//         if (mapRef.current) {
//           mapRef.current.invalidateSize();
//         }
//       }, 100);
  
//     } catch (error) {
//       console.error("Error initializing map:", error);
//       showNotification("Error initializing map");
//     }
//   }, [selectedDriver, cleanupMap, showNotification]);

//   // Load Leaflet when component mounts
//   useEffect(() => {
//     if (typeof window !== "undefined" && !window.L) {
//       const link = document.createElement("link");
//       link.rel = "stylesheet";
//       link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
//       document.head.appendChild(link);

//       const script = document.createElement("script");
//       script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
//       script.async = true;
//       script.onload = () => {
//         setMapLoaded(true);
//         console.log("Leaflet loaded successfully");
//       };
//       document.body.appendChild(script);
//     } else if (typeof window !== "undefined" && window.L) {
//       setMapLoaded(true);
//     }
//   }, []);

//   const generateInvoiceNumber = useCallback((companyName) => {
//     const prefix = derivePrefix(companyName);        // e.g. "REP"
//     const finYear = getFinancialYear();              // e.g. "2526"
//     const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
//     return `${prefix}${finYear}-${randomNum}`;
//   }, []);

//   const derivePrefix = (name) => {
//     if (!name) return "INV";
//     const nameParts = name.trim().split(" ");
//     return nameParts
//       .map(part => part.charAt(0).toUpperCase())
//       .join('')
//       .replace(/[^A-Z]/g, '')
//       .slice(0, 3); // e.g. "REP" from "R K Enterprise"
//   };

//   const getFinancialYear = () => {
//     const now = new Date();
//     const currentMonth = now.getMonth() + 1; // 0-based index, so +1
//     const currentYear = now.getFullYear();

//     const fyStart = currentMonth >= 4 ? currentYear : currentYear - 1;
//     const fyEnd = fyStart + 1;

//     const fyStartShort = fyStart.toString().slice(-2); // "25"
//     const fyEndShort = fyEnd.toString().slice(-2);     // "26"

//     return `${fyStartShort}${fyEndShort}`; // "2526"
//   };

//   useEffect(() => {
//     const fetchAdminData = async () => {
//       try {
//         const id = localStorage.getItem("id")
//         const res = await axios.get(`${baseURL}api/admin/getAllSubAdmins`)
//         const admin = res.data.subAdmins.find((el) => el._id === id)

//         if (admin) {
//           setCompanyLogo(admin.companyLogo)
//           setSignature(admin.signature)
//           setCompanyName(admin.name)
//           setCompanyInfo(admin.companyInfo)
//           setInvoiceNumber(generateInvoiceNumber(admin.name))
//         }
//       } catch (err) {
//         console.error("Failed to fetch admin data:", err)
//       }
//     }

//     fetchAdminData()
//   }, [generateInvoiceNumber])

//   useEffect(() => {
//     const fetchAssignedCabs = async () => {
//       setLoading(true)
//       try {
//         const res = await axios.get(`${baseURL}api/assigncab`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         })

//         console.log("we are in price Array", res.data[0].cab.fastTag.amount)
//         const data = res.data[0].cab
//         setCabData(data)
//         setCabDetails(res.data)
//         setFilteredCabs(res.data)
//         // Fetch route coordinates for all cabs
//         const routes = {}
//         const driverRoutesMap = {}

//         for (const cab of res.data) {
//           if (cab.cab?.tripDetails?.location?.from && cab.cab?.tripDetails?.location?.to) {
//             const routeData = await fetchRouteCoordinates(
//               cab.cab.tripDetails.location.from,
//               cab.cab.tripDetails.location.to,
//             )
//             if (routeData) {
//               routes[cab.cab.cabNumber] = routeData

//               // Map driver ID to their assigned route
//               if (cab.driver?.id) {
//                 driverRoutesMap[cab.driver.id] = {
//                   cabNumber: cab.cab.cabNumber,
//                   route: routeData,
//                   from: cab.cab.tripDetails.location.from,
//                   to: cab.cab.tripDetails.location.to,
//                   totalDistance: cab.cab.tripDetails.location.totalDistance || "0",
//                 }
//               }
//             }
//           }
//         }

//         setRouteCoordinates(routes)
//         setDriverRoutes(driverRoutesMap)
//       } catch (err) {
//         setError("Failed to fetch assigned cabs")
//         setCabDetails([])
//         setFilteredCabs([])
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchAssignedCabs()
//   }, [])

//   // Fetch route coordinates using OpenStreetMap Nominatim API
//   const fetchRouteCoordinates = async (from, to) => {
//     try {
//       // Fetch coordinates for origin
//       const fromRes = await axios.get(
//         `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//           from
//         )},India&format=json&limit=1`
//       );

//       // Fetch coordinates for destination
//       const toRes = await axios.get(
//         `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//           to
//         )},India&format=json&limit=1`
//       );

//       if (fromRes.data.length > 0 && toRes.data.length > 0) {
//         return {
//           from: {
//             lat: Number.parseFloat(fromRes.data[0].lat),
//             lng: Number.parseFloat(fromRes.data[0].lon),
//             name: from,
//           },
//           to: {
//             lat: Number.parseFloat(toRes.data[0].lat),
//             lng: Number.parseFloat(toRes.data[0].lon),
//             name: to,
//           },
//         };
//       }
//       return null;
//     } catch (error) {
//       console.error("Error fetching route coordinates:", error);
//       return null;
//     }
//   };

//   // Calculate distance between two points in kilometers
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371; 
//     const dLat = deg2rad(lat2 - lat1);
//     const dLon = deg2rad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(deg2rad(lat1)) *
//       Math.cos(deg2rad(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c; // Distance in km
//     return distance;
//   };

//   const deg2rad = (deg) => {
//     return deg * (Math.PI / 180);
//   };

//   // useEffect(() => {
//   //   // Connect to WebSocket server
//   //   const connectWebSocket = () => {
//   //     if (wsRef.current) {
//   //       console.log("WebSocket connection already exists");
//   //       return;
//   //     }

//   //     try {
//   //       const wsUrl = "wss://localhost:5000"; // Update with your WebSocket server URL
//   //       console.log("Connecting to WebSocket server at:", wsUrl);
//   //       wsRef.current = new WebSocket(wsUrl);

//   //       wsRef.current.onopen = () => {
//   //         console.log("WebSocket connection established");
//   //         setWsConnected(true);

//   //         // Register as admin
//   //         wsRef.current.send(
//   //           JSON.stringify({
//   //             type: "register",
//   //             role: "admin",
//   //             driverId: adminId.current,
//   //           })
//   //         );
//   //       };

//   //       wsRef.current.onmessage = (event) => {
//   //         try {
//   //           const data = JSON.parse(event.data);
//   //           console.log("WebSocket message received:", data);

//   //           if (data.type === "location") {
//   //             console.log("helloo");

//   //             setSelectedDriver((prev) => {
//   //               if (!prev) return prev;
//   //               return {
//   //                 ...prev,
//   //                 driver: {
//   //                   ...prev.driver,
//   //                   location: {
//   //                     latitude: data.location.latitude,
//   //                     longitude: data.location.longitude,
//   //                     timestamp: data.location.timestamp || new Date().toISOString(),
//   //                   },
//   //                 },
//   //               };
//   //             });
//   //           }
//   //         } catch (error) {
//   //           console.error("Error parsing WebSocket message:", error);
//   //         }
//   //       };

//   //       wsRef.current.onclose = () => {
//   //         console.log("WebSocket connection closed");
//   //         setWsConnected(false);
//   //         wsRef.current = null;

//   //         // Try to reconnect after a delay
//   //         setTimeout(() => {
//   //           connectWebSocket();
//   //         }, 5000);
//   //       };

//   //       wsRef.current.onerror = (error) => {
//   //         console.error("WebSocket error:", error);
//   //         setWsConnected(false);
//   //       };
//   //     } catch (error) {
//   //       console.error("Error connecting to WebSocket:", error);
//   //       setWsConnected(false);
//   //     }
//   //   };

//   //   connectWebSocket();

//   //   return () => {
//   //     if (wsRef.current) {
//   //       wsRef.current.close();
//   //       wsRef.current = null;
//   //     }
//   //   };
//   // }, []);

//   // Initialize map when showing it and Leaflet is loaded
  
//   useEffect(() => {
//     if (typeof window === 'undefined') return; // Skip on server-side
  
//     const connectWebSocket = () => {
//       if (wsRef.current) return;
  
//       const wsUrl = "wss://api.expengo.com";
//       console.log("Connecting to WebSocket:", wsUrl);
//       wsRef.current = new WebSocket(wsUrl);
  
//       wsRef.current.onopen = () => {
//         console.log("WebSocket connected");
//         setWsConnected(true);
//         wsRef.current.send(JSON.stringify({
//           type: "register",
//           role: "admin",
//           driverId: adminId.current,
//         }));
//       };
  
//       wsRef.current.onerror = (error) => {
//         console.error("WebSocket error:", error);
//         setWsConnected(false);
//         wsRef.current = null;
//         setTimeout(connectWebSocket, 5000); // Retry
//       };
  
//       wsRef.current.onclose = () => {
//         console.log("WebSocket disconnected");
//         setWsConnected(false);
//         wsRef.current = null;
//         setTimeout(connectWebSocket, 5000); // Retry
//       };
//     };
  
//     connectWebSocket();
  
//     return () => {
//       if (wsRef.current) wsRef.current.close();
//     };
//   }, []);
  
//   useEffect(() => {
//     if (showMap && selectedDriver && mapLoaded) {
//       initializeMap();
//     }
//   }, [showMap, selectedDriver, mapLoaded, initializeMap]);

//   // Calculate position along the route based on progress
//   const calculatePositionAlongRoute = (from, to, progress) => {
//     const latitude = from.lat + (to.lat - from.lat) * progress;
//     const longitude = from.lng + (to.lng - from.lng) * progress;

//     console.log("Latitude:", latitude);
//     console.log("Longitude:", longitude);
    
//     return {
//       latitude,
//       longitude,
//       timestamp: new Date().toISOString(),
//     };
//   };

//   // Add this function to handle map ready event
//   const handleMapReady = (map) => {
//     console.log("🗺️ Google Map is ready");
//     mapRef.current = map;

//     // Start location tracking for the selected driver
//     if (selectedDriver && selectedDriver.driver) {
//       startLocationTracking(selectedDriver);
//     }
//   };

//   // Update distance calculations based on current location
//   const updateDistanceCalculations = (driverId, location) => {
//     const driverRoute = driverRoutes[driverId];
//     if (!driverRoute || !driverRoute.route) return;

//     const route = driverRoute.route;

//     // Calculate distance traveled from origin
//     const distanceFromOrigin = calculateDistance(
//       route.from.lat,
//       route.from.lng,
//       location.latitude,
//       location.longitude
//     );

//     // Calculate remaining distance to destination
//     const distanceToDestination = calculateDistance(
//       location.latitude,
//       location.longitude,
//       route.to.lat,
//       route.to.lng
//     );

//     // Calculate total route distance
//     const totalRouteDistance = calculateDistance(
//       route.from.lat,
//       route.from.lng,
//       route.to.lat,
//       route.to.lng
//     );

//     // Update state with the calculated distances
//     setCurrentDistance(distanceFromOrigin.toFixed(2));
//     setRemainingDistance(distanceToDestination.toFixed(2));

//     console.log("From:", route.from.lat, route.from.lng);
//     console.log("Current Location:", location.latitude, location.longitude);
//     console.log("To:", route.to.lat, route.to.lng);

//     // Update the driver's route with the new distance information
//     setDriverRoutes((prev) => ({
//       ...prev,
//       [driverId]: {
//         ...prev[driverId],
//         currentDistance: distanceFromOrigin.toFixed(2),
//         remainingDistance: distanceToDestination.toFixed(2),
//         totalRouteDistance: totalRouteDistance.toFixed(2),
//       },
//     }));
//   };

//   // Generate driver location based on assigned route
//   const getDriverLocation = (cab, driverId) => {
//     // Get the driver's assigned route
//     const driverRoute = driverRoutes[driverId];
//     const cabNumber = cab?.cabNumber;

//     // First check if we have a specific route for this driver
//     const route = driverRoute ? driverRoute.route : routeCoordinates[cabNumber];

//     // If we don't have route data, return a default location
//     if (!route) {
//       return {
//         latitude: 28.6139, // Default to Delhi
//         longitude: 77.209,
//         timestamp: new Date().toISOString(),
//       };
//     }

//     // If we already have a stored location for this driver, use it with some movement
//     if (driverLocations[driverId]) {
//       const currentLoc = driverLocations[driverId];
//       const fromCoords = route.from;
//       const toCoords = route.to;

//       // Find how far along the route we are (0 to 1)
//       const totalDistance = Math.sqrt(
//         Math.pow(toCoords.lat - fromCoords.lat, 2) +
//         Math.pow(toCoords.lng - fromCoords.lng, 2)
//       );

//       const currentDistance = Math.sqrt(
//         Math.pow(currentLoc.latitude - fromCoords.lat, 2) +
//         Math.pow(currentLoc.longitude - fromCoords.lng, 2)
//       );

//       let progress = currentDistance / totalDistance;

//       // Add some small movement along the route (0.5% to 2% progress)
//       progress += Math.random() * 0.015 + 0.005;

//       // If we've gone past the destination, reset to start
//       if (progress >= 1) {
//         progress = 0;
//       }

//       // Calculate new position
//       const newLocation = calculatePositionAlongRoute(
//         fromCoords,
//         toCoords,
//         progress
//       );

//       // Update distance calculations for this new location
//       updateDistanceCalculations(driverId, newLocation);

//       return newLocation;
//     }

//     // If no stored location, start at the origin with a small random offset
//     const initialLocation = {
//       latitude: route.from.lat + (Math.random() * 0.01 - 0.005),
//       longitude: route.from.lng + (Math.random() * 0.01 - 0.005),
//       timestamp: new Date().toISOString(),
//     };

//     // Initialize distance calculations
//     updateDistanceCalculations(driverId, initialLocation);

//     return initialLocation;
//   };

//   // Add waypoints along the route to make it more detailed
//   const addWaypointsAlongRoute = (route, map, L) => {
//     if (!route || !map || !L) return;

//     const fromPoint = [route.from.lat, route.from.lng];
//     const toPoint = [route.to.lat, route.to.lng];

//     // Calculate distance between points
//     const distance = Math.sqrt(
//       Math.pow(toPoint[0] - fromPoint[0], 2) +
//       Math.pow(toPoint[1] - fromPoint[1], 2)
//     );

//     // Determine number of waypoints based on distance
//     const numWaypoints = Math.min(Math.ceil(distance * 100), 10); // Max 10 waypoints

//     if (numWaypoints <= 1) return; // No need for waypoints if distance is small

//     // Create waypoints
//     for (let i = 1; i < numWaypoints; i++) {
//       const progress = i / numWaypoints;
//       const waypointLat = fromPoint[0] + (toPoint[0] - fromPoint[0]) * progress;
//       const waypointLng = fromPoint[1] + (toPoint[1] - fromPoint[1]) * progress;

//       // Create a small marker for the waypoint with better styling
//       const waypointIcon = L.divIcon({
//         className: "waypoint-marker",
//         html: `<div style="background-color: #FBBC05; width: 8px; height: 8px; border-radius: 50%; border: 1px solid white; box-shadow: 0 0 3px rgba(0,0,0,0.2);"></div>`,
//         iconSize: [8, 8],
//         iconAnchor: [4, 4],
//       });

//       const waypointMarker = L.marker([waypointLat, waypointLng], {
//         icon: waypointIcon,
//       }).addTo(map);

//       // Add tooltip with distance information
//       const distanceFromStart = calculateDistance(
//         route.from.lat, route.from.lng,
//         waypointLat, waypointLng
//       ).toFixed(1);

//       waypointMarker.bindTooltip(`${distanceFromStart} KM`,
//         { direction: 'top', opacity: 0.7 });

//       // Store waypoint markers for cleanup
//       routeMarkersRef.current.push(waypointMarker);
//     }
//   };

//   // Update map marker position
//   const updateMapMarker = (location) => {
//     if (!markerRef.current || !mapRef.current) return;

//     const newPosition = [location.latitude, location.longitude];
//     markerRef.current.setLatLng(newPosition);
//     mapRef.current.panTo(newPosition); // Pan to the new driver location
//     mapRef.current.setZoom(15); // Set zoom level to 15 for better visibility
//   };

//   const handleLocationClick = (item) => {
//     // Make sure we have a valid driver
//     if (!item.driver) {
//       showNotification("⚠️ No driver information available");
//       return;
//     }

//     // Get the latest location from WebSocket if available
//     const latestLocation = driverLocations[item.driver.id] || item.driver.location;

//     // Set the selected driver with all necessary information
//     setSelectedDriver({
//       driver: {
//         ...item.driver,
//         // Use the latest location from WebSocket or fallback to the provided location
//         location: latestLocation ? {
//           latitude: parseFloat(latestLocation.latitude || 16.7050),
//           longitude: parseFloat(latestLocation.longitude || 74.2433),
//           timestamp: latestLocation.timestamp || new Date().toISOString()
//         } : {
//           latitude: 16.7050,
//           longitude: 74.2433,
//           timestamp: new Date().toISOString()
//         }
//       },
//       cab: {
//         ...item.cab,
//         // Ensure route information is properly formatted
//         location: {
//           from: item.cab?.location?.from || "Pune",
//           to: item.cab?.location?.to || "Pune",
//           totalDistance: item.cab?.location?.totalDistance ||
//             calculateRouteDistance(item.cab?.location?.from, item.cab?.location?.to)
//         }
//       }
//     });

//     // Show the map modal
//     setShowMap(true);
//   };

//   const calculateRouteDistance = (from, to) => {
//     // Define some common routes and their distances
//     const commonRoutes = {
//       "Pune-Mumbai": 375,
//       "Mumbai-Kolhapur": 375,
//       "Kolhapur-Pune": 230,
//       "Pune-Kolhapur": 230,
//       "Mumbai-Pune": 150,
//       "Pune-Mumbai": 150,
//       "Mumbai-Delhi": 1400,
//       "Delhi-Mumbai": 1400,
//       "Kolhapur-Bangalore": 500,
//       "Bangalore-Kolhapur": 500
//     };

//     if (!from || !to) return "0";

//     const routeKey = `${from}-${to}`;
//     if (commonRoutes[routeKey]) {
//       return commonRoutes[routeKey].toString();
//     }

//     // Default distance if route not found
//     return "300";
//   };

//   const startLocationTracking = (driver) => {
//     // Clear any existing interval
//     if (locationIntervalRef.current) {
//       clearInterval(locationIntervalRef.current);
//     }

//     // Immediately fetch the first location
//     fetchDriverLocation(driver);

//     // Then set up regular updates every 5 seconds
//     locationIntervalRef.current = setInterval(() => {
//       fetchDriverLocation(driver);
//     }, 5000);
//   };

//   const fetchDriverLocation = async (driver) => {
//     try {
//       if (!driver.driver?.id) {
//         showNotification("Driver ID not found");
//         return;
//       }

//       showNotification(`Fetching location for ${driver.driver?.name}...`);

//       // Get location based on the assigned route
//       const location = getDriverLocation(driver.cab, driver.driver.id);

//       // Store the location
//       driverLocations[driver.driver.id] = location;

//       if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//         const locationMessage = {
//           type: "location",
//           driverId: driver.driver?.id,
//           role: "driver",
//           location: location,
//         };

//         wsRef.current.send(JSON.stringify(locationMessage));

//         // Also update the selected driver if this is the one being viewed
//         if (selectedDriver && selectedDriver.driver?.id === driver.driver?.id) {
//           setSelectedDriver((prev) => {
//             if (!prev) return prev;
//             return {
//               ...prev,
//               driver: {
//                 ...prev.driver,
//                 location: location,
//               },
//             };
//           });

//           // Update map marker if using Leaflet directly
//           if (markerRef.current && mapRef.current) {
//             updateMapMarker(location); // Automatically zooms in on the new location
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching driver location:", error);
//       showNotification("Error fetching driver location");
//     }
//   };

//   const closeMap = () => {
//     // Stop location tracking when map is closed
//     if (locationIntervalRef.current) {
//       clearInterval(locationIntervalRef.current);
//       locationIntervalRef.current = null;
//     }

//     // No need to clean up Leaflet map as we're using React component
//     setShowMap(false);
//     setSelectedDriver(null);
//   };

//   const handleSearch = () => {
//     setError(null)
//     if (!cabNumber) {
//       setError("Please enter a cab number")
//       return
//     }

//     const filtered = cabDetails.filter((item) => item.cab?.cabNumber?.toLowerCase().includes(cabNumber.toLowerCase()))

//     setFilteredCabs(filtered)
//     if (filtered.length === 0) setError("Cab details not found")
//   }

//   const handleDateFilter = () => {
//     if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
//       setError("To date must be after From date")
//       return
//     }

//     const filtered = cabDetails.filter((item) => {
//       const assignedDate = new Date(item.assignedAt).toISOString().split("T")[0]
//       const startDate = fromDate || "1970-01-01"
//       const endDate = toDate || "2100-01-01"

//       return assignedDate >= startDate && assignedDate <= endDate
//     })

//     setFilteredCabs(filtered)
//     if (filtered.length === 0) setError("No cabs found in the selected date range")
//   }

//   const openModal = (type, data) => {
//     if (!data) {
//       console.error(`No data found for type: ${type}`)
//       return
//     }
//     setSelectedDetail({ type, data })
//     setActiveModal("Details")
//   }

//   const closeModal = () => {
//     setActiveModal("")
//     setSelectedDetail(null)
//   }

//   // Open image modal
//   const openImageModal = (imageUrl) => {
//     setSelectedImage(imageUrl)
//     setImageModalOpen(true)
//   }

//   // Close image modal
//   const closeImageModal = () => {
//     setSelectedImage("")
//     setImageModalOpen(false)
//   }

//   // Helper function to display images in a gallery format
//   const renderImageGallery = (images) => {
//     if (!images || !Array.isArray(images) || images.length === 0) {
//       return <p className="text-gray-400 bg-gradient-to-b bg-black/50 to-transparent backdrop-blur-md">No images available</p>
//     }

//     return (
//       <div className="flex flex-wrap gap-2 mt-2">
//         {images.map((image, index) => (
//           <div key={index} onClick={() => openImageModal(image)} className="cursor-pointer">
//             <Image
//               src={image || "/placeholder.svg"}
//               alt={`Image ${index + 1}`}
//               width={200}
//               height={400}
//               className="w-24 h-24 object-cover rounded border border-gray-600 hover:border-blue-500 transition-all"
//             />
//           </div>
//         ))}
//       </div>
//     )
//   }

//   // Helper function to calculate and display total amount
//   const renderAmountTotal = (amounts) => {
//     if (!amounts || !Array.isArray(amounts)) {
//       return null
//     }

//     // Filter out null values and calculate total
//     const validAmounts = amounts.filter((amount) => amount !== null)
//     const total = validAmounts.reduce((sum, amount) => sum + Number(amount), 0)

//     return (
//       <div className="mt-3 pt-3 border-t border-gray-700">
//         <div className="flex justify-between items-center">
//           <span className="font-medium">Total Amount:</span>
//           <span className="text-lg font-bold text-green-400">₹{total.toLocaleString()}</span>
//         </div>
//       </div>
//     )
//   }

//   // Format date and time for display
//   const formatDateTime = (timestamp) => {
//     if (!timestamp) return "N/A"

//     const date = new Date(timestamp)
//     return date.toLocaleString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: true,
//     })
//   }

//   // Function to render the appropriate content based on detail type
//   const renderDetailContent = () => {
//     if (!selectedDetail || !selectedDetail.type || !selectedDetail.data) {
//       return <p>No details available</p>
//     }

//     const { type, data } = selectedDetail

//     switch (type) {
//       case "fuel":
//         return (
//           <>
//             <div className="mb-4">
//               <h3 className="text-lg font-medium mb-2">Payment Details</h3>
//               <p>
//                 <span className="text-gray-400">Payment Type:</span> {data.type || "N/A"}
//               </p>

//               {data.receiptImage && Array.isArray(data.receiptImage) && data.receiptImage.length > 0 && (
//                 <>
//                   <h3 className="text-lg font-medium mt-4 mb-2">Fuel Receipts</h3>
//                   {renderImageGallery(data.receiptImage)}
//                 </>
//               )}

//               {data.transactionImage && Array.isArray(data.transactionImage) && data.transactionImage.length > 0 && (
//                 <>
//                   <h3 className="text-lg font-medium mt-4 mb-2">Transaction Images</h3>
//                   {renderImageGallery(data.transactionImage)}
//                 </>
//               )}

//               {data.amount && renderAmountTotal(data.amount)}
//             </div>
//           </>
//         )

//       case "fastTag":
//         return (
//           <>
//             <div className="mb-4">
//               <p>
//                 <span className="text-gray-400">Payment Mode:</span> {data.paymentMode || "N/A"}
//               </p>
//               {data.amount && renderAmountTotal(data.amount)}
//             </div>
//           </>
//         )

//       case "tyrePuncture":
//         return (
//           <>
//             <div className="mb-4">
//               <h3 className="text-lg font-medium mb-2">Repair Details</h3>
//               {data.image && Array.isArray(data.image) && data.image.length > 0 && renderImageGallery(data.image)}
//               {data.repairAmount && renderAmountTotal(data.repairAmount)}
//             </div>
//           </>
//         )

//       case "vehicleServicing":
//         return (
//           <>
//             <div className="mb-4">
//               <p>
//                 <span className="text-gray-400">Required Service:</span> {data.requiredService ? "Yes" : "No"}
//               </p>
//               <p>
//                 <span className="text-gray-400">Details:</span> {data.details || "N/A"}
//               </p>

//               {/* Service Images */}
//               {data.image && Array.isArray(data.image) && data.image.length > 0 && (
//                 <>
//                   <h3 className="text-lg font-semibold mt-4 mb-2">OdoMeter Images</h3>
//                   {renderImageGallery(data.image)}
//                 </>
//               )}

//               {/* Receipt Images */}
//               {data.receiptImage && Array.isArray(data.receiptImage) && data.receiptImage.length > 0 && (
//                 <>
//                   <h3 className="text-lg font-semibold mt-4 mb-2">Vehicle Receipt Images</h3>
//                   {renderImageGallery(data.receiptImage)}
//                 </>
//               )}

//               {/* Total Service Amount */}
//               {data.amount && Array.isArray(data.amount) && data.amount.length > 0 && (
//                 <p>
//                   <span className="text-gray-400">Total Amount:</span> ₹
//                   {data.amount.reduce((acc, curr) => acc + Number(curr || 0), 0)}
//                 </p>
//               )}
//             </div>
//           </>
//         )

//       case "otherProblems":
//         return (
//           <>
//             <div className="mb-4">
//               <p>
//                 <span className="text-gray-400">Details:</span> {data.details || "N/A"}
//               </p>

//               {data.image && Array.isArray(data.image) && data.image.length > 0 && (
//                 <>
//                   <h3 className="text-lg font-medium mt-4 mb-2">Problem Images</h3>
//                   {renderImageGallery(data.image)}
//                 </>
//               )}

//               {data.amount && renderAmountTotal(data.amount)}
//             </div>
//           </>
//         )
//       }
//     }

//   return (
//     <div className="flex min-h-screen bg-gray-800">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="flex-1 p-4 md:p-6 md:ml-60 mt-20 sm:mt-0 text-white transition-all duration-300">
//         {notification && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div className="bg-indigo-600 text-white px-6 py-3 rounded-md shadow-lg transition-all duration-300 animate-fadeIn">
//               {notification}
//             </div>
//           </div>
//         )}

//         <h1 className="text-xl md:text-2xl font-bold mb-4">Cab Search</h1>

//         {/* WebSocket Connection Indicator */}
//         <div className="flex items-center gap-2 mb-4">
//           <div className={`h-3 w-3 rounded-full ${wsConnected ? "bg-green-500" : "bg-red-500"}`}></div>
//           <span className="text-sm">{wsConnected ? "WebSocket Connected" : "WebSocket Disconnected"}</span>
//         </div>

//         {/* Search and Filter Section */}
//         <div className="space-y-4 mb-6">
//           {/* Search by Cab Number */}
//           <div className="flex flex-col sm:flex-row gap-2">
//             <input
//               type="text"
//               placeholder="Enter Cab Number"
//               value={cabNumber}
//               onChange={(e) => setCabNumber(e.target.value)}
//               className="border p-2 rounded w-full bg-gray-700 text-white"
//             />
//             <button
//               onClick={handleSearch}
//               className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded whitespace-nowrap transition-colors"
//               disabled={loading}
//             >
//               {loading ? "Searching..." : "Search"}
//             </button>
//           </div>

//           {/* Filter by Date */}
//           <div className="flex flex-col sm:flex-row gap-2">
//             <div className="flex-1 flex flex-col sm:flex-row gap-2">
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 className="border p-2 rounded bg-gray-700 text-white w-full"
//               />
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 className="border p-2 rounded bg-gray-700 text-white w-full"
//               />
//             </div>
//             <button
//               onClick={handleDateFilter}
//               className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded whitespace-nowrap transition-colors"
//             >
//               Filter by Date
//             </button>
//           </div>
//         </div>

//         {error && <p className="text-red-500 mb-4">{error}</p>}

//         {/* Loading State */}
//         {loading ? (
//           <div className="animate-pulse space-y-4">
//             {[...Array(5)].map((_, i) => (
//               <div key={i} className="bg-gray-700 h-16 rounded-md"></div>
//             ))}
//           </div>
//         ) : (
//           <>
//             {/* Desktop Table View */}
//             <div className="hidden md:block bg-gray-700 shadow-lg rounded-lg overflow-x-auto">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-800 text-white">
//                     <th className="p-3 text-left">#</th>
//                     <th className="p-3 text-left">Cab No</th>
//                     <th className="p-3 text-left">Driver</th>
//                     <th className="p-3 text-left">Assigned Date</th>
//                     <th className="p-3 text-left">Route</th>
//                     <th className="p-3 text-left">Status</th>
//                     <th className="p-3 text-left">Details</th>
//                     <th className="p-3 text-left">Location</th>
//                     <th className="p-2">Invoice</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredCabs.length > 0 ? (
//                     filteredCabs.map((item, index) => (
//                       <tr key={index} className="border-b border-gray-600 hover:bg-gray-600 transition-colors">
//                         <td className="p-3">{index + 1}</td>
//                         <td className="p-3 font-medium">{item.cab?.cabNumber || "N/A"}</td>
//                         <td className="p-3">{item.driver?.name || "N/A"}</td>
//                         <td className="p-3">
//                           {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : "N/A"}
//                         </td>
//                         <td className="p-3">
//                           {item.tripDetails?.location?.from || "N/A"} → {item.tripDetails?.location?.to || "N/A"}
//                         </td>
//                         {/* <td className="p-3 text-green-500" >{item?.status} </td> */}
//                         <td
//                           className={`p-3 ${item?.status === "assigned"
//                             ? "text-red-500 border-white"
//                             : item?.status === "completed"
//                               ? "text-green-500 border-white"
//                               : "text-green-500 border-white"
//                             }`}
//                         >
//                           {item?.status}
//                         </td>
//                         <td className="p-3">
//                           <select
//                             className="border p-1 rounded bg-gray-800 text-white"
//                             onChange={(e) => e.target.value && openModal(e.target.value, item.tripDetails[e.target.value])}
//                           >
//                             <option value="">Select</option>
//                             <option value="fuel">Fuel</option>
//                             <option value="fastTag">FastTag</option>
//                             <option value="tyrePuncture">Tyre</option>
//                             <option value="vehicleServicing">Servicing</option>
//                             <option value="otherProblems">Other Problems</option>
//                           </select>
//                         </td>
//                         <td className="p-3">
//                           <div className="flex items-center gap-2">
//                             <button
//                               className={`text-green-400 transition-all duration-300 hover:scale-110 hover:shadow-md ${item.driver?.location ? "animate-pulse" : ""
//                                 }`}
//                               onClick={() => handleLocationClick(item)}
//                               title="Track Location"
//                               disabled={!wsConnected}
//                             >
//                               <MapPin size={16} />
//                             </button>
//                             {item.driver?.location && <span className="text-xs text-green-400">Live</span>}
//                           </div>
//                         </td>
//                         <td className="p-2">
//                           <PDFDownloadLink
//                             document={
//                               <InvoicePDF
//                               cabData={cabData}
//                                 trip={item}
//                                 companyLogo={companyLogo}
//                                 signature={signature}
//                                 companyPrefix={derivePrefix(subCompanyName)}
//                                 companyInfo={companyInfo}
//                                 companyName={subCompanyName}
//                                 invoiceNumber={invoiceNumber || `${derivePrefix(subCompanyName)}-${String(item.invoiceSerial).padStart(5, "0")}`}
//                                 invoiceDate={new Date().toLocaleDateString("en-IN")}
//                               />
//                             }
//                             fileName={`Invoice-${item?.cab?.cabNumber}.pdf`}
//                           >
//                             {({ loading }) => (
//                               <button className="w-full bg-green-600 text-white px-4 py-2 rounded">
//                                 {loading ? "Generating PDF..." : "Download Invoice"}
//                               </button>
//                             )}
//                           </PDFDownloadLink>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="9" className="p-4 text-center">
//                         No results found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile Card View */}
//             <div className="md:hidden space-y-3">
//               {filteredCabs.length > 0 ? (
//                 filteredCabs.map((item, index) => (
//                   <div key={index} className="bg-gray-700 p-4 rounded-lg shadow">
//                     <div className="grid grid-cols-2 gap-2 mb-3">
//                       <div>
//                         <p className="text-gray-400 text-sm">Cab No</p>
//                         <p className="font-medium">{item.cab?.cabNumber || "N/A"}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-400 text-sm">Driver</p>
//                         <p>{item.driver?.name || "N/A"}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-400 text-sm">Assigned Date</p>
//                         <p>{item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : "N/A"}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-400 text-sm">Distance</p>
//                         <p>{item.tripDetails?.location?.totalDistance || "0"} KM</p>
//                       </div>
//                     </div>
//                     <div className="mb-3">
//                       <p className="text-gray-400 text-sm">Route</p>
//                       <p>
//                         {item.tripDetails?.location?.from || "N/A"} → {item.tripDetails?.location?.to || "N/A"}
//                       </p>
//                     </div>
//                     <div className="flex gap-2 mb-2">
//                       <select
//                         className="w-full border p-2 rounded bg-gray-800 text-white"
//                         onChange={(e) => e.target.value && openModal(e.target.value, item.cab[e.target.value])}
//                       >
//                         <option value="">View Details</option>
//                         <option value="fuel">Fuel Details</option>
//                         <option value="fastTag">FastTag Details</option>
//                         <option value="tyrePuncture">Tyre Details</option>
//                         <option value="vehicleServicing">Servicing Details</option>
//                         <option value="otherProblems">Other Problems</option>
//                       </select>
//                       <button
//                         className={`text-green-400 p-2 rounded border border-gray-600 ${item.driver?.location ? "animate-pulse" : ""
//                           }`}
//                         onClick={() => handleLocationClick(item)}
//                         title="Track Location"
//                         disabled={!wsConnected}
//                       >
//                         <MapPin size={16} />
//                       </button>
//                     </div>
//                     <PDFDownloadLink
//                       document={
//                         <InvoicePDF
//                           trip={item}
//                           companyLogo={companyLogo}
//                           signature={signature}
//                           companyPrefix={derivePrefix(subCompanyName)}
//                           companyInfo={companyInfo}
//                           companyName={subCompanyName}
//                           invoiceNumber={invoiceNumber || `${derivePrefix(subCompanyName)}-${String(item.invoiceSerial).padStart(5, "0")}`}
//                           invoiceDate={new Date().toLocaleDateString("en-IN")}
//                         />
//                       }
//                       fileName={`Invoice-${item?.cab?.cabNumber}.pdf`}
//                     >
//                       {({ loading }) => (
//                         <button className="w-full bg-green-600 text-white px-4 py-2 rounded">
//                           {loading ? "Generating PDF..." : "Download Invoice"}
//                         </button>
//                       )}
//                     </PDFDownloadLink>
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-4 text-center bg-gray-700 rounded-lg">No results found</div>
//               )}
//             </div>
//           </>
//         )}

//         {/* Details Modal */}
//         {activeModal && selectedDetail && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
//             <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-bold capitalize">{selectedDetail.type} Details</h2>
//                 <button onClick={closeModal} className="text-gray-400 hover:text-white">
//                   <X size={20} />
//                 </button>
//               </div>

//               {renderDetailContent()}

//               <button
//                 onClick={closeModal}
//                 className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Image Modal */}
//         {imageModalOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
//             <div className="bg-gray-800 rounded-lg p-4 max-w-2xl w-full shadow-[0_0_25px_10px_rgba(255,255,255,0.5)]">
//               <div className="flex justify-end mb-3">
//                 <button onClick={closeImageModal}
//                   className="text-white-500 hover:text-red-700 transition-colors">
//                   <X size={20} />
//                 </button>
//               </div>
//               <div className="border border-gray-700 rounded-lg overflow-hidden">
//                 <Image
//                   src={selectedImage || "/placeholder.svg"}
//                   alt="Preview"
//                   width={200}
//                   height={400}
//                   className="max-w-full max-h-[70vh] object-contain mx-auto"
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Map Modal */}
//         {showMap && selectedDriver && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
//               <div className="p-4 border-b flex justify-between items-center">
//                 <h2 className="text-xl font-bold text-gray-800">
//                   {selectedDriver.driver?.name || "Driver"} - {selectedDriver.cab?.cabNumber || "N/A"}
//                 </h2>
//                 <button
//                   onClick={() => setShowMap(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               {/* Route information panel */}
//               <div className="bg-gray-100 p-3 border-b">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
//                   <div className="flex-1">
//                     <p className="font-medium text-gray-800">From: {selectedDriver.cab?.location?.from || "N/A"}</p>
//                   </div>
//                 </div>
//                 <div className="h-6 border-l-2 border-dashed border-gray-400 ml-1.5"></div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
//                   <div className="flex-1">
//                     <p className="font-medium text-gray-800">To: {selectedDriver.cab?.location?.to || "N/A"}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex-1" style={{ height: "500px" }}>
//                 <LeafletMap
//                   location={selectedDriver.driver?.location}
//                   driverName={selectedDriver.driver?.name}
//                   cabNumber={selectedDriver.cab?.cabNumber}
//                   routeFrom={selectedDriver.tripDetails?.location?.from}
//                   routeTo={selectedDriver.tripDetails?.location?.to}
//                   onMapReady={(map) => {
//                     console.log("Map is ready", map);
//                     // Force a resize to ensure the map renders correctly
//                     setTimeout(() => {
//                       if (map) {
//                         map.panTo({
//                           lat: parseFloat(selectedDriver.driver?.location?.latitude) || 16.7050,
//                           lng: parseFloat(selectedDriver.driver?.location?.longitude) || 74.2433
//                         });
//                       }
//                     }, 100);
//                   }}
//                 />
//               </div>

//               <div className="p-4 bg-gray-100">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm font-semibold text-gray-800">Driver: {selectedDriver.driver?.name || "N/A"}</p>
//                     <p className="text-sm font-semibold text-gray-800">Cab Number: {selectedDriver.cab?.cabNumber || "N/A"}</p>
//                     <p className="text-sm font-semibold text-gray-800">
//                       Distance: {selectedDriver.tripDetails?.location?.totalDistance ||
//                         (driverRoutes[selectedDriver.driver?.id]?.totalDistance) || "0"} KM
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-800">
//                       <strong>Current Location:</strong>{" "}
//                       {selectedDriver.driver?.location?.latitude?.toFixed(6) || "N/A"},{" "}
//                       {selectedDriver.driver?.location?.longitude?.toFixed(6) || "N/A"}
//                     </p>
//                     <p className="text-sm text-gray-800">
//                       <strong>Last Updated:</strong>{" "}
//                       {selectedDriver.driver?.location?.timestamp
//                         ? new Date(selectedDriver.driver.location.timestamp).toLocaleTimeString()
//                         : "N/A"}
//                     </p>
//                     <p className="text-sm text-gray-800">
//                       <strong>Connection Status:</strong>{" "}
//                       <span className={wsConnected ? "text-green-600" : "text-red-600"}>
//                         {wsConnected ? "Connected" : "Disconnected"}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default CabSearch






















"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import Sidebar from "../slidebar/page"
import axios from "axios"
import { MapPin, X } from "lucide-react"
import LeafletMap from "../components/LeafletMap"
import PDFDownloadButton from "../components/PDFDownloadButton"
import baseURL from "@/utils/api"

// Create a driver location storage
const driverLocations = {}

const CabSearch = () => {
  const [cabNumber, setCabNumber] = useState("")
  const [cabDetails, setCabDetails] = useState([])
  const [filteredCabs, setFilteredCabs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [activeModal, setActiveModal] = useState("")
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [companyLogo, setCompanyLogo] = useState("")
  const [signature, setSignature] = useState("")
  const [companyInfo, setCompanyInfo] = useState("")
  const [subCompanyName, setCompanyName] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef(null)
  const adminId = useRef(`admin-${Date.now()}`)
  const [showMap, setShowMap] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [notification, setNotification] = useState("")
  const [routeCoordinates, setRouteCoordinates] = useState({})
  const [driverRoutes, setDriverRoutes] = useState({})
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentDistance, setCurrentDistance] = useState(0)
  const [remainingDistance, setRemainingDistance] = useState(0)
  const [clickedCoordinates, setClickedCoordinates] = useState(null)
  // Add state for image modal
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")

  // Track location update interval
  const locationIntervalRef = useRef(null)
  // Map reference for Leaflet
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const routeLayerRef = useRef(null)
  const routeMarkersRef = useRef([])

  // Define showNotification callback first since it's used in other functions
  const showNotification = useCallback((msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(""), 3000)
  }, [])

  // Define cleanupMap callback before it's used
  const cleanupMap = useCallback(() => {
    // Clean up Leaflet map if it exists
    if (mapRef.current && typeof mapRef.current.remove === "function") {
      mapRef.current.remove()
    }

    // Reset references
    mapRef.current = null
    markerRef.current = null

    if (routeLayerRef.current) {
      routeLayerRef.current = null
    }

    // Clear route markers
    routeMarkersRef.current = []
  }, [])

  // Define initializeMap callback before it's used in useEffect
  const initializeMap = useCallback(() => {
    if (typeof window === "undefined" || !window.L) {
      console.log("Leaflet not loaded yet")
      return
    }

    const L = window.L
    const mapContainer = document.getElementById("map-container")

    if (!mapContainer) {
      return
    }

    // Set explicit height to ensure the container is visible
    mapContainer.style.height = "100%"
    mapContainer.style.width = "100%"

    // Clean up any existing map
    cleanupMap()

    try {
      // Get the current driver's location
      const driverLocation = selectedDriver?.driver?.location

      // Check if driver's location is available
      if (!driverLocation) {
        console.error("Driver location is not available.")
        return // Exit if no location is available
      }

      // Create the map using Leaflet and zoom directly to the driver's location
      const map = L.map("map-container").setView(
        [driverLocation.latitude, driverLocation.longitude],
        15, // Zoom level to directly focus on the driver's location
      )

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Create custom marker icon for driver
      const driverIcon = L.icon({
        iconUrl: "https://maps.google.com/mapfiles/ms/micons/cabs.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })

      // Create marker for the driver's current position
      const marker = L.marker([driverLocation.latitude, driverLocation.longitude], {
        icon: driverIcon,
      }).addTo(map)

      // Add popup with driver and route information
      marker
        .bindPopup(
          `
          <div style="color: #333; padding: 8px; min-width: 200px;">
            <strong style="font-size: 14px;">${selectedDriver.driver?.name || "Driver"}</strong><br>
            <div style="margin-top: 5px;">
              <strong>Cab:</strong> ${selectedDriver.cab?.cabNumber || "N/A"}<br>
              <strong>Current Location:</strong> (${driverLocation.latitude.toFixed(6)}, ${driverLocation.longitude.toFixed(6)})<br>
            </div>
          </div>
        `,
        )
        .openPopup()

      // Save references for future use
      mapRef.current = map
      markerRef.current = marker

      // Force a resize to ensure the map renders correctly
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize()
        }
      }, 100)
    } catch (error) {
      console.error("Error initializing map:", error)
      showNotification("Error initializing map")
    }
  }, [selectedDriver, cleanupMap, showNotification])

  // Load Leaflet when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && !window.L) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)

      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.async = true
      script.onload = () => {
        setMapLoaded(true)
        console.log("Leaflet loaded successfully")
      }
      document.body.appendChild(script)
    } else if (typeof window !== "undefined" && window.L) {
      setMapLoaded(true)
    }
  }, [])

  const generateInvoiceNumber = useCallback((companyName) => {
    const prefix = derivePrefix(companyName) // e.g. "REP"
    const finYear = getFinancialYear() // e.g. "2526"
    const randomNum = Math.floor(100000 + Math.random() * 900000) // 6-digit random number
    return `${prefix}${finYear}-${randomNum}`
  }, [])

  const derivePrefix = (name) => {
    if (!name) return "INV"
    const nameParts = name.trim().split(" ")
    return nameParts
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .replace(/[^A-Z]/g, "")
      .slice(0, 3) // e.g. "REP" from "R K Enterprise"
  }

  const getFinancialYear = () => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // 0-based index, so +1
    const currentYear = now.getFullYear()

    const fyStart = currentMonth >= 4 ? currentYear : currentYear - 1
    const fyEnd = fyStart + 1

    const fyStartShort = fyStart.toString().slice(-2) // "25"
    const fyEndShort = fyEnd.toString().slice(-2) // "26"

    return `${fyStartShort}${fyEndShort}` // "2526"
  }

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const id = localStorage.getItem("id")
        const res = await axios.get(`${baseURL}api/admin/getAllSubAdmins`)
        const admin = res.data.subAdmins.find((el) => el._id === id)

        if (admin) {
          setCompanyLogo(admin.companyLogo)
          setSignature(admin.signature)
          setCompanyName(admin.name)
          setCompanyInfo(admin.companyInfo)
          setInvoiceNumber(generateInvoiceNumber(admin.name))
        }
      } catch (err) {
        console.error("Failed to fetch admin data:", err)
      }
    }

    fetchAdminData()
  }, [generateInvoiceNumber])

  useEffect(() => {
    const fetchAssignedCabs = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${baseURL}api/assigncab`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })

        setCabDetails(res.data)
        setFilteredCabs(res.data)
        // Fetch route coordinates for all cabs
        const routes = {}
        const driverRoutesMap = {}

        for (const cab of res.data) {
          if (cab.cab?.location?.from && cab.cab?.location?.to) {
            const routeData = await fetchRouteCoordinates(cab.cab.location.from, cab.cab.location.to)
            if (routeData) {
              routes[cab.cab.cabNumber] = routeData

              // Map driver ID to their assigned route
              if (cab.driver?.id) {
                driverRoutesMap[cab.driver.id] = {
                  cabNumber: cab.cab.cabNumber,
                  route: routeData,
                  from: cab.cab.location.from,
                  to: cab.cab.location.to,
                  totalDistance: cab.cab.location.totalDistance || "0",
                }
              }
            }
          }
        }

        setRouteCoordinates(routes)
        setDriverRoutes(driverRoutesMap)
      } catch (err) {
        setError("Failed to fetch assigned cabs")
        setCabDetails([])
        setFilteredCabs([])
      } finally {
        setLoading(false)
      }
    }

    fetchAssignedCabs()
  }, [])

  // Fetch route coordinates using OpenStreetMap Nominatim API
  const fetchRouteCoordinates = async (from, to) => {
    try {
      // Fetch coordinates for origin
      const fromRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(from)},India&format=json&limit=1`,
      )

      // Fetch coordinates for destination
      const toRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(to)},India&format=json&limit=1`,
      )

      if (fromRes.data.length > 0 && toRes.data.length > 0) {
        return {
          from: {
            lat: Number.parseFloat(fromRes.data[0].lat),
            lng: Number.parseFloat(fromRes.data[0].lon),
            name: from,
          },
          to: {
            lat: Number.parseFloat(toRes.data[0].lat),
            lng: Number.parseFloat(toRes.data[0].lon),
            name: to,
          },
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching route coordinates:", error)
      return null
    }
  }

  // Calculate distance between two points in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return distance
  }

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
  }

  useEffect(() => {
    if (typeof window === "undefined") return // Skip on server-side

    const connectWebSocket = () => {
      if (wsRef.current) return

      const wsUrl = "wss://api.expengo.com"
      console.log("Connecting to WebSocket:", wsUrl)
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log("WebSocket connected")
        setWsConnected(true)
        wsRef.current.send(
          JSON.stringify({
            type: "register",
            role: "admin",
            driverId: adminId.current,
          }),
        )
      }

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        setWsConnected(false)
        wsRef.current = null
        setTimeout(connectWebSocket, 5000) // Retry
      }

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected")
        setWsConnected(false)
        wsRef.current = null
        setTimeout(connectWebSocket, 5000) // Retry
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  useEffect(() => {
    if (showMap && selectedDriver && mapLoaded) {
      initializeMap()
    }
  }, [showMap, selectedDriver, mapLoaded, initializeMap])

  // Calculate position along the route based on progress
  const calculatePositionAlongRoute = (from, to, progress) => {
    const latitude = from.lat + (to.lat - from.lat) * progress
    const longitude = from.lng + (to.lng - from.lng) * progress

    return {
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    }
  }

  // Update distance calculations based on current location
  const updateDistanceCalculations = (driverId, location) => {
    const driverRoute = driverRoutes[driverId]
    if (!driverRoute || !driverRoute.route) return

    const route = driverRoute.route

    // Calculate distance traveled from origin
    const distanceFromOrigin = calculateDistance(route.from.lat, route.from.lng, location.latitude, location.longitude)

    // Calculate remaining distance to destination
    const distanceToDestination = calculateDistance(location.latitude, location.longitude, route.to.lat, route.to.lng)

    // Calculate total route distance
    const totalRouteDistance = calculateDistance(route.from.lat, route.from.lng, route.to.lat, route.to.lng)

    // Update state with the calculated distances
    setCurrentDistance(distanceFromOrigin.toFixed(2))
    setRemainingDistance(distanceToDestination.toFixed(2))

    // Update the driver's route with the new distance information
    setDriverRoutes((prev) => ({
      ...prev,
      [driverId]: {
        ...prev[driverId],
        currentDistance: distanceFromOrigin.toFixed(2),
        remainingDistance: distanceToDestination.toFixed(2),
        totalRouteDistance: totalRouteDistance.toFixed(2),
      },
    }))
  }

  // Generate driver location based on assigned route
  const getDriverLocation = (cab, driverId) => {
    // Get the driver's assigned route
    const driverRoute = driverRoutes[driverId]
    const cabNumber = cab?.cabNumber

    // First check if we have a specific route for this driver
    const route = driverRoute ? driverRoute.route : routeCoordinates[cabNumber]

    // If we don't have route data, return a default location
    if (!route) {
      return {
        latitude: 28.6139, // Default to Delhi
        longitude: 77.209,
        timestamp: new Date().toISOString(),
      }
    }

    // If we already have a stored location for this driver, use it with some movement
    if (driverLocations[driverId]) {
      const currentLoc = driverLocations[driverId]
      const fromCoords = route.from
      const toCoords = route.to

      // Find how far along the route we are (0 to 1)
      const totalDistance = Math.sqrt(
        Math.pow(toCoords.lat - fromCoords.lat, 2) + Math.pow(toCoords.lng - fromCoords.lng, 2),
      )

      const currentDistance = Math.sqrt(
        Math.pow(currentLoc.latitude - fromCoords.lat, 2) + Math.pow(currentLoc.longitude - fromCoords.lng, 2),
      )

      let progress = currentDistance / totalDistance

      // Add some small movement along the route (0.5% to 2% progress)
      progress += Math.random() * 0.015 + 0.005

      // If we've gone past the destination, reset to start
      if (progress >= 1) {
        progress = 0
      }

      // Calculate new position
      const newLocation = calculatePositionAlongRoute(fromCoords, toCoords, progress)

      // Update distance calculations for this new location
      updateDistanceCalculations(driverId, newLocation)

      return newLocation
    }

    // If no stored location, start at the origin with a small random offset
    const initialLocation = {
      latitude: route.from.lat + (Math.random() * 0.01 - 0.005),
      longitude: route.from.lng + (Math.random() * 0.01 - 0.005),
      timestamp: new Date().toISOString(),
    }

    // Initialize distance calculations
    updateDistanceCalculations(driverId, initialLocation)

    return initialLocation
  }

  // Add waypoints along the route to make it more detailed
  const addWaypointsAlongRoute = (route, map, L) => {
    if (!route || !map || !L) return

    const fromPoint = [route.from.lat, route.from.lng]
    const toPoint = [route.to.lat, route.to.lng]

    // Calculate distance between points
    const distance = Math.sqrt(Math.pow(toPoint[0] - fromPoint[0], 2) + Math.pow(toPoint[1] - fromPoint[1], 2))

    // Determine number of waypoints based on distance
    const numWaypoints = Math.min(Math.ceil(distance * 100), 10) // Max 10 waypoints

    if (numWaypoints <= 1) return // No need for waypoints if distance is small

    // Create waypoints
    for (let i = 1; i < numWaypoints; i++) {
      const progress = i / numWaypoints
      const waypointLat = fromPoint[0] + (toPoint[0] - fromPoint[0]) * progress
      const waypointLng = fromPoint[1] + (toPoint[1] - fromPoint[1]) * progress

      // Create a small marker for the waypoint with better styling
      const waypointIcon = L.divIcon({
        className: "waypoint-marker",
        html: `<div style="background-color: #FBBC05; width: 8px; height: 8px; border-radius: 50%; border: 1px solid white; box-shadow: 0 0 3px rgba(0,0,0,0.2);"></div>`,
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      })

      const waypointMarker = L.marker([waypointLat, waypointLng], {
        icon: waypointIcon,
      }).addTo(map)

      // Add tooltip with distance information
      const distanceFromStart = calculateDistance(route.from.lat, route.from.lng, waypointLat, waypointLng).toFixed(1)

      waypointMarker.bindTooltip(`${distanceFromStart} KM`, { direction: "top", opacity: 0.7 })

      // Store waypoint markers for cleanup
      routeMarkersRef.current.push(waypointMarker)
    }
  }

  // Update map marker position
  const updateMapMarker = (location) => {
    if (!markerRef.current || !mapRef.current) return

    const newPosition = [location.latitude, location.longitude]
    markerRef.current.setLatLng(newPosition)
    mapRef.current.panTo(newPosition) // Pan to the new driver location
    mapRef.current.setZoom(15) // Set zoom level to 15 for better visibility
  }

  const handleLocationClick = (item) => {
    // Make sure we have a valid driver
    if (!item.driver) {
      showNotification("⚠️ No driver information available")
      return
    }

    // Get the latest location from WebSocket if available
    const latestLocation = driverLocations[item.driver.id] || item.driver.location

    // Set the selected driver with all necessary information
    setSelectedDriver({
      driver: {
        ...item.driver,
        // Use the latest location from WebSocket or fallback to the provided location
        location: latestLocation
          ? {
              latitude: Number.parseFloat(latestLocation.latitude || 16.705),
              longitude: Number.parseFloat(latestLocation.longitude || 74.2433),
              timestamp: latestLocation.timestamp || new Date().toISOString(),
            }
          : {
              latitude: 16.705,
              longitude: 74.2433,
              timestamp: new Date().toISOString(),
            },
      },
      cab: {
        ...item.cab,
        // Ensure route information is properly formatted
        location: {
          from: item.cab?.location?.from || "Pune",
          to: item.cab?.location?.to || "Pune",
          totalDistance:
            item.cab?.location?.totalDistance ||
            calculateRouteDistance(item.cab?.location?.from, item.cab?.location?.to),
        },
      },
    })

    // Show the map modal
    setShowMap(true)
  }

  const calculateRouteDistance = (from, to) => {
    // Define some common routes and their distances
    const commonRoutes = {
      "Pune-Mumbai": 375,
      "Mumbai-Kolhapur": 375,
      "Kolhapur-Pune": 230,
      "Pune-Kolhapur": 230,
      "Mumbai-Pune": 150,
      "Pune-Mumbai": 150,
      "Mumbai-Delhi": 1400,
      "Delhi-Mumbai": 1400,
      "Kolhapur-Bangalore": 500,
      "Bangalore-Kolhapur": 500,
    }

    if (!from || !to) return "0"

    const routeKey = `${from}-${to}`
    if (commonRoutes[routeKey]) {
      return commonRoutes[routeKey].toString()
    }

    // Default distance if route not found
    return "300"
  }

  const startLocationTracking = (driver) => {
    // Clear any existing interval
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
    }

    // Immediately fetch the first location
    fetchDriverLocation(driver)

    // Then set up regular updates every 5 seconds
    locationIntervalRef.current = setInterval(() => {
      fetchDriverLocation(driver)
    }, 5000)
  }

  const fetchDriverLocation = async (driver) => {
    try {
      if (!driver.driver?.id) {
        showNotification("Driver ID not found")
        return
      }

      showNotification(`Fetching location for ${driver.driver?.name}...`)

      // Get location based on the assigned route
      const location = getDriverLocation(driver.cab, driver.driver.id)

      // Store the location
      driverLocations[driver.driver.id] = location

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const locationMessage = {
          type: "location",
          driverId: driver.driver?.id,
          role: "driver",
          location: location,
        }

        wsRef.current.send(JSON.stringify(locationMessage))

        // Also update the selected driver if this is the one being viewed
        if (selectedDriver && selectedDriver.driver?.id === driver.driver?.id) {
          setSelectedDriver((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              driver: {
                ...prev.driver,
                location: location,
              },
            }
          })

          // Update map marker if using Leaflet directly
          if (markerRef.current && mapRef.current) {
            updateMapMarker(location) // Automatically zooms in on the new location
          }
        }
      }
    } catch (error) {
      console.error("Error fetching driver location:", error)
      showNotification("Error fetching driver location")
    }
  }

  const handleSearch = () => {
    setError(null)
    if (!cabNumber) {
      setError("Please enter a cab number")
      return
    }

    const filtered = cabDetails.filter((item) => item.cab?.cabNumber?.toLowerCase().includes(cabNumber.toLowerCase()))

    setFilteredCabs(filtered)
    if (filtered.length === 0) setError("Cab details not found")
  }

  const handleDateFilter = () => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError("To date must be after From date")
      return
    }

    const filtered = cabDetails.filter((item) => {
      const assignedDate = new Date(item.assignedAt).toISOString().split("T")[0]
      const startDate = fromDate || "1970-01-01"
      const endDate = toDate || "2100-01-01"

      return assignedDate >= startDate && assignedDate <= endDate
    })

    setFilteredCabs(filtered)
    if (filtered.length === 0) setError("No cabs found in the selected date range")
  }

  const openModal = (type, data) => {
    if (!data) {
      console.error(`No data found for type: ${type}`)
      return
    }
    setSelectedDetail({ type, data })
    setActiveModal("Details")
  }

  const closeModal = () => {
    setActiveModal("")
    setSelectedDetail(null)
  }

  // Open image modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl)
    setImageModalOpen(true)
  }

  // Close image modal
  const closeImageModal = () => {
    setSelectedImage("")
    setImageModalOpen(false)
  }

  // Helper function to display images in a gallery format
  const renderImageGallery = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return (
        <p className="text-gray-400 bg-gradient-to-b bg-black/50 to-transparent backdrop-blur-md">
          No images available
        </p>
      )
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {images.map((image, index) => (
          <div key={index} onClick={() => openImageModal(image)} className="cursor-pointer">
            <img
              src={image || "/placeholder.svg"}
              alt={`Image ${index + 1}`}
              className="w-24 h-24 object-cover rounded border border-gray-600 hover:border-blue-500 transition-all"
            />
          </div>
        ))}
      </div>
    )
  }

  // Helper function to calculate and display total amount
  const renderAmountTotal = (amounts) => {
    if (!amounts || !Array.isArray(amounts)) {
      return null
    }

    // Filter out null values and calculate total
    const validAmounts = amounts.filter((amount) => amount !== null)
    const total = validAmounts.reduce((sum, amount) => sum + Number(amount), 0)

    return (
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount:</span>
          <span className="text-lg font-bold text-green-400">₹{total.toLocaleString()}</span>
        </div>
      </div>
    )
  }

  // Format date and time for display
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A"

    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  // Function to render the appropriate content based on detail type
  const renderDetailContent = () => {
    if (!selectedDetail || !selectedDetail.type || !selectedDetail.data) {
      return <p>No details available</p>
    }

    const { type, data } = selectedDetail

    switch (type) {
      case "fuel":
        return (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Payment Details</h3>
              <p>
                <span className="text-gray-400">Payment Type:</span> {data.type || "N/A"}
              </p>

              {data.receiptImage && Array.isArray(data.receiptImage) && data.receiptImage.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mt-4 mb-2">Fuel Receipts</h3>
                  {renderImageGallery(data.receiptImage)}
                </>
              )}

              {data.transactionImage && Array.isArray(data.transactionImage) && data.transactionImage.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mt-4 mb-2">Transaction Images</h3>
                  {renderImageGallery(data.transactionImage)}
                </>
              )}

              {data.amount && renderAmountTotal(data.amount)}
            </div>
          </>
        )

      case "fastTag":
        return (
          <>
            <div className="mb-4">
              <p>
                <span className="text-gray-400">Payment Mode:</span> {data.paymentMode || "N/A"}
              </p>
              {data.amount && renderAmountTotal(data.amount)}
            </div>
          </>
        )

      case "tyrePuncture":
        return (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Repair Details</h3>
              {data.image && Array.isArray(data.image) && data.image.length > 0 && renderImageGallery(data.image)}
              {data.repairAmount && renderAmountTotal(data.repairAmount)}
            </div>
          </>
        )

      case "vehicleServicing":
        return (
          <>
            <div className="mb-4">
              <p>
                <span className="text-gray-400">Required Service:</span> {data.requiredService ? "Yes" : "No"}
              </p>
              <p>
                <span className="text-gray-400">Details:</span> {data.details || "N/A"}
              </p>

              {/* Service Images */}
              {data.image && Array.isArray(data.image) && data.image.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-4 mb-2">OdoMeter Images</h3>
                  {renderImageGallery(data.image)}
                </>
              )}

              {/* Receipt Images */}
              {data.receiptImage && Array.isArray(data.receiptImage) && data.receiptImage.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-4 mb-2">Vehicle Receipt Images</h3>
                  {renderImageGallery(data.receiptImage)}
                </>
              )}

              {/* Total Service Amount */}
              {data.amount && Array.isArray(data.amount) && data.amount.length > 0 && (
                <p>
                  <span className="text-gray-400">Total Amount:</span> ₹
                  {data.amount.reduce((acc, curr) => acc + Number(curr || 0), 0)}
                </p>
              )}
            </div>
          </>
        )

      case "otherProblems":
        return (
          <>
            <div className="mb-4">
              <p>
                <span className="text-gray-400">Details:</span> {data.details || "N/A"}
              </p>

              {data.image && Array.isArray(data.image) && data.image.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mt-4 mb-2">Problem Images</h3>
                  {renderImageGallery(data.image)}
                </>
              )}

              {data.amount && renderAmountTotal(data.amount)}
            </div>
          </>
        )
      default:
        return <p>No specific details available for this type</p>
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 md:ml-60 mt-20 sm:mt-0 text-white transition-all duration-300">
        {notification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-md shadow-lg transition-all duration-300 animate-fadeIn">
              {notification}
            </div>
          </div>
        )}

        <h1 className="text-xl md:text-2xl font-bold mb-4">Cab Search</h1>

        {/* WebSocket Connection Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`h-3 w-3 rounded-full ${wsConnected ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="text-sm">{wsConnected ? "WebSocket Connected" : "WebSocket Disconnected"}</span>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          {/* Search by Cab Number */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter Cab Number"
              value={cabNumber}
              onChange={(e) => setCabNumber(e.target.value)}
              className="border p-2 rounded w-full bg-gray-700 text-white"
            />
            <button
              onClick={handleSearch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded whitespace-nowrap transition-colors"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Filter by Date */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border p-2 rounded bg-gray-700 text-white w-full"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border p-2 rounded bg-gray-700 text-white w-full"
              />
            </div>
            <button
              onClick={handleDateFilter}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded whitespace-nowrap transition-colors"
            >
              Filter by Date
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Loading State */}
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-700 h-16 rounded-md"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-gray-700 shadow-lg rounded-lg overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Cab No</th>
                    <th className="p-3 text-left">Driver</th>
                    <th className="p-3 text-left">Assigned Date</th>
                    <th className="p-3 text-left">Route</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Details</th>
                    <th className="p-3 text-left">Location</th>
                    <th className="p-2">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCabs.length > 0 ? (
                    filteredCabs.map((item, index) => (
                      <tr key={index} className="border-b border-gray-600 hover:bg-gray-600 transition-colors">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">{item.cab?.cabNumber || "N/A"}</td>
                        <td className="p-3">{item.driver?.name || "N/A"}</td>
                        <td className="p-3">
                          {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-3">
                          {item.cab?.location?.from || "N/A"} → {item.cab?.location?.to || "N/A"}
                        </td>
                        <td
                          className={`p-3 ${
                            item?.status === "assigned"
                              ? "text-red-500 border-white"
                              : item?.status === "completed"
                                ? "text-green-500 border-white"
                                : "text-green-500 border-white"
                          }`}
                        >
                          {item?.status}
                        </td>
                        <td className="p-3">
                          <select
                            className="border p-1 rounded bg-gray-800 text-white"
                            onChange={(e) => e.target.value && openModal(e.target.value, item.cab[e.target.value])}
                          >
                            <option value="">Select</option>
                            <option value="fuel">Fuel</option>
                            <option value="fastTag">FastTag</option>
                            <option value="tyrePuncture">Tyre</option>
                            <option value="vehicleServicing">Servicing</option>
                            <option value="otherProblems">Other Problems</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              className={`text-green-400 transition-all duration-300 hover:scale-110 hover:shadow-md ${
                                item.driver?.location ? "animate-pulse" : ""
                              }`}
                              onClick={() => handleLocationClick(item)}
                              title="Track Location"
                              disabled={!wsConnected}
                            >
                              <MapPin size={16} />
                            </button>
                            {item.driver?.location && <span className="text-xs text-green-400">Live</span>}
                          </div>
                        </td>
                        <td className="p-2">
                          <PDFDownloadButton
                            trip={item}
                            cabData={item.cab}
                            companyLogo={companyLogo}
                            signature={signature}
                            companyPrefix={derivePrefix(subCompanyName)}
                            companyInfo={companyInfo}
                            companyName={subCompanyName}
                            invoiceNumber={
                              invoiceNumber ||
                              `${derivePrefix(subCompanyName)}-${String(item.invoiceSerial || Math.floor(Math.random() * 10000)).padStart(5, "0")}`
                            }
                            invoiceDate={new Date().toLocaleDateString("en-IN")}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="p-4 text-center">
                        No results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredCabs.length > 0 ? (
                filteredCabs.map((item, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg shadow">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-gray-400 text-sm">Cab No</p>
                        <p className="font-medium">{item.cab?.cabNumber || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Driver</p>
                        <p>{item.driver?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Assigned Date</p>
                        <p>{item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Distance</p>
                        <p>{item.cab?.location?.totalDistance || "0"} KM</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-gray-400 text-sm">Route</p>
                      <p>
                        {item.cab?.location?.from || "N/A"} → {item.cab?.location?.to || "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <select
                        className="w-full border p-2 rounded bg-gray-800 text-white"
                        onChange={(e) => e.target.value && openModal(e.target.value, item.cab[e.target.value])}
                      >
                        <option value="">View Details</option>
                        <option value="fuel">Fuel Details</option>
                        <option value="fastTag">FastTag Details</option>
                        <option value="tyrePuncture">Tyre Details</option>
                        <option value="vehicleServicing">Servicing Details</option>
                        <option value="otherProblems">Other Problems</option>
                      </select>
                      <button
                        className={`text-green-400 p-2 rounded border border-gray-600 ${
                          item.driver?.location ? "animate-pulse" : ""
                        }`}
                        onClick={() => handleLocationClick(item)}
                        title="Track Location"
                        disabled={!wsConnected}
                      >
                        <MapPin size={16} />
                      </button>
                    </div>
                    <PDFDownloadButton
                      trip={item}
                      cabData={item.cab}
                      companyLogo={companyLogo}
                      signature={signature}
                      companyPrefix={derivePrefix(subCompanyName)}
                      companyInfo={companyInfo}
                      companyName={subCompanyName}
                      invoiceNumber={
                        invoiceNumber ||
                        `${derivePrefix(subCompanyName)}-${String(item.invoiceSerial || Math.floor(Math.random() * 10000)).padStart(5, "0")}`
                      }
                      invoiceDate={new Date().toLocaleDateString("en-IN")}
                    />
                  </div>
                ))
              ) : (
                <div className="p-4 text-center bg-gray-700 rounded-lg">No results found</div>
              )}
            </div>
          </>
        )}

        {/* Details Modal */}
        {activeModal && selectedDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold capitalize">{selectedDetail.type} Details</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {renderDetailContent()}

              <button
                onClick={closeModal}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {imageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-4 max-w-2xl w-full shadow-[0_0_25px_10px_rgba(255,255,255,0.5)]">
              <div className="flex justify-end mb-3">
                <button onClick={closeImageModal} className="text-white-500 hover:text-red-700 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              </div>
            </div>
          </div>
        )}

        {/* Map Modal */}
        {showMap && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedDriver.driver?.name || "Driver"} - {selectedDriver.cab?.cabNumber || "N/A"}
                </h2>
                <button onClick={() => setShowMap(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              {/* Route information panel */}
              <div className="bg-gray-100 p-3 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">From: {selectedDriver.cab?.location?.from || "N/A"}</p>
                  </div>
                </div>
                <div className="h-6 border-l-2 border-dashed border-gray-400 ml-1.5"></div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">To: {selectedDriver.cab?.location?.to || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1" style={{ height: "500px" }}>
                <LeafletMap
                  location={selectedDriver.driver?.location}
                  driverName={selectedDriver.driver?.name}
                  cabNumber={selectedDriver.cab?.cabNumber}
                  routeFrom={selectedDriver.cab?.location?.from}
                  routeTo={selectedDriver.cab?.location?.to}
                  onMapReady={(map) => {
                    console.log("Map is ready", map)
                    // Force a resize to ensure the map renders correctly
                    setTimeout(() => {
                      if (map) {
                        map.panTo({
                          lat: Number.parseFloat(selectedDriver.driver?.location?.latitude) || 16.705,
                          lng: Number.parseFloat(selectedDriver.driver?.location?.longitude) || 74.2433,
                        })
                      }
                    }, 100)
                  }}
                />
              </div>

              <div className="p-4 bg-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Driver: {selectedDriver.driver?.name || "N/A"}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      Cab Number: {selectedDriver.cab?.cabNumber || "N/A"}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      Distance:{" "}
                      {selectedDriver.cab?.location?.totalDistance ||
                        driverRoutes[selectedDriver.driver?.id]?.totalDistance ||
                        "0"}{" "}
                      KM
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      <strong>Current Location:</strong>{" "}
                      {selectedDriver.driver?.location?.latitude?.toFixed(6) || "N/A"},{" "}
                      {selectedDriver.driver?.location?.longitude?.toFixed(6) || "N/A"}
                    </p>
                    <p className="text-sm text-gray-800">
                      <strong>Last Updated:</strong>{" "}
                      {selectedDriver.driver?.location?.timestamp
                        ? new Date(selectedDriver.driver.location.timestamp).toLocaleTimeString()
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-800">
                      <strong>Connection Status:</strong>{" "}
                      <span className={wsConnected ? "text-green-600" : "text-red-600"}>
                        {wsConnected ? "Connected" : "Disconnected"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CabSearch
