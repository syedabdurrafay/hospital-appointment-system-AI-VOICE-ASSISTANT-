import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Departments.css';

const Departments = () => {
  const departments = [
    {
      id: 1,
      name: 'Cardiology',
      icon: '❤️',
      description: 'Comprehensive heart care and advanced cardiovascular treatments',
      doctors: 18,
      color: '#c62828'
    },
    {
      id: 2,
      name: 'Neurology',
      icon: '🧠',
      description: 'Specialized care for brain and nervous system disorders',
      doctors: 14,
      color: '#1565c0'
    },
    {
      id: 3,
      name: 'Orthopedics',
      icon: '🦴',
      description: 'Advanced bone, joint, and musculoskeletal treatments',
      doctors: 16,
      color: '#2e7d32'
    },
    {
      id: 4,
      name: 'Pediatrics',
      icon: '👶',
      description: 'Comprehensive healthcare for children and adolescents',
      doctors: 22,
      color: '#ef6c00'
    },
    {
      id: 5,
      name: 'Dermatology',
      icon: '🌟',
      description: 'Expert skin care and cosmetic treatments',
      doctors: 12,
      color: '#6a1b9a'
    },
    {
      id: 6,
      name: 'Oncology',
      icon: '🩺',
      description: 'Advanced cancer care and comprehensive treatment plans',
      doctors: 15,
      color: '#00695c'
    },
    {
      id: 7,
      name: 'Gynecology',
      icon: '🌸',
      description: "Comprehensive women's health and specialized care",
      doctors: 13,
      color: '#ad1457'
    },
    {
      id: 8,
      name: 'ENT',
      icon: '👂',
      description: 'Specialized ear, nose, and throat care and treatments',
      doctors: 11,
      color: '#4e342e'
    }
  ];

  const [activeDept, setActiveDept] = useState(departments[0]);

  return (
    <section className="departments" id="departments">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Medical Specialties</h2>
          <p className="section-subtitle">
            High-quality healthcare services across all major medical disciplines
          </p>
        </div>

        <div className="departments-grid">
          <div className="departments-list">
            {departments.map(dept => (
              <div
                key={dept.id}
                className={`department-card ${activeDept.id === dept.id ? 'active' : ''}`}
                onClick={() => setActiveDept(dept)}
                style={{ '--dept-color': dept.color }}
              >
                <div className="card-header">
                  <div className="dept-icon" style={{ backgroundColor: `${dept.color}22` }}>
                    <span>{dept.icon}</span>
                  </div>

                  <div className="dept-info">
                    <h3 className="dept-name">{dept.name}</h3>
                    <div className="dept-stats">
                      <span className="stat">{dept.doctors} Specialists</span>
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
                  backgroundColor: `${activeDept.color}22`,
                  color: activeDept.color
                }}
              >
                {activeDept.icon}
              </div>

              <div>
                <h3 className="detail-title">{activeDept.name}</h3>
                <p className="detail-description">{activeDept.description}</p>
              </div>
            </div>

            <div className="detail-features">
              {[
                ['👨‍⚕️', 'Expert Specialists', `${activeDept.doctors}+ certified doctors`],
                ['🏥', 'Modern Facilities', 'Advanced medical equipment'],
                ['📅', 'Fast Appointments', 'Same-week scheduling'],
                ['🏆', 'Trusted Care', '98% patient satisfaction']
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
              <Link
                to={`/department/${activeDept.name.toLowerCase()}`}
                className="btn btn-outline"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        <div className="view-all">
          <Link to="/departments" className="btn btn-secondary">
            View All Departments
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Departments;