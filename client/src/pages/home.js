import axios from "axios";
import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [guestusername, setGuestUsername] = useState("");

    useEffect(() => {
        const userID = window.localStorage.getItem("userID");
        const fetchValidUser = async () => {
            try{
                console.log("Fetching valid user with ID:", userID);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/${userID}`);
                console.log("Valid user fetched:", response.data.validUser);
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
        <h1 className="loading">Loading restaurants...</h1>
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

