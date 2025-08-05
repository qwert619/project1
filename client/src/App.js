import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import "./App.css";
import { Home } from "./pages/home";
import { location } from "./pages/location";



import { Navbar } from "./components/navbar";

function App() {
  return (
    <div className="App">
      <CookiesProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/location" element={<Location />} />
            <Route path="/settings" element={<Settings />} />
            </Routes> 
        </Router>
      </CookiesProvider>
    </div>
  );
}

export default App;
