import React from 'react';
import { Link } from 'react-router-dom';
import './CTA.css';

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <h2>Your Health is Our Priority</h2>
          <p>Schedule your appointment today and experience healthcare excellence with our team of medical professionals</p>
          <div className="cta-actions">
            <Link to="/appointment" className="btn btn-primary btn-lg">
              <span className="btn-icon">📅</span>
              Schedule Appointment
            </Link>
            <Link to="/contact" className="btn btn-light btn-lg">
              <span className="btn-icon">📞</span>
              Contact Our Team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;