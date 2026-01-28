import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Home/Hero';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      
      {/* AI Assistant Features */}
      <section className="ai-features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How Our AI Assistant Works</h2>
            <p className="section-subtitle">Intelligent automation designed specifically for small GP practices</p>
          </div>
          
          <div className="ai-workflow">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Voice Call Processing</h3>
                <p>Real-time speech recognition with auto language detection (German/English). Our AI transcribes and understands patient requests instantly.</p>
                <ul className="step-features">
                  <li>Azure Speech-to-Text with EU hosting</li>
                  <li>Multi-language support</li>
                  <li>Real-time transcription</li>
                </ul>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Intent & Data Extraction</h3>
                <p>Advanced LLM analyzes conversation to extract patient details, appointment preferences, medical requests, and urgency levels.</p>
                <ul className="step-features">
                  <li>Structured JSON output only</li>
                  <li>Patient identification & lookup</li>
                  <li>Slot filling for appointments</li>
                </ul>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Smart Appointment Booking</h3>
                <p>Automatically checks calendar availability, proposes optimal slots, and books appointments with patient confirmation.</p>
                <ul className="step-features">
                  <li>Calendar integration</li>
                  <li>Auto waitlist management</li>
                  <li>Confirmation via SMS/Email</li>
                </ul>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Medical Request Handling</h3>
                <p>Processes prescription renewals and referral requests with built-in safety checks and physician approval workflows.</p>
                <ul className="step-features">
                  <li>Prescription validation</li>
                  <li>Referral routing</li>
                  <li>Compliance checking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Demo Preview Section */}
      <section className="demo-preview-section">
        <div className="container">
          <div className="demo-grid">
            <div className="demo-content">
              <h2>See It In Action</h2>
              <p>Experience our AI voice assistant handling a complete patient call from start to finish.</p>
              <div className="demo-features">
                <div className="demo-feature">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <strong>Full Call Flow Demo</strong>
                    <span>Audio → Transcript → Booking → Confirmation</span>
                  </div>
                </div>
                <div className="demo-feature">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <strong>Waitlist Automation</strong>
                    <span>Automatic patient notification & booking</span>
                  </div>
                </div>
                <div className="demo-feature">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <strong>Doctor Summary View</strong>
                    <span>Structured patient summaries at a glance</span>
                  </div>
                </div>
              </div>
              <Link to="/demo" className="btn btn-primary">
                <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                </svg>
                Launch Demo
              </Link>
            </div>
            <div className="demo-visual">
              <div className="code-preview">
                <div className="code-header">
                  <div className="code-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <span>agent_output.json</span>
                </div>
                <pre className="code-content">
{`{
  "intent": "appointment",
  "confidence": 0.96,
  "slots": {
    "first_name": "Anna",
    "last_name": "Meier",
    "birthdate": "1985-03-12",
    "reason": "Routine-Vorsorge",
    "preferred_times": ["morning"],
    "preferred_days": ["Wednesday", "Thursday"],
    "urgency": "medium",
    "additional_info": "Prefer Dr. Schmidt"
  },
  "next_action": {
    "type": "lookup_patient",
    "payload": {
      "first_name": "Anna",
      "last_name": "Meier",
      "birthdate": "1985-03-12"
    }
  },
  "messages": [{
    "to_user": "Danke Frau Meier. Dürfte ich kurz Ihre Einwilligung erhalten..."
  }]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Privacy & Security */}
      <section className="privacy-section">
        <div className="container">
          <div className="privacy-grid">
            <div className="privacy-content">
              <h2>Privacy-First Architecture</h2>
              <p>Built with healthcare data protection as the foundation. EU-hosted, encrypted, and fully compliant.</p>
              <div className="privacy-features">
                <div className="privacy-feature">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>EU Data Hosting (Germany)</span>
                </div>
                <div className="privacy-feature">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>End-to-End Encryption</span>
                </div>
                <div className="privacy-feature">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Consent-Based Processing</span>
                </div>
                <div className="privacy-feature">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Full Audit Logging</span>
                </div>
              </div>
            </div>
            <div className="privacy-visual">
              <div className="shield-icon">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" fill="var(--primary-100)" stroke="var(--primary-300)" strokeWidth="2"/>
                  <path d="M50 20L20 35V50C20 70 35 85 50 90C65 85 80 70 80 50V35L50 20Z" fill="var(--primary-50)" stroke="var(--primary-600)" strokeWidth="2"/>
                  <path d="M40 50L45 55L60 40" stroke="var(--primary-600)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="home-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Automate Your Practice?</h2>
            <p>Join the AI revolution in healthcare. Reduce call volume, eliminate scheduling errors, and focus on patient care.</p>
            <div className="cta-actions">
              <Link to="/demo" className="btn btn-primary btn-lg">
                <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                </svg>
                Try Free Demo
              </Link>
              <Link to="/contact" className="btn btn-outline btn-lg">
                Request Enterprise Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;