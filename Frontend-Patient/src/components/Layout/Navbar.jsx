import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-brand">
          <Link to="/" className="logo-link">
            <div className="logo">
              <span className="logo-icon">🏥</span>
              <span className="logo-text">MediCare<span className="logo-highlight">Pro</span></span>
            </div>
          </Link>
        </div>

        <button 
          className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="nav-link">
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Home</span>
            </Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="nav-link">
              <span className="nav-icon">ℹ️</span>
              <span className="nav-text">About</span>
            </Link>
            <Link to="/appointment" onClick={() => setIsMenuOpen(false)} className="nav-link">
              <span className="nav-icon">📅</span>
              <span className="nav-text">Appointments</span>
            </Link>
            <Link to="/doctors" onClick={() => setIsMenuOpen(false)} className="nav-link">
              <span className="nav-icon">👨‍⚕️</span>
              <span className="nav-text">Doctors</span>
            </Link>
            <Link to="/services" onClick={() => setIsMenuOpen(false)} className="nav-link">
              <span className="nav-icon">🩺</span>
              <span className="nav-text">Services</span>
            </Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="nav-link">
              <span className="nav-icon">📞</span>
              <span className="nav-text">Contact</span>
            </Link>
          </div>

          <div className="nav-auth">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-secondary" onClick={() => setIsMenuOpen(false)}>
                  <span className="btn-icon">📊</span>
                  Dashboard
                </Link>
                <button className="btn btn-outline" onClick={handleLogout}>
                  <span className="btn-icon">🚪</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" onClick={() => setIsMenuOpen(false)}>
                  <span className="btn-icon">🔑</span>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                  <span className="btn-icon">📝</span>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;