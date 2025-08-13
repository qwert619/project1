import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Card from "./Card";

const socket = io("http://localhost:3002", {
  query: {
    name: localStorage.getItem("username")
  }
});

export const SwipeGame = () => {
  const [swipeData, setSwipeData] = useState([]);
  const [currentPlace, setCurrentPlace] = useState(0);
  const [outLobby, setOutLobby] = useState(true);
  const [lobbyID, setLobbyID] = useState("");
  const [winner, setWinner] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [hosting, setHosting] = useState(false);
  const cardRef = useRef(null);

  const userID = localStorage.getItem("userID");

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
      setSwipeData(data.restaurants);
      setLobbyPlayers(data.members);
      setOutLobby(false);
      setWaiting(true);
    });

    socket.on("lobbyCreated", (data) => {
      setLobbyPlayers(data);
      setOutLobby(false);
      setHosting(true);
    });

    socket.on("swipeResult", (data) => {
      if (data.winner) setWinner(data.winner);
    });

    socket.on("startGame", () => {
      setWaiting(false);
    });

    return () => {
      socket.off("startGame");
      socket.off("connect");
      socket.off("lobbyError");
      socket.off("system");
      socket.off("lobbyCreated");
      socket.off("swipeResult");
    };
  }, [userID]);

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

  const startGame = () => {
    setHosting(false);
    socket.emit("startGame", lobbyID);
  };

  // Called by Card when a swipe is completed
  const handleSwipe = (direction) => {
    if (swipeData.length === 0) return;
    const yes = direction === "yes";
    const restaurant = swipeData[currentPlace];
    socket.emit("swipe", yes, restaurant, lobbyID);
    setCurrentPlace((prev) => (prev + 1) % swipeData.length);
  };

  const resetGame = () => {
    setCurrentPlace(0);
    setOutLobby(true);
    setLobbyID("");
    setWinner("");
    setWaiting(false);
    setHosting(false);
  };

  if (outLobby) {
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

  if (hosting || waiting) {
    return (
      <div className="lobby-section">
        <h1>Players in Lobby:</h1>
        <ul>
          {lobbyPlayers.map((player, idx) => (
            <li key={idx}>{player}</li>
          ))}
        </ul>
        {hosting ? (
          <button className="start-game" onClick={startGame}>Start Game</button>
        ) : (
          <button className="start-game" disabled>Waiting on Host</button>
        )}
      </div>
    );
  }

  if (winner) {
    return (
      <div className="swipe-game">
        <div className="swipe-stack">
          <div
            className="swipe-card liked"
          >
            {winner.restaurant?.photos?.[0]?.photo_reference && (
              <img
                className="swipe-data-image"
                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${winner.restaurant.photos[0].photo_reference}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`}
                alt={winner.restaurant?.name}
              />
            )}
            <div className="swipe-card-content">
              <h1 className="swipe-data-title">{winner.restaurant?.name}</h1>
              <button className="swipe-data-yes" onClick={resetGame}>Exit</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-game">
      <div className="swipe-stack">
        {/* Top card (current) */}
        {swipeData[currentPlace] && (
          <Card
            key={swipeData[currentPlace].place_id}
            restaurant={swipeData[currentPlace]}
            progress={`${currentPlace + 1} / ${swipeData.length}`}
            onSwipe={handleSwipe}
            cardRef={cardRef}
            isBackground={false}
          />
        )}
        
        {/* Second card (behind) */}
        {swipeData[currentPlace + 1] && (
          <Card
            key={swipeData[currentPlace + 1].place_id}
            restaurant={swipeData[currentPlace + 1]}
            progress={`${currentPlace + 2} / ${swipeData.length}`}
            onSwipe={() => {}} // No swipe for background card
            cardRef={null}
            isBackground={true}
          />
        )}
      </div>
    </div>
  );

};
