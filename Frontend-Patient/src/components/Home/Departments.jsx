import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Departments.css';

const Departments = () => {
  const services = [
    {
      id: 1,
      name: 'General Consultation',
      icon: '🩺',
      description: 'Comprehensive health check-ups and consultations',
      doctors: 3,
      color: '#667eea'
    },
    {
      id: 2,
      name: 'Emergency Care',
      icon: '🚨',
      description: '24/7 emergency medical services',
      doctors: 2,
      color: '#ff6b6b'
    },
    {
      id: 3,
      name: 'Diagnostics',
      icon: '🔬',
      description: 'Laboratory tests and diagnostic services',
      doctors: 1,
      color: '#4ecdc4'
    },
    {
      id: 4,
      name: 'Follow-up Care',
      icon: '📋',
      description: 'Post-treatment monitoring and care',
      doctors: 2,
      color: '#ffcc5c'
    }
  ];

  const [activeService, setActiveService] = useState(services[0]);

  return (
    <section className="departments" id="services">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">
            Comprehensive healthcare services for all your medical needs
          </p>
        </div>

        <div className="departments-grid">
          <div className="departments-list">
            {services.map(service => (
              <div
                key={service.id}
                className={`department-card ${activeService.id === service.id ? 'active' : ''}`}
                onClick={() => setActiveService(service)}
                style={{ '--dept-color': service.color }}
              >
                <div className="card-header">
                  <div className="dept-icon" style={{ backgroundColor: `${service.color}22` }}>
                    <span>{service.icon}</span>
                  </div>

                  <div className="dept-info">
                    <h3 className="dept-name">{service.name}</h3>
                    <div className="dept-stats">
                      <span className="stat">{service.doctors} Doctor{service.doctors > 1 ? 's' : ''}</span>
                      <span className="view-arrow">➜</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="department-detail">
            <div className="detail-header">
              <div
                className="detail-icon"
                style={{
                  backgroundColor: `${activeService.color}22`,
                  color: activeService.color
                }}
              >
                {activeService.icon}
              </div>

              <div>
                <h3 className="detail-title">{activeService.name}</h3>
                <p className="detail-description">{activeService.description}</p>
              </div>
            </div>

            <div className="detail-features">
              {[
                ['👨‍⚕️', 'Expert Doctors', `${activeService.doctors}+ qualified doctors`],
                ['🏥', 'Modern Facilities', 'Well-equipped examination rooms'],
                ['📅', 'Easy Booking', 'Online and phone appointments'],
                ['🏆', 'Quality Care', 'Personalized treatment plans']
              ].map((item, index) => (
                <div className="feature" key={index}>
                  <div className="feature-icon">{item[0]}</div>
                  <div className="feature-content">
                    <h4 className="feature-title">{item[1]}</h4>
                    <p className="feature-text">{item[2]}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="detail-actions">
              <Link to="/appointment" className="btn btn-primary">
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Departments;