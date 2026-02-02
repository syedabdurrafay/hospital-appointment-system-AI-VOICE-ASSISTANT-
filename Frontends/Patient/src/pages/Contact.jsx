import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    practice_size: '',
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
      toast.success('Message sent successfully! Our team will contact you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        practice_size: '',
        message: ''
      });
      setLoading(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: '🤖',
      title: 'Sales & Demo',
      details: ['demo@madicarepro.com', 'Schedule a personalized demo'],
      color: 'var(--primary-500)'
    },
    {
      icon: '💼',
      title: 'Enterprise Sales',
      details: ['sales@madicarepro.com', 'Multi-practice solutions'],
      color: 'var(--primary-600)'
    },
    {
      icon: '🔧',
      title: 'Technical Support',
      details: ['support@madicarepro.com', '24/7 technical assistance'],
      color: 'var(--primary-700)'
    },
    {
      icon: '📍',
      title: 'Our Location',
      details: ['Berlin, Germany', 'EU Data Center Hosted'],
      color: 'var(--primary-800)'
    }
  ];

  const technicalContacts = [
    { 
      label: 'API Documentation', 
      link: '/api-docs',
      icon: '📚',
      description: 'Complete API reference'
    },
    { 
      label: 'Integration Support', 
      link: '/integration',
      icon: '🔄',
      description: 'System integration help'
    },
    { 
      label: 'Security FAQ', 
      link: '/security',
      icon: '🔒',
      description: 'Privacy & compliance'
    },
    { 
      label: 'Developer Portal', 
      link: '/developers',
      icon: '👨‍💻',
      description: 'Resources for developers'
    }
  ];

  const demoOptions = [
    { 
      title: 'Basic Demo', 
      duration: '30 min',
      features: ['Voice assistant walkthrough', 'Basic features overview'],
      icon: '🎬'
    },
    { 
      title: 'Technical Demo', 
      duration: '60 min',
      features: ['API integration', 'Custom workflow setup'],
      icon: '⚙️'
    },
    { 
      title: 'Enterprise Demo', 
      duration: '90 min',
      features: ['Multi-practice setup', 'Custom AI training'],
      icon: '🏢'
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1>Contact MadiCare Pro</h1>
          <p>Get in touch to learn how our AI voice assistant can transform your GP practice</p>
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
              <h2 className="section-title">Request a Demo</h2>
              <p className="section-subtitle">Fill out this form to schedule a personalized demo of our AI voice assistant</p>
              
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
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Work Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.name@practice.com"
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
                      placeholder="+49 123 456 7890"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company">Practice/Hospital Name *</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your practice name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="practice_size">Practice Size *</label>
                    <select
                      id="practice_size"
                      name="practice_size"
                      value={formData.practice_size}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select size</option>
                      <option value="1-2">1-2 Doctors (Small)</option>
                      <option value="3-5">3-5 Doctors (Medium)</option>
                      <option value="6-10">6-10 Doctors (Large)</option>
                      <option value="10+">10+ Doctors (Enterprise)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="demo_type">Demo Preference</label>
                    <select
                      id="demo_type"
                      name="demo_type"
                      value={formData.demo_type}
                      onChange={handleChange}
                    >
                      <option value="">Select demo type</option>
                      <option value="basic">Basic Demo (30 min)</option>
                      <option value="technical">Technical Demo (60 min)</option>
                      <option value="enterprise">Enterprise Demo (90 min)</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">What challenges are you facing? *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your current appointment scheduling process, call volume, or specific needs..."
                    rows="6"
                    required
                  />
                </div>
                
                <div className="form-footer">
                  <div className="privacy-note">
                    <span className="privacy-icon">🔒</span>
                    <span>Your information is protected by GDPR. We'll never share your details.</span>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-block"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Sending Request...
                      </>
                    ) : (
                      'Request Demo Now'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="contact-sidebar">
              {/* Demo Options */}
              <div className="demo-options">
                <h3 className="sidebar-title">
                  <span className="title-icon">🎯</span>
                  Demo Options
                </h3>
                <div className="demo-options-list">
                  {demoOptions.map((demo, index) => (
                    <div key={index} className="demo-option">
                      <div className="demo-icon">{demo.icon}</div>
                      <div className="demo-content">
                        <div className="demo-header">
                          <h4>{demo.title}</h4>
                          <span className="demo-duration">{demo.duration}</span>
                        </div>
                        <ul className="demo-features">
                          {demo.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Contacts */}
              <div className="technical-contacts">
                <h3 className="sidebar-title">
                  <span className="title-icon">🔧</span>
                  Technical Resources
                </h3>
                <div className="technical-list">
                  {technicalContacts.map((contact, index) => (
                    <a key={index} href={contact.link} className="technical-item">
                      <div className="technical-icon">{contact.icon}</div>
                      <div className="technical-info">
                        <h4>{contact.label}</h4>
                        <p className="technical-desc">{contact.description}</p>
                      </div>
                      <span className="arrow-icon">→</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3 className="sidebar-title">
                  <span className="title-icon">⚡</span>
                  Quick Access
                </h3>
                <div className="action-buttons">
                  <a href="/demo" className="btn btn-primary btn-block">
                    <span className="btn-icon">🎮</span>
                    Try Live Demo
                  </a>
                  <a href="/pricing" className="btn btn-outline btn-block">
                    <span className="btn-icon">💰</span>
                    View Pricing
                  </a>
                  <a 
                    href="/docs" 
                    className="btn btn-outline btn-block"
                  >
                    <span className="btn-icon">📚</span>
                    Read Documentation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="contact-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Practice?</h2>
            <p>Join 500+ GP practices already saving hours each week with MadiCare Pro</p>
            <div className="cta-stats">
              <div className="stat">
                <div className="stat-number">95%</div>
                <div className="stat-label">Reduction in Missed Calls</div>
              </div>
              <div className="stat">
                <div className="stat-number">40%</div>
                <div className="stat-label">Time Saved on Scheduling</div>
              </div>
              <div className="stat">
                <div className="stat-number">100%</div>
                <div className="stat-label">GDPR Compliant</div>
              </div>
            </div>
            <div className="cta-actions">
              <a href="/demo" className="btn btn-primary btn-lg">
                <span className="btn-icon">🤖</span>
                Start Free Trial
              </a>
              <a href="tel:+493012345678" className="btn btn-outline btn-lg">
                <span className="btn-icon">📞</span>
                Call Us: +49 30 123 4567
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;