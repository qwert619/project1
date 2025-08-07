import React, { useState } from "react";

export const Location = ({children}) => {
    const [numberRestaurants, setNumberRestaurants] = useState(20);
    const [distance, setDistance] = useState(4);

    // Get user location only once when component mounts
    return (
        <div className="location-settings">
            <div className="location-controls">
                <input type="number" placeholder="set number of resturants" defaultValue={20} onChange={(e) => setNumberRestaurants(e.target.value)} />
                <input type="number" placeholder="set distance in miles" defaultValue={4} onChange={(e) => setDistance(e.target.value)} />
            </div>
            <div className="location">
                {React.cloneElement(children, { numberRestaurants, distance })}
        </div>
        </div>
    );
};

