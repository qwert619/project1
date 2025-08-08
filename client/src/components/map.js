import React, { useRef, useEffect, useCallback, useState} from "react";
import axios from "axios";
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";

const mapStyles = {
    height: "60vh",
    width: "80vw",
    position: "relative",
    borderRadius: "15px",
    margin: "0 auto"
};






export const MapComponent = () => {

    const userID = window.localStorage.getItem("userID");
    const [loading, setLoading] = useState(false);
    const [places, setPlaces] = useState([]);
    const [center, setCenter] = useState(null);
    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);



    const handleSubmit = async (e) => {
    e.preventDefault();
        try {
            
            const filtered = places.filter(p => p !== null && p.businessStatus === "OPERATIONAL");
            console.log("UserID:", userID);
            console.log("Filtered places:", filtered);
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/users/location`, { places: filtered, userID });
            console.log(response.data);
        }catch (error) {
            console.error("Error saving places:", error);
        }


        /*
  if (!places.length) return;

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google API key missing");
    return;
  }

  // Helper to fetch details from REST API
  const fetchDetailsREST = async (placeId) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,business_status,formatted_phone_number,regularOpeningHours,website,rating,price_level,photos,url&key=${apiKey}`;

      const response = await axios.get(url);
      if (response.data.status === "OK") {
        return response.data.result;
      } else {
        console.warn(`Place details fetch failed for ${placeId}:`, response.data.status);
        return null;
      }
    } catch (error) {
      console.error("REST API fetch error for placeId:", placeId, error);
      return null;
    }
  };

  // Fetch details for all places in parallel
  const allDetails = await Promise.all(places.map(p => fetchDetailsREST(p.place_id || p.id)));

  const filtered = allDetails.filter(p => p !== null && p.business_status === "OPERATIONAL");

  setPlacesDetails(filtered);

  try {
    console.log("Saving places:", filtered);
    const response = await axios.put(`${process.env.REACT_APP_API_URL}/users/location`, {
      places: filtered,
      userID
    });
    console.log("Saved successfully:", response.data);
  } catch (error) {
    console.error("Error saving places:", error);
  } */
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
    setLoading(true);
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

    const radius = 1500;
    const offsetMeters = 1200;
    const offsetLat = offsetMeters / 111320;
    const offsetLng = offsetMeters / (111320 * Math.cos(center.lat * (Math.PI / 180)));

    const offsets = [
      { lat: 0, lng: 0 },
      { lat: offsetLat, lng: 0 },
      { lat: -offsetLat, lng: 0 },
      { lat: 0, lng: offsetLng },
      { lat: 0, lng: -offsetLng },
      { lat: offsetLat, lng: offsetLng },
      { lat: offsetLat, lng: -offsetLng },
      { lat: -offsetLat, lng: offsetLng },
      { lat: -offsetLat, lng: -offsetLng },
    ];

    const allPlacesMap = new Map();

    for (const offset of offsets) {
      const tileCenter = {
        lat: center.lat + offset.lat,
        lng: center.lng + offset.lng,
      };

      const request = {
        fields: ['id', 'displayName', 'location', 'businessStatus'],
        locationRestriction: {
          center: tileCenter,
          radius: radius,
        },
        includedTypes: ['restaurant'],
        // omit fields to get all default info
      };

      const { places: tilePlaces } = await Place.searchNearby(request);

      if (tilePlaces && tilePlaces.length) {
        for (const place of tilePlaces) {
          // Use a unique key - try 'id' or fallback to displayName+coords
          const uniqueKey = place.id ?? `${place.displayName}-${place.location.lat}-${place.location.lng}`;

          if (!allPlacesMap.has(uniqueKey)) {
            allPlacesMap.set(uniqueKey, place);
          }
        }
      }

      await new Promise(res => setTimeout(res, 200));
    }

        setPlaces(Array.from(allPlacesMap.values()));
  } catch (error) {
    console.error('Error with Places API:', error);
  } finally {
    setLoading(false);
  }
}, [center]);

useEffect(() => {
    if (center) {
        getPlaces();
    }
}, [center, getPlaces]);

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
                            <button 
                                disabled={loading}
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
                                    width: "120px",
                                    zIndex: "10",
                                    fontWeight: "bold"
                                }}
                            >
                                {loading ? "Loading..." : `Save Restaurants`}
                            </button>
                    </div>
                </GoogleMap>
        </div>
    );
};

export default MapComponent;