import axios from "axios";
import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";

export const Settings = () => {

    const [loggedIn, setLoggedIn] = useState(false);
    const [guestusername, setGuestUsername] = useState("");
    const [isloading, setIsLoading] = useState(true);
    const [currentUsername, setCurrentUsername] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const userID = window.localStorage.getItem("userID");
        const fetchValidUser = async () => {
            try{
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/${userID}`);
                console.log("Valid user fetched:", response.data.validUser);
                if (response.data.validUser) {
                    setLoggedIn(true);
                    setCurrentUsername(window.localStorage.getItem("username"));
                } else {
                    window.localStorage.removeItem("userID");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (userID !== null) {
            fetchValidUser();
        } else {
            setIsLoading(false);
        }

    }, []);

    const setguest = async (userID) => {try{
            console.log("Setting guest username:", guestusername);
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/users`, { userID, guestusername });
            window.localStorage.setItem("username", response.data.guestusername);
            setCurrentUsername(window.localStorage.getItem("username"));
    } catch (error) {
        console.error("Error updating user:", error);
    }
    }

    const handleSubmit = (e) => {
        if (guestusername === "") return;

        e.preventDefault();
        // Handle form submission logic here
        console.log("Form submitted");
        const userID = window.localStorage.getItem("userID");
        console.log("User ID:", userID);
        setguest(userID);
  };

  return (
      <div className="settings">
          {isloading ? <p></p> : loggedIn ? (
          <>
              <h1 className="current-username">{`Current Username: ${currentUsername}`}</h1>
          <input className="guest-username" type="text" placeholder="Change username" value={guestusername} onChange={(e) => setGuestUsername(e.target.value)} />
          <button className="submit-username" onClick={handleSubmit}>Save</button>
          <div className="logout-container">
          <button className="logout-button" onClick={() => {
              window.localStorage.removeItem("userID");
              window.localStorage.removeItem("username");
              setGuestUsername("");
              setLoggedIn(false);
          }}>Logout</button>
          </div>
          </>
          ) : (
          <button className="login-button" onClick={() => navigate("/")}>Create guest</button>
      )}
      </div>
  )
};