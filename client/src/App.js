import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import "./App.css";
import { Home } from "./pages/home";
import { Location } from "./pages/location";
import { Settings } from "./pages/settings";
import { Title } from "./components/title";
import { Map } from "./components/map";
import { LoadScript } from "@react-google-maps/api";
import { Navbar } from "./components/navbar";

const libraries = ['places'];

function App() {
  return (
    <div className="App">
      <CookiesProvider>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
          <Router>
            <Title />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
            <Route path="/location" element={<Location><Map /></Location>} />
            <Route path="/settings" element={<Settings />} />
            </Routes> 
        </Router>
        </LoadScript>
      </CookiesProvider>
    </div>
  );
}

export default App;
