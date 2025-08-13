// Card.js
import React, { useState, useEffect } from "react";

export default function Card({ restaurant, progress, onSwipe, cardRef, isBackground = false }) {
  const [flipped, setFlipped] = useState(false);
  const [drag, setDrag] = useState({
    x: 0,
    y: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    dragDistance: 0,
  });

  // Reset flip state when restaurant changes
    useEffect(() => {
    if (restaurant?.place_id) {
        setFlipped(false);
    }
    }, [restaurant?.place_id]);

  // Use Google Places photo if available
  const photoRef = restaurant?.photos?.[0]?.photo_reference;
  const imageUrl = photoRef
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    : "/datebite.png"; // fallback image

  // Drag event handlers
  const handleDragStart = (e) => {
    e.stopPropagation();
    setDrag({
      ...drag,
      isDragging: true,
      startX: e.type === "touchstart" ? e.touches[0].clientX : e.clientX,
      startY: e.type === "touchstart" ? e.touches[0].clientY : e.clientY,
      dragDistance: 0, // Reset drag distance
    });
  };

  const handleDragMove = (e) => {
    if (!drag.isDragging) return;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    const newX = clientX - drag.startX;
    const newY = clientY - drag.startY;

    // Calculate total drag distance
    const dragDistance = Math.sqrt(newX * newX + newY * newY);

    setDrag({
      ...drag,
      x: newX,
      y: newY,
      dragDistance: dragDistance,
    });
  };

  const handleDragEnd = () => {
    if (!drag.isDragging) return;

    let direction = "";
    if (drag.x > 120) direction = "yes";
    else if (drag.x < -120) direction = "no";

    if (direction) {
      onSwipe(direction);
      setDrag({ x: 0, y: 0, isDragging: false, startX: 0, startY: 0, dragDistance: 0 });
    } else {
      setDrag({
        x: 0,
        y: 0,
        isDragging: false,
        startX: 0,
        startY: 0,
        dragDistance: drag.dragDistance, // Keep the drag distance for click detection
      });
    }
  };

  // Card style for drag/swipe
  const cardStyle = {
    transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 10}deg)`,
    transition: drag.isDragging ? "none" : "transform 0.3s",
    zIndex: 2,
  };

  // Card feedback class
  let feedbackClass = "";
  if (drag.x > 80) feedbackClass = "liked";
  else if (drag.x < -80) feedbackClass = "disliked";

  // Flip logic - only flip if user didn't drag and not a background card
  const handleCardClick = (e) => {
    // Don't flip if this is a background card
    if (isBackground) return;
    
    // Don't flip if user dragged the card (threshold of 5px)
    if (drag.dragDistance > 5) {
      // Reset drag distance after preventing flip
      setDrag((prev) => ({ ...prev, dragDistance: 0 }));
      return;
    }

    // Only flip if not dragging
    if (!drag.isDragging) {
      setFlipped((f) => !f);
    }
  };

  return (
  <div className={`card-container ${isBackground ? "card-background" : ""}`}>
    <div
      className={`swipe-card ${feedbackClass} ${flipped ? "flipped" : ""}`}
      ref={isBackground ? null : cardRef}
      style={isBackground ? {} : cardStyle}
      onMouseDown={isBackground ? undefined : handleDragStart}
      onMouseMove={isBackground ? undefined : handleDragMove}
      onMouseUp={isBackground ? undefined : handleDragEnd}
      onMouseLeave={isBackground ? undefined : handleDragEnd}
      onTouchStart={isBackground ? undefined : handleDragStart}
      onTouchMove={isBackground ? undefined : handleDragMove}
      onTouchEnd={isBackground ? undefined : handleDragEnd}
      onClick={isBackground ? undefined : handleCardClick}
    >
      <div className="flip-inner">
        {/* Front of card */}
        <div className="flip-front">
          <img
            className="swipe-data-image"
            src={imageUrl}
            alt={restaurant?.name}
          />
          <div className="swipe-card-content">
            <h1 className="swipe-data-title">{restaurant?.name}</h1>
            <div className="swipe-progress">{progress}</div>
            <div
              style={{
                marginTop: "10px",
                color: "#ffb056",
                fontWeight: "bold",
              }}
            >
              <span>Swipe right for Yes, left for No</span>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="flip-back">
          <div
            className="swipe-card-content"
            style={{
              justifyContent: "center",
              textAlign: "center",
              height: "100%",
              background: "rgba(0,0,0,0.8)",
              borderRadius: "24px",
            }}
          >
            <h2
              style={{
                color: "#ff9320",
                marginBottom: "20px",
                fontSize: "1.8rem",
              }}
            >
              {restaurant?.name}
            </h2>
            <p style={{ margin: "12px 0", color: "#fff", fontSize: "1rem" }}>
              <strong>Address:</strong>
              <br />
              {restaurant?.vicinity || restaurant?.formatted_address || "Not available"}
            </p>
            <p style={{ margin: "12px 0", color: "#fff", fontSize: "1rem" }}>
              <strong>Rating:</strong> {restaurant?.rating ?? "N/A"} ⭐
            </p>
            <p style={{ margin: "12px 0", color: "#fff", fontSize: "1rem" }}>
              <strong>Price Level:</strong>{" "}
              {restaurant?.price_level ? "$".repeat(restaurant.price_level) : "N/A"}
            </p>
            <p style={{ margin: "12px 0", color: "#fff", fontSize: "1rem" }}>
              <strong>Open Now:</strong>{" "}
              {restaurant?.opening_hours?.open_now ? "✅ Yes" : "❌ No"}
            </p>
            <div style={{ marginTop: "30px", fontSize: "14px", color: "#ccc" }}>
              Click to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}