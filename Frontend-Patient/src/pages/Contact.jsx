import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll contact you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setLoading(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: '📞',
      title: 'Phone Number',
      details: ['1-800-MEDICAL', '+1 (123) 456-7890'],
      color: '#667eea'
    },
    {
      icon: '✉️',
      title: 'Email Address',
      details: ['support@medicarepro.com', 'emergency@medicarepro.com'],
      color: '#4ecdc4'
    },
    {
      icon: '📍',
      title: 'Location',
      details: ['123 Healthcare Street', 'Medical City, MC 12345', 'United States'],
      color: '#ff6b6b'
    },
    {
      icon: '⏰',
      title: 'Working Hours',
      details: ['24/7 Emergency Services', 'Mon-Fri: 8:00 AM - 8:00 PM', 'Sat: 9:00 AM - 6:00 PM'],
      color: '#ffcc5c'
    }
  ];

  const emergencyContacts = [
    { label: 'Emergency Ambulance', number: '911', icon: '🚑' },
    { label: 'Fire Department', number: '911', icon: '🚒' },
    { label: 'Police Department', number: '911', icon: '🚔' },
    { label: 'Poison Control', number: '1-800-222-1222', icon: '☠️' }
  ];

  const departmentsContact = [
    { name: 'Emergency Department', number: 'Ext. 100', email: 'emergency@medicarepro.com' },
    { name: 'Cardiology', number: 'Ext. 101', email: 'cardio@medicarepro.com' },
    { name: 'Neurology', number: 'Ext. 102', email: 'neuro@medicarepro.com' },
    { name: 'Pediatrics', number: 'Ext. 103', email: 'pediatrics@medicarepro.com' },
    { name: 'Orthopedics', number: 'Ext. 104', email: 'ortho@medicarepro.com' },
    { name: 'Administration', number: 'Ext. 105', email: 'admin@medicarepro.com' }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1>Get in Touch With Us</h1>
          <p>We're here to help. Contact us for appointments, inquiries, or emergency assistance.</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="container">
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-info-card">
                <div 
                  className="info-icon"
                  style={{ backgroundColor: info.color }}
                >
                  {info.icon}
                </div>
                <h3>{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="info-detail">{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <h2 className="section-title">Send Us a Message</h2>
              <p className="section-subtitle">Fill out the form below and we'll get back to you soon</p>
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this regarding?"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    rows="6"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary btn-block"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Sending Message...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            {/* Emergency & Departments Info */}
            <div className="contact-sidebar">
              {/* Emergency Contacts */}
              <div className="emergency-contacts">
                <h3 className="sidebar-title">
                  <span className="title-icon">🚨</span>
                  Emergency Contacts
                </h3>
                <div className="emergency-list">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="emergency-item">
                      <div className="emergency-icon">{contact.icon}</div>
                      <div className="emergency-info">
                        <h4>{contact.label}</h4>
                        <p className="emergency-number">{contact.number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Departments Contact */}
              <div className="departments-contact">
                <h3 className="sidebar-title">
                  <span className="title-icon">🏥</span>
                  Department Contacts
                </h3>
                <div className="departments-list">
                  {departmentsContact.map((dept, index) => (
                    <div key={index} className="department-item">
                      <h4>{dept.name}</h4>
                      <div className="department-contacts">
                        <p className="contact-number">
                          <span className="contact-icon">📞</span>
                          {dept.number}
                        </p>
                        <p className="contact-email">
                          <span className="contact-icon">✉️</span>
                          {dept.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3 className="sidebar-title">
                  <span className="title-icon">⚡</span>
                  Quick Actions
                </h3>
                <div className="action-buttons">
                  <button className="btn btn-primary btn-block">
                    <span className="btn-icon">📅</span>
                    Book Appointment
                  </button>
                  <button className="btn btn-outline btn-block">
                    <span className="btn-icon">🗺️</span>
                    Get Directions
                  </button>
                  <a 
                    href="tel:911" 
                    className="btn btn-emergency btn-block"
                  >
                    <span className="btn-icon">🚨</span>
                    Call 911 (Emergency)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <h2 className="section-title">Find Us Here</h2>
          <div className="map-container">
            {/* Placeholder for Google Map */}
            <div className="map-placeholder">
              <div className="map-overlay">
                <h3>MediCare Pro Hospital</h3>
                <p>123 Healthcare Street, Medical City</p>
                <button className="btn btn-primary">
                  <span className="btn-icon">🗺️</span>
                  Open in Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;