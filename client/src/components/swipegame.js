import axios from "axios";
import { useState, useEffect} from "react";


export const SwipeGame = () => {
    const [swipeData, setSwipeData] = useState([]);
    const [currentPlace, setCurrentPlace] = useState(0);
    const [loading, setLoading] = useState(true);
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

    const handleSwipe = (direction) => {
        if (direction === "yes") {
            console.log("Swiped right on:", swipeData[currentPlace]?.displayName);
        } else {
            console.log("Swiped left on:", swipeData[currentPlace]?.displayName);
        }
        setCurrentPlace((prev) => (prev + 1) % swipeData.length);
    };


return (
        <div className="swipe-game">
            <h1 className="swipe-data-title">{swipeData[currentPlace]?.displayName}</h1>
            <button className="swipe-data-no" onClick={() => handleSwipe("no")}>No</button>
            <button className="swipe-data-yes" onClick={() => handleSwipe("yes")}>Yes</button>
            {/* Add your swipe game logic here */}
        </div>
    );
};


