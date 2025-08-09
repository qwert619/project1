import { Link} from "react-router-dom";
//import { setCookies } from "react-cookie";

export const Navbar = () => {
    //const navigate = useNavigate();
    


    return ( 
        <div className="navbar">
            <div className="navbar-container">
            <Link to = "/location" className="location-link">
                <img src="/datebitemap-orange.png" alt="Location" />
            </Link>
            <Link to ="/" className="logo-link">
                <img src="/datebiteorange.png" alt="Logo"/>
            </Link>
            <Link to = "/settings" className="settings-link">
                <img src="/datebitesetting-orange.png" alt="Setting"/>
            </Link>
            </div>
        </div>
    )

}