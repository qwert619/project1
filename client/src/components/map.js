import React, { useRef, useEffect, useCallback, useState } from "react";

import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";

const mapStyles = {
    height: "60vh",
    width: "80vw",
    position: "relative",
    borderRadius: "15px",
    margin: "0 auto"
};






export const Map = () => {

    
    const [places, setPlaces] = useState([]);
    const [center, setCenter] = useState(null);
    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        places.forEach(place => {
            console.log("Place:", place.displayName);
        });
    }

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userCenter = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCenter(userCenter);
                    console.log("Got user location:", userCenter);
                },
                (error) => {
                    console.error("Error getting user location:", error);
                    setCenter({ lat: 33.4604, lng: -88.8184 });
                }
            );
        } else {
            setCenter({ lat: 33.4604, lng: -88.8184 });
        }
    }, []);


    const getPlaces = useCallback(async () => {
        if (!window.google || !window.google.maps || !window.google.maps.importLibrary) {
            console.log('Google Maps not loaded yet');
            return;
        }

        if (!center) {
            console.log('No center location');
            return;
        }

        try {
            const { Place } = await window.google.maps.importLibrary("places");
            
            const request = {
                fields: ['displayName', 'location', 'businessStatus'],
                locationRestriction: {
                    center: center,
                    radius: 3000,
                },
                includedTypes: ['restaurant']
            };

            const { places: foundPlaces } = await Place.searchNearby(request);
            setPlaces(foundPlaces || []);
            
        } catch (error) {
            console.error('Error with Places API:', error);
        }
    }, [center]);

    const onPlaceChanged = async () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
            const location = place.geometry.location;
            const newLocation = { lat: location.lat(), lng: location.lng() };
            setCenter(newLocation);
        }
    };

    const onLoad = useCallback((mapInstance) => {
        console.log('Map loaded successfully!');
        mapRef.current = mapInstance;
        getPlaces();
    }, [getPlaces]);


    useEffect(() => {
        if (center) {
            getPlaces();
        }
    }, [center, getPlaces]);

    return (
        <div className="map-container">
                <GoogleMap
                    mapContainerStyle={mapStyles}
                    zoom={15}
                    center={center}
                    onLoad={onLoad}
                >
                    {center && (
                        <Marker
                            position={center}
                            title="Your Location"
                            icon={{ url: "http://maps.google.com/mapfiles/ms/icons/pink-dot.png" }}
                        />
                    )}

                    {places && places.map((place, index) => (
                        <Marker
                            key={index}
                            position={{
                                lat: place.location.lat(),
                                lng: place.location.lng(),
                            }}
                            title={place.displayName}
                        />
                    ))}

                    <div style={{ display: "flex" }}>
                        <Autocomplete
                            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                            onPlaceChanged={onPlaceChanged}
                        >
                            <input
                                type="text"
                                placeholder="Enter a location"
                                style={{
                                    color: "black",
                                    boxSizing: "border-box",
                                    border: "1px solid transparent",
                                    width: "240px",
                                    height: "40px",
                                    padding: "0 12px",
                                    marginTop: "10px",
                                    position: "absolute",
                                    top: "10px",
                                    left: "50%",
                                    marginLeft: "-120px",
                                    zIndex: "10",
                                }}
                            />
                        </Autocomplete>
                        
                        {(
                            <button 
                                className="search-button" 
                                onClick={handleSubmit}
                                style={{
                                    position: "absolute",
                                    top: "20px",
                                    right: "20px",
                                    backgroundColor: "#FD7902",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    height: "40px",
                                    width: "100px",
                                    zIndex: "10",
                                    fontWeight: "bold"
                                }}
                            >
                                Save ({places.length})
                            </button>
                        )}
                    </div>
                </GoogleMap>
        </div>
    );
};

export default Map;