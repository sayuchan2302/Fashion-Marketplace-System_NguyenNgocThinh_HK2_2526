import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home/Home';
import TopBar from './components/TopBar/TopBar';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ProductListing from './pages/ProductListing/ProductListing';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        <TopBar />
        <Header />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:id" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
