import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import leaflet CSS
import './MapComponent.css'; // Ensure you have this custom CSS

const MapComponent = ({ position }) => {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);

    // Coordinates for Lucky Impex location
    const luckyImpexLocation = position;

    // Custom marker icon for Lucky Impex
    const luckyImpexIcon = new L.Icon({
        iconUrl: 'lucky-logo.png', // Custom image URL for the icon (replace with your desired icon)
        iconSize: [40, 40], // Size of the marker icon
        iconAnchor: [20, 40], // Anchor the icon to its center bottom
        popupAnchor: [0, -40], // Popup position
    });



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

    useEffect(() => {
        fetchAddress(luckyImpexLocation); // Fetch address for Lucky Impex location

    }, [luckyImpexLocation]);



    return (
        <div className="map-container">

            <h4>{loading ? 'Loading location data...' : `Address: ${address}`}</h4>

            <MapContainer
                center={luckyImpexLocation}
                zoom={16}
                style={{ height: '200px', width: '90%' }}
            >
                {/* Use custom tile layer from OpenStreetMap */}
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Custom Marker for Lucky Impex with image icon */}
                <Marker position={luckyImpexLocation} icon={luckyImpexIcon}>
                    <Popup>{address}</Popup>
                </Marker>




            </MapContainer>
        </div>
    );
};

export default MapComponent;
