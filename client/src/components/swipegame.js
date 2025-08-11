import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useSwipeable } from "react-swipeable";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3002");

export const SwipeGame = () => {
  const [swipeData, setSwipeData] = useState([]);
  const [currentPlace, setCurrentPlace] = useState(0);
  const [inLobby, setInLobby] = useState(false);
  const [lobbyID, setLobbyID] = useState("");
  const [swipeDirection, setSwipeDirection] = useState(""); // for animation
  const userID = localStorage.getItem("userID");
  const [winner, setWinner] = useState("");

  useEffect(() => {
    const fetchSwipeData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/location/${userID}`);
        setSwipeData(response.data.guestplaces);
      } catch (error) {
        console.error("Error fetching swipe data:", error);
      }
    };

    fetchSwipeData();

    socket.on("connect", () => {
      console.log("Connected to backend with id:", socket.id);
    });

    socket.on("lobbyError", (message) => {
      alert(message);
    });

    socket.on("system", (data) => {
      setSwipeData(data);
      setInLobby(true);
    });

    socket.on("lobbyCreated", () => {
      setInLobby(true);
    });

    socket.on("swipeResult", (data) => {
      if (data.winner) setWinner(data.winner);
    });

    return () => {
      socket.off("connect");
      socket.off("lobbyError");
      socket.off("system");
      socket.off("lobbyCreated");
      socket.off("swipeResult");
    };
  }, []);

  const joinLobby = (action) => {
    if (!lobbyID) {
      alert("Please enter a lobby ID");
      return;
    }
    if (action === "join") {
      socket.emit("joinLobby", lobbyID);
    } else if (action === "create") {
      socket.emit("createLobby", lobbyID, swipeData);
    }
  };

  // Animate card on swipe
  const animateSwipe = (direction) => {
    setSwipeDirection(direction);
    setTimeout(() => {
      setSwipeDirection("");
      setCurrentPlace((prev) => (prev + 1) % swipeData.length);
    }, 300); // match transition duration
  };

  const handleSwipe = (direction) => {
    if (swipeData.length === 0) return;
    const yes = direction === "yes";
    const restaurant = swipeData[currentPlace];
    socket.emit("swipe", yes, restaurant, lobbyID);
    animateSwipe(direction);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("no"),
    onSwipedRight: () => handleSwipe("yes"),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const resetGame = () => {
    setCurrentPlace(0);
    setInLobby(false);
    setLobbyID("");
    setSwipeDirection("");
    setWinner("");
  };


  if (!inLobby) {
    return (
      <div className="lobby-section">
        <input
          className="lobby-id"
          type="text"
          placeholder="Enter Lobby ID"
          value={lobbyID}
          onChange={(e) => setLobbyID(e.target.value)}
        />
        <button className="make-lobby" onClick={() => joinLobby("create")}>Create Lobby</button>
        <button className="join-lobby" onClick={() => joinLobby("join")}>Join Lobby</button>
      </div>
    );
  }

  if (winner) {
    return (
      <div className="swipe-game">
        <div className="swipe-card">
          {winner.restaurant?.photos?.[0]?.photo_reference && (
            <img
              className="swipe-data-image"
              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${winner.restaurant.photos[0].photo_reference}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`}
              alt={winner.restaurant?.name}
            />
          )}
          <div className="swipe-card-content">
            <h1 className="swipe-data-title">{winner.restaurant?.name}</h1>
            <div className="swipe-buttons-container">
              <button className="swipe-data-yes" onClick={resetGame}>Exit</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card swipe animation styles
  let cardStyle = {};
  if (swipeDirection === "yes") {
    cardStyle = { transform: "translateX(400px) rotate(15deg)", transition: "transform 0.3s" };
  } else if (swipeDirection === "no") {
    cardStyle = { transform: "translateX(-400px) rotate(-15deg)", transition: "transform 0.3s" };
  }

  return (
    <div className="swipe-game">
      <div
        className="swipe-card"
        {...swipeHandlers}
        style={cardStyle}
      >
        {swipeData[currentPlace]?.photos?.[0]?.photo_reference && (
          <img
            className="swipe-data-image"
            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${swipeData[currentPlace].photos[0].photo_reference}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`}
            alt={swipeData[currentPlace]?.name}
          />
        )}
        <div className="swipe-card-content">
          <h1 className="swipe-data-title">{swipeData[currentPlace]?.name}</h1>
          <div className="swipe-progress">
            {swipeData.length > 0 && (
              <span>
                {currentPlace + 1} / {swipeData.length}
              </span>
            )}
          </div>
          <div style={{ marginTop: "10px", color: "#ffb056", fontWeight: "bold" }}>
            <span>Swipe right for Yes, left for No</span>
          </div>
        </div>
      </div>
    </div>
  );
};
