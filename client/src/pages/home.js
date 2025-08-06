import axios from "axios";
import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { SwipeGame } from "../components/swipegame";

export const Home = () => {
    const [loggedIn, setLoggedIn] = useState();
    const navigate = useNavigate();
    const [guestusername, setGuestUsername] = useState("");

    useEffect(() => {
        const userID = window.localStorage.getItem("userID");
        const fetchValidUser = async () => {
            try{
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/${userID}`);
                if (response.data.validUser) {
                    setLoggedIn(true);
                } else {
                    window.localStorage.removeItem("username");
                    window.localStorage.removeItem("userID");
                }
            } catch (error) {
            }
        };
        if (userID !== null) {
            fetchValidUser()
        }
    }, []);

    const makeguest = async () => {
        try{
            console.log("Creating new guest user:", guestusername);
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/users`, { guestusername });
            window.localStorage.setItem("userID", response.data.userID);
            window.localStorage.setItem("username", response.data.guestusername);
            navigate("/location");
            setLoggedIn(true);
        }catch(error){
            console.error("Error submitting form:", error);
        }
        
    };

    const handleSubmit = (e) => {
        
        e.preventDefault();
        // Handle form submission logic here
        console.log("Form submitted");
        const userID = window.localStorage.getItem("userID");
        console.log("User ID:", userID);
        makeguest();
  };

  return (
    <div className="home">
        {loggedIn ? (
        <>
        <SwipeGame />
        </>
        ) : (
            <>
            <h1>Welcome</h1>
        <input className="guest-username" type="text" placeholder="Enter your name" value={guestusername} onChange={(e) => setGuestUsername(e.target.value)} />
        <button className="submit-username" onClick={handleSubmit}>submit</button>
        </>
    )}
    </div>
  )
};

