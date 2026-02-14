import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Home/Hero';
import './Home.css';

const Home = () => {
  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const scrollWidth = slider.scrollWidth;
    const clientWidth = slider.clientWidth;

    const animate = () => {
      if (slider.scrollLeft >= scrollWidth - clientWidth) {
        slider.scrollLeft = 0;
      } else {
        slider.scrollLeft += 1;
      }
    };

    const interval = setInterval(animate, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      <Hero />

      {/* AI Assistant Features - Professional Cards */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">INTELLIGENT AUTOMATION</span>
            <h2 className="section-title">
              Complete Phone Call Automation for<br />Your Medical Practice
            </h2>
            <p className="section-subtitle">
              Our AI assistant handles 100% of incoming calls - appointments, prescriptions,
              and inquiries - with zero manual intervention.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-inner">
                <div className="feature-icon-container">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 5.5C3 3.5 4.5 2 6.5 2h11C19.5 2 21 3.5 21 5.5V19c0 1.5-1.5 3-3.5 3h-11C4.5 22 3 20.5 3 19V5.5z" />
                    <path d="M8 2v3M16 2v3M12 11v6M9 14h6" />
                  </svg>
                </div>
                <h3>Intelligent Call Answering</h3>
                <p>24/7 automated call handling with natural conversation flow. Patients speak naturally, our AI understands instantly.</p>
                <ul className="feature-list">
                  <li>Multi-language support</li>
                  <li>Real-time speech recognition</li>
                  <li>Natural conversation flow</li>
                </ul>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-card-inner">
                <div className="feature-icon-container">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 6v6l4 2M12 2a10 10 0 100 20 10 10 0 000-20z" />
                  </svg>
                </div>
                <h3>Smart Appointment Booking</h3>
                <p>Automated calendar management that checks availability, books appointments, and sends confirmations instantly.</p>
                <ul className="feature-list">
                  <li>Real-time calendar sync</li>
                  <li>Intelligent slot suggestions</li>
                  <li>Automatic confirmations</li>
                </ul>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-card-inner">
                <div className="feature-icon-container">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 10V7a4 4 0 00-4-4H9a4 4 0 00-4 4v3M12 14v6M8 18h8" />
                  </svg>
                </div>
                <h3>Medical Request Processing</h3>
                <p>Automated handling of prescription renewals and referrals with built-in validation.</p>
                <ul className="feature-list">
                  <li>Prescription validation</li>
                  <li>Referral processing</li>
                  <li>Urgency detection</li>
                </ul>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-card-inner">
                <div className="feature-icon-container">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <h3>Real-time Updates</h3>
                <p>Instant notifications to patients, doctors, and administrators about all changes.</p>
                <ul className="feature-list">
                  <li>Patient SMS alerts</li>
                  <li>Doctor dashboard updates</li>
                  <li>Admin notifications</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Animated Stats Strip */}
          <div className="stats-strip">
            <div className="stats-track" ref={sliderRef}>
              <div className="stat-item">
                <span className="stat-value">100%</span>
                <span className="stat-label">Automated</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">24/7</span>
                <span className="stat-label">Availability</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">40+</span>
                <span className="stat-label">Hours Saved/Week</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">98%</span>
                <span className="stat-label">Satisfaction</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Manual Work</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">100%</span>
                <span className="stat-label">Automated</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">24/7</span>
                <span className="stat-label">Availability</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">40+</span>
                <span className="stat-label">Hours Saved/Week</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section with Parallax */}
      <section className="demo-section">
        <div className="demo-background"></div>
        <div className="container">
          <div className="demo-grid">
            <div className="demo-content" data-aos="fade-right">
              <span className="demo-badge">LIVE INTERACTION</span>
              <h2>Experience the AI Phone Call</h2>
              <p>Watch how our AI assistant handles a complete patient call - from pickup to confirmation - without human intervention.</p>

              <div className="demo-features">
                <div className="demo-feature">
                  <div className="feature-dot"></div>
                  <div>
                    <strong>Complete Call Flow</strong>
                    <span>Inbound call → AI greeting → Intent extraction → Action → Confirmation</span>
                  </div>
                </div>
                <div className="demo-feature">
                  <div className="feature-dot"></div>
                  <div>
                    <strong>Real-time Processing</strong>
                    <span>Live transcription with instant entity extraction</span>
                  </div>
                </div>
                <div className="demo-feature">
                  <div className="feature-dot"></div>
                  <div>
                    <strong>Smart Execution</strong>
                    <span>Automatic calendar booking and notifications</span>
                  </div>
                </div>
              </div>

              <Link to="/dashboard" className="demo-cta">
                <span>Launch Interactive Demo</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 15L15 5M15 5H8M15 5V12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <div className="demo-visual" data-aos="fade-left">
              <div className="phone-container">
                <div className="phone">
                  <div className="phone-screen">
                    <div className="call-header">
                      <div className="call-signal">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="call-timer">02:34</span>
                    </div>

                    <div className="call-avatar">
                      <div className="avatar-pulse"></div>
                      <div className="avatar-initials">AM</div>
                    </div>

                    <div className="caller-details">
                      <h4>Anna Meier</h4>
                      <span>+49 171 2345678</span>
                    </div>

                    <div className="transcript">
                      <div className="message ai">
                        <div className="message-content">
                          <span className="sender">AI Assistant</span>
                          <p>Guten Tag, Praxis Dr. Schmidt. Wie kann ich Ihnen helfen?</p>
                        </div>
                      </div>
                      <div className="message patient">
                        <div className="message-content">
                          <span className="sender">Anna Meier</span>
                          <p>Ich hätte gerne einen Termin für eine Vorsorgeuntersuchung.</p>
                        </div>
                      </div>
                      <div className="message ai">
                        <div className="message-content">
                          <span className="sender">AI Assistant</span>
                          <p>Gerne. Ich sehe, wir haben am Mittwoch um 10:00 Uhr einen Termin frei.</p>
                        </div>
                      </div>
                    </div>

                    <div className="call-actions">
                      <div className="action-button accept">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="action-button reject">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="data-card">
                  <div className="data-header">
                    <span>Extracted Data</span>
                    <span className="data-status">Live</span>
                  </div>
                  <div className="data-fields">
                    <div className="data-field">
                      <span className="field-label">Patient</span>
                      <span className="field-value">Anna Meier</span>
                    </div>
                    <div className="data-field">
                      <span className="field-label">ID</span>
                      <span className="field-value">P-2024-0123</span>
                    </div>
                    <div className="data-field">
                      <span className="field-label">Intent</span>
                      <span className="field-value intent">Appointment Booking</span>
                    </div>
                    <div className="data-field">
                      <span className="field-label">Date</span>
                      <span className="field-value">Wednesday, 10:00</span>
                    </div>
                    <div className="data-field">
                      <span className="field-label">Status</span>
                      <span className="field-value status">Confirmed</span>
                    </div>
                  </div>
                  <div className="data-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '75%' }}></div>
                    </div>
                    <span>Processing complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Interactive Cards */}
      <section className="workflow-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">AUTOMATED PROCESS</span>
            <h2 className="section-title">From Call to Completion in Seconds</h2>
            <p className="section-subtitle">Zero manual steps. Complete automation from start to finish.</p>
          </div>

          <div className="workflow-timeline">
            <div className="timeline-line"></div>
            <div className="workflow-cards">
              <div className="workflow-card">
                <div className="card-number">01</div>
                <div className="card-icon">📞</div>
                <h4>Inbound Call</h4>
                <p>AI answers within 1 second with natural greeting</p>
                <div className="card-hover-effect"></div>
              </div>
              <div className="workflow-card">
                <div className="card-number">02</div>
                <div className="card-icon">🎯</div>
                <h4>Intent Recognition</h4>
                <p>AI identifies patient and understands request</p>
                <div className="card-hover-effect"></div>
              </div>
              <div className="workflow-card">
                <div className="card-number">03</div>
                <div className="card-icon">📅</div>
                <h4>Action Execution</h4>
                <p>Checks calendar and books in real-time</p>
                <div className="card-hover-effect"></div>
              </div>
              <div className="workflow-card">
                <div className="card-number">04</div>
                <div className="card-icon">✅</div>
                <h4>Confirmation</h4>
                <p>SMS sent, dashboards updated instantly</p>
                <div className="card-hover-effect"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section with Animated Background */}
      <section className="security-section">
        <div className="security-particles"></div>
        <div className="container">
          <div className="security-grid">
            <div className="security-content" data-aos="fade-right">
              <span className="security-badge">ENTERPRISE SECURITY</span>
              <h2>GDPR Compliant & EU Hosted</h2>
              <p>Built with healthcare data protection as the foundation. Your patients' data never leaves Germany.</p>

              <div className="security-features">
                <div className="security-feature">
                  <div className="feature-indicator"></div>
                  <div>
                    <strong>EU Data Hosting</strong>
                    <span>All data stored in Germany. Fully GDPR compliant.</span>
                  </div>
                </div>
                <div className="security-feature">
                  <div className="feature-indicator"></div>
                  <div>
                    <strong>End-to-End Encryption</strong>
                    <span>AES-256 encryption for all data.</span>
                  </div>
                </div>
                <div className="security-feature">
                  <div className="feature-indicator"></div>
                  <div>
                    <strong>Complete Audit Trail</strong>
                    <span>Every action logged for compliance.</span>
                  </div>
                </div>
                <div className="security-feature">
                  <div className="feature-indicator"></div>
                  <div>
                    <strong>Role-Based Access</strong>
                    <span>Granular permissions for all users.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="security-badges" data-aos="fade-left">
              <div className="floating-badge">
                <div className="badge-glow"></div>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>ISO 27001</span>
              </div>
              <div className="floating-badge">
                <div className="badge-glow"></div>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>GDPR</span>
              </div>
              <div className="floating-badge">
                <div className="badge-glow"></div>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <span>HIPAA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient Animation */}
      <section className="cta-section">
        <div className="cta-gradient"></div>
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Automate Your Practice?</h2>
            <p>Join hundreds of medical practices saving 40+ hours per week with AI automation.</p>
            <div className="cta-buttons">
              <Link to="/dashboard" className="cta-primary">
                Try Free Demo
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 15L15 5M15 5H8M15 5V12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link to="/contact" className="cta-secondary">
                Schedule Consultation
              </Link>
            </div>
            <p className="cta-note">No credit card required. 14-day free trial.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;