import axios from "axios";
import { useState, useEffect} from "react";


export const SwipeGame = () => {
    const [swipeData, setSwipeData] = useState([]);
    const [currentPlace, setCurrentPlace] = useState(0);
    //const [loading, setLoading] = useState(true);
    const userID = window.localStorage.getItem("userID");
    useEffect(() => {
        const fetchSwipeData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/location/${userID}`);
                setSwipeData(response.data.guestplaces);
                console.log(response.data.message);
            } catch (error) {
                console.error("Error fetching swipe data:", error);
            }
        };

        fetchSwipeData();
    }, []);

    const getPhotoUrl = (photoReference) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
}

    const handleSwipe = (direction) => {
        if (direction === "yes") {
            console.log("Swiped right on:", swipeData[currentPlace]?.name);
        } else {
            console.log("Swiped left on:", swipeData[currentPlace]?.name);
        }
        setCurrentPlace((prev) => (prev + 1) % swipeData.length);
    };


return (
    <div className="swipe-game">
      <div className="swipe-card">
        {swipeData[currentPlace]?.photos && swipeData[currentPlace]?.photos[0]?.photo_reference && (
          <img
            className="swipe-data-image"
            src={getPhotoUrl(swipeData[currentPlace].photos[0].photo_reference)}
            alt={swipeData[currentPlace]?.name}
          />
        )}
        <div className="swipe-card-content">
          <h1 className="swipe-data-title">{swipeData[currentPlace]?.name}</h1>
          <div className="swipe-buttons-container">
          <button className="swipe-data-no" onClick={() => handleSwipe("no")}>No</button>
          <button className="swipe-data-yes" onClick={() => handleSwipe("yes")}>Yes</button>
          </div>
          {/* Add your swipe game logic here */}
        </div>
      </div>
    </div>
);
};


