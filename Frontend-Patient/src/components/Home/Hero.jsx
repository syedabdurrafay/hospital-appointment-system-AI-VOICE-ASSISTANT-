import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Expert Medical Care with <span className="highlight">Compassion</span> & Excellence
          </h1>
          <p className="hero-description">
            Our team of board-certified physicians provides comprehensive healthcare 
            using the latest medical technology in a patient-centered environment.
          </p>
          <div className="hero-actions">
            <Link to="/appointment" className="btn btn-primary btn-lg">
              Book Appointment
            </Link>
            <Link to="/about" className="btn btn-outline btn-lg">
              Meet Our Team
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">200+</div>
              <div className="stat-label">Specialist Doctors</div>
            </div>
            <div className="stat">
              <div className="stat-number">40+</div>
              <div className="stat-label">Medical Departments</div>
            </div>
            <div className="stat">
              <div className="stat-number">99.2%</div>
              <div className="stat-label">Patient Satisfaction</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Emergency Care</div>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-container">
            <img 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Modern Healthcare Facility" 
              className="main-image" 
            />
            <div className="floating-card appointment-card">
              <div className="card-icon">📅</div>
              <div className="card-content">
                <h4>Same-Day Appointments</h4>
                <p>Available for urgent care</p>
              </div>
            </div>
            <div className="floating-card emergency-card">
              <div className="card-icon">🏥</div>
              <div className="card-content">
                <h4>Emergency Services</h4>
                <p>24/7 Trauma Center</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;