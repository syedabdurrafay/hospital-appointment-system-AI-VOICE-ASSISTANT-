import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Services.css';

const Services = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const serviceCategories = [
    { id: 'all', name: 'All Features', icon: '🤖' },
    { id: 'appointment', name: 'Appointment AI', icon: '📅' },
    { id: 'prescription', name: 'Prescription AI', icon: '💊' },
    { id: 'waitlist', name: 'Waitlist AI', icon: '⏰' },
    { id: 'analytics', name: 'Analytics', icon: '📊' }
  ];

  const services = [
    {
      id: 1,
      name: 'Voice Assistant',
      description: 'AI-powered voice agent handles patient calls 24/7 with natural conversation and multi-language support',
      category: 'appointment',
      icon: '🎤',
      duration: '24/7 Availability',
      price: 'Time-saving',
      featured: true
    },
    {
      id: 2,
      name: 'Smart Scheduling',
      description: 'Automated appointment booking with calendar integration and optimal slot suggestions',
      category: 'appointment',
      icon: '📅',
      duration: 'Instant Booking',
      price: 'Efficient',
      featured: true
    },
    {
      id: 3,
      name: 'Waitlist Automation',
      description: 'Automatic patient notification and booking when cancellations occur',
      category: 'waitlist',
      icon: '⏰',
      duration: 'Real-time Updates',
      price: 'No-show Reduction',
      featured: true
    },
    {
      id: 4,
      name: 'Prescription AI',
      description: 'Intelligent prescription renewal with safety checks and doctor approval workflow',
      category: 'prescription',
      icon: '💊',
      duration: 'Quick Processing',
      price: 'Safe & Compliant',
      featured: false
    },
    {
      id: 5,
      name: 'Referral Management',
      description: 'Automated referral processing with specialist matching and tracking',
      category: 'prescription',
      icon: '🔗',
      duration: 'Streamlined',
      price: 'Time-saving',
      featured: false
    },
    {
      id: 6,
      name: 'Practice Analytics',
      description: 'Insights into call patterns, appointment trends, and waitlist performance',
      category: 'analytics',
      icon: '📊',
      duration: 'Real-time Reports',
      price: 'Data-driven',
      featured: false
    },
    {
      id: 7,
      name: 'Patient Identification',
      description: 'Automatic patient lookup from voice data with privacy-first consent workflow',
      category: 'appointment',
      icon: '👤',
      duration: 'Instant Matching',
      price: 'Secure',
      featured: false
    },
    {
      id: 8,
      name: 'Compliance Audit',
      description: 'Complete audit trail with consent logging and GDPR compliance reports',
      category: 'analytics',
      icon: '🔒',
      duration: 'Always Active',
      price: 'Compliant',
      featured: false
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
          <h1>AI-Powered Practice Features</h1>
          <p>Transform your small GP practice with intelligent automation and voice-first patient interactions</p>
        </div>
      </section>

      {/* Featured Services */}
      <section className="featured-services">
        <div className="container">
          <h2 className="section-title">Core AI Capabilities</h2>
          <div className="featured-grid">
            {featuredServices.map(service => (
              <div key={service.id} className="featured-service-card">
                <div className="service-icon">{service.icon}</div>
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
                <Link to="/demo" className="service-link">
                  Try Demo →
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
            <h2 className="section-title">Complete Feature Set</h2>
            <p className="section-subtitle">Explore all our AI-powered tools designed for small GP practices</p>
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
                    <span className="featured-badge">Core Feature</span>
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
                  <Link to="/demo" className="btn btn-primary">
                    View Demo
                  </Link>
                  <Link to="/pricing" className="btn btn-outline">
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="integration-section">
        <div className="container">
          <div className="integration-content">
            <h2>Seamless Practice Integration</h2>
            <p>Connect with your existing systems and workflow</p>
            <div className="integration-grid">
              <div className="integration-item">
                <div className="integration-icon">📋</div>
                <h3>Calendar Systems</h3>
                <p>Sync with Google Calendar, Outlook, and practice management software</p>
              </div>
              <div className="integration-item">
                <div className="integration-icon">🏥</div>
                <h3>Practice Software</h3>
                <p>Integrate with leading GP practice management systems</p>
              </div>
              <div className="integration-item">
                <div className="integration-icon">📱</div>
                <h3>Communication</h3>
                <p>SMS, Email, and Phone system integration</p>
              </div>
              <div className="integration-item">
                <div className="integration-icon">🛡️</div>
                <h3>Security Compliance</h3>
                <p>GDPR, HIPAA compliant with end-to-end encryption</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Automate Your Practice?</h2>
            <p>Join hundreds of small GP practices saving hours each week with AI automation</p>
            <div className="cta-actions">
              <Link to="/demo" className="btn btn-primary btn-lg">
                <span className="btn-icon">🎮</span>
                Try Free Demo
              </Link>
              <Link to="/contact" className="btn btn-outline btn-lg">
                <span className="btn-icon">📞</span>
                Schedule a Call
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;