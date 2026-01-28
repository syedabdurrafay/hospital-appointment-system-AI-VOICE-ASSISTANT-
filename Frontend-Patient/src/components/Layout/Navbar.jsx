import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-brand">
          <Link to="/" className="logo-link">
            <div className="logo">
              <svg className="logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 26C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12z" fill="currentColor"/>
                <path d="M22 12h-4v8h-4v-8h-4v-2h12v2z" fill="currentColor"/>
              </svg>
              <span className="logo-text">MediCare</span>
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
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)} 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <span className="nav-text">Home</span>
            </Link>
            <Link 
              to="/services" 
              onClick={() => setIsMenuOpen(false)} 
              className={`nav-link ${isActive('/services') ? 'active' : ''}`}
            >
              <span className="nav-text">Services</span>
            </Link>
            <Link 
              to="/doctors" 
              onClick={() => setIsMenuOpen(false)} 
              className={`nav-link ${isActive('/doctors') ? 'active' : ''}`}
            >
              <span className="nav-text">Doctors</span>
            </Link>
            <Link 
              to="/appointment" 
              onClick={() => setIsMenuOpen(false)} 
              className={`nav-link ${isActive('/appointment') ? 'active' : ''}`}
            >
              <span className="nav-text">Appointment</span>
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setIsMenuOpen(false)} 
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
            >
              <span className="nav-text">Contact</span>
            </Link>
          </div>

          <div className="nav-auth">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-secondary" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <button className="btn btn-outline" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
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