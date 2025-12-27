import React, { useState, useEffect } from 'react';
import { doctorService } from '../services/api';
import { toast } from 'react-toastify';
import './Doctors.css';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const departments = [
    'All Departments',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'Oncology',
    'Gynecology',
    'ENT',
    'General Medicine'
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getAll();
      setDoctors(response.doctors || []);
    } catch (error) {
      toast.error('Failed to load doctors');
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesDepartment = selectedDepartment === 'all' || 
                             doctor.department === selectedDepartment;
    const matchesSearch = doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const getDepartmentColor = (department) => {
    const colors = {
      'Cardiology': '#ff6b6b',
      'Neurology': '#4ecdc4',
      'Orthopedics': '#45b7d1',
      'Pediatrics': '#96ceb4',
      'Dermatology': '#ffcc5c',
      'Oncology': '#ff8e53',
      'Gynecology': '#ea9ab2',
      'ENT': '#c7b9ff',
      'General Medicine': '#667eea',
      'Emergency': '#ff4757'
    };
    return colors[department] || '#667eea';
  };

  return (
    <div className="doctors-page">
      {/* Hero Section */}
      <section className="doctors-hero">
        <div className="container">
          <h1>Meet Our Expert Doctors</h1>
          <p>Highly qualified medical professionals dedicated to your healthcare</p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section">
        <div className="container">
          <div className="filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search doctors by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="department-filters">
              {departments.map(dept => (
                <button
                  key={dept}
                  className={`department-filter ${selectedDepartment === dept.toLowerCase().replace(' ', '-') ? 'active' : ''}`}
                  onClick={() => setSelectedDepartment(dept === 'All Departments' ? 'all' : dept)}
                  style={{ '--dept-color': getDepartmentColor(dept) }}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="doctors-grid-section">
        <div className="container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading doctors...</p>
            </div>
          ) : filteredDoctors.length > 0 ? (
            <>
              <div className="stats">
                <p>{filteredDoctors.length} doctors found</p>
              </div>
              
              <div className="doctors-grid">
                {filteredDoctors.map(doctor => (
                  <div key={doctor._id} className="doctor-card">
                    <div className="doctor-image">
                      <div className="image-placeholder">
                        {doctor.firstName?.charAt(0)}{doctor.lastName?.charAt(0)}
                      </div>
                      <div 
                        className="department-badge"
                        style={{ backgroundColor: getDepartmentColor(doctor.doctrDptmnt || doctor.department) }}
                      >
                        {doctor.doctrDptmnt || doctor.department}
                      </div>
                    </div>
                    
                    <div className="doctor-info">
                      <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
                      <p className="specialization">{doctor.specialization || doctor.doctrDptmnt || 'General Medicine'}</p>
                      
                      <div className="doctor-meta">
                        <div className="meta-item">
                          <span className="meta-icon">🎓</span>
                          <span className="meta-text">{doctor.experience || '10+'} years experience</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">⭐</span>
                          <span className="meta-text">{doctor.rating || '4.8'} rating</span>
                        </div>
                      </div>
                      
                      <p className="doctor-description">
                        {doctor.description || 'Specialized in providing excellent patient care with modern medical practices.'}
                      </p>
                      
                      <div className="doctor-actions">
                        <button className="btn btn-primary">
                          <span className="btn-icon">📅</span>
                          Book Appointment
                        </button>
                        <button className="btn btn-outline">
                          <span className="btn-icon">👁️</span>
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👨‍⚕️</div>
              <h3>No Doctors Found</h3>
              <p>Try changing your search criteria or department filter</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSelectedDepartment('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="doctors-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Can't Find the Right Doctor?</h2>
            <p>Our medical team will help you find the perfect specialist for your needs</p>
            <div className="cta-actions">
              <button className="btn btn-primary btn-lg">
                <span className="btn-icon">📞</span>
                Call for Assistance
              </button>
              <button className="btn btn-outline btn-lg">
                <span className="btn-icon">💬</span>
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Doctors;