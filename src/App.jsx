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


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {

  return (
      <Router>
        <header><Header /></header>
        <main>
            <Routes>
                <Route path="/swift_eats" element={<Home />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/riders" element={<Riders />} />
                <Route path="/stalls" element={<Stalls />} />
                <Route path="/FAQ" element={<FAQ />} />
            </Routes>
        </main>
          <footer><Footer /></footer>
      </Router>
  )
}

export default App
