import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

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
  const [drag, setDrag] = useState({ x: 0, y: 0, isDragging: false });
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

  // Drag/swipe logic
  const handleDragStart = (e) => {
    setDrag({
      ...drag,
      isDragging: true,
      startX: e.type === "touchstart" ? e.touches[0].clientX : e.clientX,
      startY: e.type === "touchstart" ? e.touches[0].clientY : e.clientY,
    });
  };

  const handleDragMove = (e) => {
    if (!drag.isDragging) return;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    setDrag({
      ...drag,
      x: clientX - drag.startX,
      y: clientY - drag.startY,
    });
  };

  const handleDragEnd = () => {
    if (!drag.isDragging) return;
    let direction = "";
    if (drag.x > 120) direction = "yes";
    else if (drag.x < -120) direction = "no";

    if (direction) {
      handleSwipe(direction);
    } else {
      setDrag({ x: 0, y: 0, isDragging: false });
    }
  };

  const handleSwipe = (direction) => {
    if (swipeData.length === 0) return;
    const yes = direction === "yes";
    const restaurant = swipeData[currentPlace];
    socket.emit("swipe", yes, restaurant, lobbyID);
    setDrag({ x: 0, y: 0, isDragging: false });
    setCurrentPlace((prev) => (prev + 1) % swipeData.length);
  };

  const resetGame = () => {
    setCurrentPlace(0);
    setOutLobby(true);
    setLobbyID("");
    setWinner("");
    setWaiting(false);
    setHosting(false);
    setDrag({ x: 0, y: 0, isDragging: false });
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
            style={{ transform: "translate(-50%, -50%)" }}
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

  // Card style for drag/swipe
  const cardStyle = {
    transform: `translate(-50%, -50%) translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 10}deg)`,
    transition: drag.isDragging ? "none" : "transform 0.3s",
    zIndex: 2,
  };

  // Card feedback class
  let feedbackClass = "";
  if (drag.x > 80) feedbackClass = "liked";
  else if (drag.x < -80) feedbackClass = "disliked";

  return (
    <div className="swipe-game">
      <div className="swipe-stack">
        {swipeData[currentPlace] && (
          <div
            className={`swipe-card ${feedbackClass}`}
            ref={cardRef}
            style={cardStyle}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
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
        )}
      </div>
    </div>
  );
};
