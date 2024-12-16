import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import leaflet CSS
import './MapComponent.css'; // Ensure you have this custom CSS


const MapComponent = () => {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);

    // Coordinates for Lucky Impex location (Birgunj, Link Road)
    const luckyImpexLocation = [27.0138, 84.8816];

    // Custom marker icon for Lucky Impex
    const luckyImpexIcon = new L.Icon({
        iconUrl: 'lucky-logo.png', // Custom image URL for the icon (replace with your desired icon)
        iconSize: [40, 40], // Size of the marker icon
        iconAnchor: [20, 40], // Anchor the icon to its center bottom
        popupAnchor: [0, -40], // Popup position
    });

    // Fetch user's geolocation
    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                },
                (error) => {
                    console.error('Error fetching user location', error);
                }
            );
        }
    };

    // Fetch address using reverse geocoding
    const fetchAddress = (location) => {
        const [lat, lng] = location;
        const geocodeAPI = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

        fetch(geocodeAPI)
            .then((response) => response.json())
            .then((data) => {
                setAddress(data.display_name); // Update the address
                setLoading(false); // Stop loading
            })
            .catch((error) => {
                console.error('Error fetching address:', error);
                setLoading(false);
            });
    };

    // Initialize map when the component mounts
    useEffect(() => {
        fetchAddress(luckyImpexLocation); // Fetch address for Lucky Impex location
        getUserLocation(); // Fetch user's location
    }, []);

    // Function to adjust the map zoom level and center on user location
    const MapUpdater = () => {
        const map = useMap();
        if (userLocation) {
            map.setView(userLocation, 12); // Zoom and center map on user location
        }
        return null;
    };

    return (
        <div className="map-container">
            <h2>Lucky Impex Location</h2>
            <h4>{loading ? 'Loading location data...' : `Address: ${address}`}</h4>

            {/* MapContainer with responsive styling */}
            <MapContainer
                center={luckyImpexLocation}
                zoom={16}
                style={{ height: '200px', width: '100%' }}
            >
                {/* Use custom tile layer from OpenStreetMap */}
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Custom Marker for Lucky Impex with image icon */}
                <Marker position={luckyImpexLocation} icon={luckyImpexIcon}>
                    <Popup>Lucky Impex, Link Road, Birgunj 44300, Nepal</Popup>
                </Marker>

                {/* MapUpdater component will center the map on the user's location */}
                <MapUpdater />

                {/* Optionally, you could add the user's location marker */}
                {userLocation && (
                    <Marker position={userLocation}>
                        <Popup>Your current location</Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Button to zoom to user location */}
            {userLocation && (
                <button className="zoom-btn" onClick={() => window.location.reload()}>
                    Zoom to User Location
                </button>
            )}
        </div>
    );
};

export default MapComponent;
