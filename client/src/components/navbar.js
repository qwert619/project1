import { Link, useNavigate } from "react-router-dom";
import { setCookies } from "react-cookie";

export const Navbar = () => {
    const navigate = useNavigate();
    

    
    return ( 
        <div className="navbar">
            <div className="navbar-container">
            <Link to = "/location" className="location-link">
                🌍
            </Link>
            <Link to ="/" className="logo-link">
                <img src="/logo.png" alt="Logo" />
            </Link>
            <Link to = "/settings" className="settings-link">
                ⚙️
            </Link>
            </div>
        </div>
    )

}