import './App.css'

// Component Imports
import Header from "./components/header.jsx";
import Footer from "./components/footer.jsx";

// Page Imports
import Home from './pages/home.jsx'
import AboutUs from "./pages/aboutus.jsx"
import Contact from './pages/contact.jsx'
import Stalls from './pages/stalls.jsx'
import Riders from './pages/riders.jsx'
import FAQ from './pages/faq.jsx'
import DriverSignup from './pages/driverSignup.jsx'
import RestaurantPartner from './pages/restaurantPartner.jsx'
import Catering from './pages/catering.jsx'
import Markets from './pages/markets.jsx'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {

  return (
      <Router>
        <header><Header /></header>
        <main>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/riders" element={<Riders />} />
                <Route path="/stalls" element={<Stalls />} />
                <Route path="/FAQ" element={<FAQ />} />
                <Route path="/driver-signup" element={<DriverSignup />} />
                <Route path="/restaurant-partner" element={<RestaurantPartner />} />
                <Route path="/catering" element={<Catering />} />
                <Route path="/markets" element={<Markets />} />
            </Routes>
        </main>
          <footer><Footer /></footer>
      </Router>
  )
}

export default App
