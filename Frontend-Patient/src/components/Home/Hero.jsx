import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            AI-Powered Voice Assistant
            <span className="hero-highlight"> for GP Practices</span>
          </h1>
          <p className="hero-description">
            MadiCare Pro automates patient calls with privacy-first AI. Our intelligent assistant books appointments, handles prescriptions, and manages referrals—all through natural conversation.
          </p>
          <div className="hero-actions">
            <Link to="/demo" className="btn btn-primary btn-lg">
              <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"/>
              </svg>
              View Live Demo
            </Link>
            <Link to="/features" className="btn btn-outline btn-lg">
              Explore Features
            </Link>
          </div>
          <div className="hero-features">
            <div className="feature">
              <svg viewBox="0 0 20 20" fill="currentColor" className="feature-icon">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
              </svg>
              <span>Voice-First Appointment Booking</span>
            </div>
            <div className="feature">
              <svg viewBox="0 0 20 20" fill="currentColor" className="feature-icon">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              <span>Automatic Waitlist Management</span>
            </div>
            <div className="feature">
              <svg viewBox="0 0 20 20" fill="currentColor" className="feature-icon">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              <span>Smart Prescription & Referral Handling</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-container">
            <div className="image-placeholder">
              <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="400" rx="20" fill="url(#gradient)"/>
                {/* AI Assistant Visualization */}
                <circle cx="200" cy="180" r="60" fill="white" fillOpacity="0.9"/>
                <path d="M200 140C200 137.791 201.791 136 204 136H196C194.209 136 192 137.791 192 140C192 142.209 194.209 144 196 144H204C201.791 144 200 142.209 200 140Z" fill="#0ea5e9"/>
                <path d="M200 220C200 217.791 201.791 216 204 216H196C194.209 216 192 217.791 192 220C192 222.209 194.209 224 196 224H204C201.791 224 200 222.209 200 220Z" fill="#0ea5e9"/>
                
                {/* Sound waves */}
                <path d="M140 260C140 257.791 141.791 256 144 256H136C134.209 256 132 257.791 132 260C132 262.209 134.209 264 136 264H144C141.791 264 140 262.209 140 260Z" fill="white" fillOpacity="0.7"/>
                <path d="M120 250C120 247.791 121.791 246 124 246H116C114.209 246 112 247.791 112 250C112 252.209 114.209 254 116 254H124C121.791 254 120 252.209 120 250Z" fill="white" fillOpacity="0.5"/>
                <path d="M160 270C160 267.791 161.791 266 164 266H156C154.209 266 152 267.791 152 270C152 272.209 154.209 274 156 274H164C161.791 274 160 272.209 160 270Z" fill="white" fillOpacity="0.9"/>
                
                {/* Calendar slots */}
                <rect x="250" y="140" width="100" height="30" rx="6" fill="white" fillOpacity="0.8"/>
                <rect x="250" y="180" width="100" height="30" rx="6" fill="white" fillOpacity="0.8"/>
                <rect x="250" y="220" width="100" height="30" rx="6" fill="white" fillOpacity="0.8"/>
                
                {/* Phone icon */}
                <path d="M150 110C150 108.895 150.895 108 152 108H248C249.105 108 250 108.895 250 110V130C250 131.105 249.105 132 248 132H152C150.895 132 150 131.105 150 130V110Z" fill="white" fillOpacity="0.9"/>
                <circle cx="200" cy="121" r="2" fill="#0ea5e9"/>
                <rect x="180" y="125" width="40" height="4" rx="2" fill="#0ea5e9"/>
                
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0ea5e9"/>
                    <stop offset="1" stopColor="#0284c7"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;