import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      {/* Animated background elements */}
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-pattern"></div>
        <div className="floating-dots"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            AI-POWERED MEDICAL ASSISTANT
          </div>

          <h1 className="hero-title">
            Transform Your Practice with
            <span className="title-gradient"> Intelligent Voice Automation</span>
          </h1>

          <p className="hero-description">
            MadiCare Pro automates 100% of patient calls with privacy-first AI.
            Our intelligent assistant handles appointments, prescriptions, and
            referrals through natural conversation—zero manual intervention.
          </p>

          <div className="hero-actions">
            <Link to="/dashboard" className="btn-primary">
              <span>View Live Demo</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 15L15 5M15 5H8M15 5V12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/features" className="btn-outline">
              <span>Explore Features</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 10H14M10 6V14" strokeLinecap="round" />
              </svg>
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Patient Satisfaction</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">40+</span>
              <span className="stat-label">Hours Saved/Week</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Availability</span>
            </div>
          </div>

          <div className="hero-features">
            <div className="feature-chip">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9H15M9 3V15" strokeLinecap="round" />
              </svg>
              <span>Voice-First Booking</span>
            </div>
            <div className="feature-chip">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 6L6 15M6 6L15 15" strokeLinecap="round" />
              </svg>
              <span>Smart Waitlist</span>
            </div>
            <div className="feature-chip">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3H15V15H3V3Z" strokeLinecap="round" />
              </svg>
              <span>Prescription Handling</span>
            </div>
            <div className="feature-chip">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="9" r="6" strokeLinecap="round" />
                <path d="M9 6V9L11 11" strokeLinecap="round" />
              </svg>
              <span>Real-time Updates</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-container">
            {/* Main Phone Mockup */}
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  <div className="call-ui">
                    <div className="call-header">
                      <div className="signal-bars">
                        <span></span><span></span><span></span><span></span>
                      </div>
                      <span className="call-time">02:34</span>
                    </div>

                    <div className="call-avatar">
                      <div className="avatar-ring"></div>
                      <div className="avatar-initials">AM</div>
                    </div>

                    <div className="caller-info">
                      <h4>Anna Meier</h4>
                      <span>Incoming Call · Mobile</span>
                    </div>

                    <div className="live-transcript">
                      <div className="transcript-message ai">
                        <span className="message-sender">AI Assistant</span>
                        <p>Guten Tag, Praxis Dr. Schmidt. Wie kann ich Ihnen helfen?</p>
                      </div>
                      <div className="transcript-message patient">
                        <span className="message-sender">Anna Meier</span>
                        <p>Ich hätte gerne einen Termin für eine Vorsorgeuntersuchung.</p>
                      </div>
                    </div>

                    <div className="call-actions">
                      <button className="action-btn accept">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button className="action-btn reject">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Data Cards */}
              <div className="floating-card card-1">
                <div className="card-header">
                  <span className="card-title">Patient Found</span>
                  <span className="card-status">✓</span>
                </div>
                <div className="card-body">
                  <div className="card-row">
                    <span>Name:</span>
                    <strong>Anna Meier</strong>
                  </div>
                  <div className="card-row">
                    <span>ID:</span>
                    <strong>P-2024-0123</strong>
                  </div>
                </div>
              </div>

              <div className="floating-card card-2">
                <div className="card-header">
                  <span className="card-title">Appointment</span>
                  <span className="card-badge">Available</span>
                </div>
                <div className="card-body">
                  <div className="card-row">
                    <span>Wed, 10:00</span>
                    <span>Dr. Schmidt</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>

              <div className="floating-card card-3">
                <div className="card-header">
                  <span className="card-title">Confirmation</span>
                  <span className="card-time">SMS Sent</span>
                </div>
                <div className="card-body">
                  <div className="card-message">
                    ✓ Appointment confirmed for Wednesday at 10:00
                  </div>
                </div>
              </div>
            </div>

            {/* AI Processing Visualization */}
            <div className="ai-processing">
              <div className="processing-ring">
                <div className="ring-segment"></div>
                <div className="ring-segment"></div>
                <div className="ring-segment"></div>
                <div className="ring-segment"></div>
              </div>
              <div className="processing-particles">
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
};

export default Hero;