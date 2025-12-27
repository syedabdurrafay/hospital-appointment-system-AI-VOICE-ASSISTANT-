import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Services.css';

const Services = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const serviceCategories = [
    { id: 'all', name: 'All Services', icon: '🩺' },
    { id: 'diagnostic', name: 'Diagnostic', icon: '🔬' },
    { id: 'treatment', name: 'Treatment', icon: '💊' },
    { id: 'surgical', name: 'Surgical', icon: '🔪' },
    { id: 'wellness', name: 'Wellness', icon: '🏃' },
    { id: 'emergency', name: 'Emergency', icon: '🚨' }
  ];

  const services = [
    {
      id: 1,
      name: 'Cardiac Surgery',
      description: 'Advanced heart surgeries with minimal invasion techniques',
      category: 'surgical',
      icon: '❤️',
      duration: '3-6 hours',
      price: '$$$$',
      featured: true
    },
    {
      id: 2,
      name: 'MRI Scan',
      description: 'High-resolution imaging for accurate diagnosis',
      category: 'diagnostic',
      icon: '🖼️',
      duration: '30-60 mins',
      price: '$$',
      featured: false
    },
    {
      id: 3,
      name: 'Cancer Treatment',
      description: 'Comprehensive oncology services with latest technology',
      category: 'treatment',
      icon: '🎗️',
      duration: 'Varies',
      price: '$$$$',
      featured: true
    },
    {
      id: 4,
      name: 'Emergency Care',
      description: '24/7 emergency services with trauma center',
      category: 'emergency',
      icon: '🚑',
      duration: 'Immediate',
      price: '$$$',
      featured: true
    },
    {
      id: 5,
      name: 'Physiotherapy',
      description: 'Rehabilitation and physical therapy services',
      category: 'wellness',
      icon: '💪',
      duration: '45-60 mins',
      price: '$$',
      featured: false
    },
    {
      id: 6,
      name: 'Neurology',
      description: 'Advanced treatment for neurological disorders',
      category: 'treatment',
      icon: '🧠',
      duration: 'Consultation',
      price: '$$$',
      featured: false
    },
    {
      id: 7,
      name: 'CT Scan',
      description: 'Computed tomography for detailed imaging',
      category: 'diagnostic',
      icon: '📡',
      duration: '15-30 mins',
      price: '$$',
      featured: false
    },
    {
      id: 8,
      name: 'Orthopedic Surgery',
      description: 'Joint replacement and bone surgeries',
      category: 'surgical',
      icon: '🦴',
      duration: '2-4 hours',
      price: '$$$$',
      featured: true
    },
    {
      id: 9,
      name: 'Health Checkup',
      description: 'Comprehensive preventive health screening',
      category: 'wellness',
      icon: '📋',
      duration: '2-4 hours',
      price: '$$',
      featured: false
    },
    {
      id: 10,
      name: 'Dialysis',
      description: 'Kidney dialysis with advanced filtration systems',
      category: 'treatment',
      icon: '💧',
      duration: '3-4 hours',
      price: '$$$',
      featured: false
    },
    {
      id: 11,
      name: 'ICU',
      description: 'Intensive care unit with round-the-clock monitoring',
      category: 'emergency',
      icon: '🏥',
      duration: '24/7',
      price: '$$$$',
      featured: true
    },
    {
      id: 12,
      name: 'Maternity Care',
      description: 'Complete prenatal and postnatal care',
      category: 'treatment',
      icon: '🤰',
      duration: '9 months+',
      price: '$$$$',
      featured: true
    }
  ];

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(service => service.category === activeCategory);

  const featuredServices = services.filter(service => service.featured);

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="container">
          <h1>Comprehensive Healthcare Services</h1>
          <p>Advanced medical care with state-of-the-art technology and expert professionals</p>
        </div>
      </section>

      {/* Featured Services */}
      <section className="featured-services">
        <div className="container">
          <h2 className="section-title">Featured Services</h2>
          <div className="featured-grid">
            {featuredServices.map(service => (
              <div key={service.id} className="featured-service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <Link to={`/service/${service.id}`} className="service-link">
                  Learn More →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Services */}
      <section className="all-services">
        <div className="container">
          <div className="services-header">
            <h2 className="section-title">All Medical Services</h2>
            <p className="section-subtitle">Browse our complete range of healthcare services</p>
          </div>

          {/* Category Filters */}
          <div className="category-filters">
            {serviceCategories.map(category => (
              <button
                key={category.id}
                className={`category-filter ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="services-grid">
            {filteredServices.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <div className="service-icon">{service.icon}</div>
                  {service.featured && (
                    <span className="featured-badge">Featured</span>
                  )}
                </div>
                <div className="service-content">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-meta">
                    <div className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      <span className="meta-text">{service.duration}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">💰</span>
                      <span className="meta-text">{service.price}</span>
                    </div>
                  </div>
                </div>
                <div className="service-actions">
                  <Link to="/appointment" className="btn btn-primary">
                    Book Now
                  </Link>
                  <button className="btn btn-outline">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Need Specialized Care?</h2>
            <p>Our medical team is available 24/7 to assist you with any healthcare needs</p>
            <div className="cta-actions">
              <Link to="/appointment" className="btn btn-primary btn-lg">
                <span className="btn-icon">📅</span>
                Book Appointment
              </Link>
              <a href="tel:+18006334225" className="btn btn-outline btn-lg">
                <span className="btn-icon">📞</span>
                Call Now: 1-800-MEDICAL
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;