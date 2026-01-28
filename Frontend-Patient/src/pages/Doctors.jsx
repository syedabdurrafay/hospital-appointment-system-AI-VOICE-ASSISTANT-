import React, { useState, useEffect } from 'react';
import { doctorService } from '../services/api';
import { toast } from 'react-toastify';
import './Doctors.css';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // Fallback mock data
  const mockDoctors = [
    { 
      _id: '1', 
      firstName: 'Dr. John', 
      lastName: 'Smith', 
      specialization: 'General Physician',
      experience: '15',
      qualification: 'MD, MBBS',
      description: 'Specialized in general medicine with 15 years of experience in patient care.',
      rating: '4.8',
      availability: 'Mon-Fri, 9AM-5PM'
    },
    { 
      _id: '2', 
      firstName: 'Dr. Sarah', 
      lastName: 'Johnson', 
      specialization: 'General Physician',
      experience: '12',
      qualification: 'MD, MBBS',
      description: 'Expert in comprehensive healthcare and preventive medicine.',
      rating: '4.9',
      availability: 'Mon-Sat, 10AM-6PM'
    },
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorService.getAll();
      
      // Handle different response structures
      let doctorsData = [];
      
      if (response && response.doctors) {
        doctorsData = response.doctors;
      } else if (Array.isArray(response)) {
        doctorsData = response;
      } else if (response && response.success && response.doctors) {
        doctorsData = response.doctors;
      }
      
      // Ensure all doctors have required fields
      const normalizedDoctors = doctorsData.map(doctor => ({
        _id: doctor._id || doctor.id || `mock-${Math.random()}`,
        firstName: doctor.firstName || doctor.name?.split(' ')[0] || 'Dr.',
        lastName: doctor.lastName || doctor.name?.split(' ')[1] || 'Unknown',
        specialization: doctor.specialization || doctor.speciality || 'General Physician',
        experience: doctor.experience || '5',
        qualification: doctor.qualification || 'MBBS',
        description: doctor.description || `Experienced ${doctor.specialization || 'doctor'} with ${doctor.experience || '5'} years of experience.`,
        rating: doctor.rating || '4.5',
        availability: doctor.availability || 'Mon-Fri, 9AM-5PM'
      }));
      
      setDoctors(normalizedDoctors.length > 0 ? normalizedDoctors : mockDoctors);
      
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Using demo data.');
      toast.error('Failed to load doctors. Showing demo data.');
      setDoctors(mockDoctors);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    if (!doctor) return false;
    
    const fullName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) ||
      (doctor.specialization?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (doctor.qualification?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="doctors-page">
      {/* Hero Section */}
      <section className="doctors-hero">
        <div className="container">
          <h1>Meet Our Medical Team</h1>
          <p>Experienced doctors dedicated to providing quality healthcare</p>
        </div>
      </section>

      {/* Search Section */}
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
            <button 
              className="btn btn-secondary"
              onClick={fetchDoctors}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Doctors'}
            </button>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

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
                <p>{filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} available</p>
              </div>
              
              <div className="doctors-grid">
                {filteredDoctors.map(doctor => (
                  <div key={doctor._id} className="doctor-card">
                    <div className="doctor-image">
                      <div className="image-placeholder">
                        {doctor.firstName?.charAt(0)}{doctor.lastName?.charAt(0)}
                      </div>
                      <div className="availability-badge">
                        Available
                      </div>
                    </div>
                    
                    <div className="doctor-info">
                      <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
                      <p className="specialization">{doctor.specialization}</p>
                      
                      <div className="doctor-meta">
                        <div className="meta-item">
                          <span className="meta-icon">🎓</span>
                          <span className="meta-text">{doctor.qualification}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">⏱️</span>
                          <span className="meta-text">{doctor.experience} years</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">⭐</span>
                          <span className="meta-text">{doctor.rating || '4.8'} rating</span>
                        </div>
                      </div>
                      
                      <p className="availability-text">
                        <strong>Availability:</strong> {doctor.availability}
                      </p>
                      
                      <p className="doctor-description">
                        {doctor.description}
                      </p>
                      
                      <div className="doctor-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => window.location.href = `/appointment?doctorId=${doctor._id}`}
                        >
                          <span className="btn-icon">📅</span>
                          Book Appointment
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
              <p>Try changing your search criteria</p>
              <button 
                className="btn btn-primary"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
              <button 
                className="btn btn-secondary"
                onClick={fetchDoctors}
              >
                Retry Loading
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="doctors-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Need to See a Doctor?</h2>
            <p>Book an appointment with our experienced medical team</p>
            <div className="cta-actions">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => window.location.href = '/appointment'}
              >
                <span className="btn-icon">📅</span>
                Book Appointment
              </button>
              <a href="tel:+18006334225" className="btn btn-outline btn-lg">
                <span className="btn-icon">📞</span>
                Call for Appointment
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Doctors;