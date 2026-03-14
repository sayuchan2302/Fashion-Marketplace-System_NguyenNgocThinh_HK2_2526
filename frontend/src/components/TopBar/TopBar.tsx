import './TopBar.css';
import { Star, ChevronDown } from 'lucide-react';

const TopBar = () => {
  return (
    <div className="topbar">
      <div className="topbar-content container">
        <div className="topbar-left">
          <a href="#">VỀ COOLMATE</a>
          <a href="#">CXP BY COOLMATE</a>
          <a href="#">CARE&SHARE</a>
        </div>
        
        <div className="topbar-right">
          <a href="#" className="coolclub-link">
            <Star size={14} fill="currentColor" />
            <span>Coolclub</span>
          </a>
          <a href="#">Cửa hàng</a>
          <a href="#">Blog</a>
          <a href="#">CSKH</a>
          <button className="lang-btn">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg" alt="VN Flag" className="flag-icon" />
            <span>VN</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
