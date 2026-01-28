import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import './Demo.css';

const Demo = () => {
  const [activeTab, setActiveTab] = useState('call');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showConsent, setShowConsent] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const audioRef = useRef(null);

  // Mock patient data for demo
  const mockPatients = [
    {
      id: 'PAT001',
      first_name: 'Anna',
      last_name: 'Meier',
      birthdate: '1985-03-12',
      phone: '+49 123 456 7890',
      email: 'anna.meier@example.com'
    },
    {
      id: 'PAT002',
      first_name: 'Max',
      last_name: 'Schmidt',
      birthdate: '1978-07-22',
      phone: '+49 987 654 3210',
      email: 'max.schmidt@example.com'
    }
  ];

  // Mock calendar slots
  const mockSlots = [
    { id: 'SLOT001', start: '2024-01-15T09:00:00', end: '2024-01-15T09:30:00', doctor: 'Dr. Schmidt', service: 'General Consultation' },
    { id: 'SLOT002', start: '2024-01-15T10:00:00', end: '2024-01-15T10:30:00', doctor: 'Dr. Schmidt', service: 'General Consultation' },
    { id: 'SLOT003', start: '2024-01-16T14:00:00', end: '2024-01-16T14:30:00', doctor: 'Dr. Weber', service: 'General Consultation' }
  ];

  // Example transcripts for demo
  const exampleTranscripts = [
    {
      text: "Hallo, guten Morgen. Hier ist Anna Meier. Geburtsdatum 12.03.1985. Ich bräuchte einen Termin für eine Routine-Vorsorge, am liebsten nächste Woche vormittags. Bitte mit Dr. Schmidt. Danke.",
      language: 'German'
    },
    {
      text: "Hello, this is Max Schmidt. I need to renew my prescription for blood pressure medication. My date of birth is 22.07.1978.",
      language: 'English'
    }
  ];

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate recording start
      toast.info('Recording started... Speak now');
    } else {
      // Simulate recording stop and processing
      simulateVoiceProcessing();
    }
  };

  const simulateVoiceProcessing = () => {
    setLoading(true);
    setTranscript(exampleTranscripts[0].text);
    
    // Simulate ASR processing
    setTimeout(() => {
      toast.success('Speech recognized successfully!');
      
      // Simulate AI agent processing
      simulateAgentProcessing();
    }, 1500);
  };

  const simulateAgentProcessing = () => {
    const mockAgentResponse = {
      intent: 'appointment',
      confidence: 0.96,
      slots: {
        first_name: 'Anna',
        last_name: 'Meier',
        birthdate: '1985-03-12',
        reason: 'Routine-Vorsorge',
        preferred_times: ['morning'],
        preferred_days: ['Wednesday', 'Thursday'],
        urgency: 'medium',
        additional_info: 'Prefer Dr. Schmidt'
      },
      next_action: {
        type: 'lookup_patient',
        payload: {
          first_name: 'Anna',
          last_name: 'Meier',
          birthdate: '1985-03-12'
        }
      },
      messages: [{
        to_user: 'Danke Frau Meier. Dürfte ich kurz Ihre Einwilligung erhalten, in Ihrer Akte nachzusehen und mögliche Termine vorzuschlagen? (Ja/Nein)'
      }]
    };

    setAiResponse(JSON.stringify(mockAgentResponse, null, 2));
    
    // Simulate patient lookup
    setTimeout(() => {
      const foundPatient = mockPatients.find(p => 
        p.first_name === mockAgentResponse.slots.first_name && 
        p.last_name === mockAgentResponse.slots.last_name
      );
      
      setPatientData(foundPatient);
      toast.success(`Patient found: ${foundPatient.first_name} ${foundPatient.last_name}`);
      
      // Simulate calendar lookup
      simulateCalendarLookup();
    }, 1000);
  };

  const simulateCalendarLookup = () => {
    setTimeout(() => {
      setSlots(mockSlots);
      toast.info('Found 3 available appointment slots');
      setLoading(false);
    }, 800);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowConsent(true);
  };

  const handleConsent = (consentGiven) => {
    if (consentGiven) {
      setLoading(true);
      
      // Simulate booking
      setTimeout(() => {
        const auditLog = {
          id: `AUDIT${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'APPOINTMENT_BOOKING',
          patient: `${patientData.first_name} ${patientData.last_name}`,
          slot: `${selectedSlot.doctor} - ${new Date(selectedSlot.start).toLocaleDateString('de-DE', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}`,
          consent: 'Patient verbally consented to appointment booking',
          status: 'COMPLETED'
        };

        setAuditLogs(prev => [auditLog, ...prev]);
        setBookingConfirmed(true);
        setShowConsent(false);
        setLoading(false);
        toast.success('Appointment booked successfully! Confirmation sent via SMS.');
        
        // Play success sound
        if (audioRef.current) {
          audioRef.current.play();
        }
      }, 1500);
    } else {
      setShowConsent(false);
      toast.info('Consent not given. Process stopped.');
    }
  };

  const handleReset = () => {
    setTranscript('');
    setAiResponse('');
    setPatientData(null);
    setSlots([]);
    setSelectedSlot(null);
    setShowConsent(false);
    setBookingConfirmed(false);
    setIsRecording(false);
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="demo-page">
      {/* Hero Section */}
      <section className="demo-hero">
        <div className="container">
          <h1>AI Voice Assistant Demo</h1>
          <p>Experience how MadiCare Pro handles patient calls, from voice to booking</p>
        </div>
      </section>

      {/* Demo Interface */}
      <section className="demo-interface">
        <div className="container">
          <div className="demo-container">
            {/* Demo Tabs */}
            <div className="demo-tabs">
              <button 
                className={`demo-tab ${activeTab === 'call' ? 'active' : ''}`}
                onClick={() => setActiveTab('call')}
              >
                <span className="tab-icon">📞</span>
                Call Flow
              </button>
              <button 
                className={`demo-tab ${activeTab === 'waitlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('waitlist')}
              >
                <span className="tab-icon">⏰</span>
                Waitlist
              </button>
              <button 
                className={`demo-tab ${activeTab === 'prescription' ? 'active' : ''}`}
                onClick={() => setActiveTab('prescription')}
              >
                <span className="tab-icon">💊</span>
                Prescription
              </button>
              <button 
                className={`demo-tab ${activeTab === 'audit' ? 'active' : ''}`}
                onClick={() => setActiveTab('audit')}
              >
                <span className="tab-icon">📋</span>
                Audit Logs
              </button>
            </div>

            {/* Main Demo Area */}
            <div className="demo-main-area">
              {/* Left Panel - Voice Interface */}
              <div className="voice-interface">
                <div className="interface-header">
                  <h3>Voice Call Simulation</h3>
                  <div className="recording-status">
                    <div className={`status-indicator ${isRecording ? 'recording' : ''}`}></div>
                    <span>{isRecording ? 'Recording...' : 'Ready'}</span>
                  </div>
                </div>

                <div className="voice-controls">
                  <button 
                    className={`record-btn ${isRecording ? 'recording' : ''}`}
                    onClick={handleRecord}
                    disabled={loading}
                  >
                    <span className="btn-icon">
                      {isRecording ? '⏹️' : '🎤'}
                    </span>
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>

                  <div className="voice-visualizer">
                    {isRecording && (
                      <div className="sound-waves">
                        {[...Array(10)].map((_, i) => (
                          <div 
                            key={i}
                            className="sound-bar"
                            style={{
                              height: `${Math.random() * 60 + 20}%`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="transcript-container">
                  <h4>Transcript</h4>
                  <div className="transcript-box">
                    {transcript ? (
                      <div className="transcript-content">
                        <div className="language-badge">German 🇩🇪</div>
                        <p>{transcript}</p>
                      </div>
                    ) : (
                      <div className="transcript-placeholder">
                        <span className="placeholder-icon">🎤</span>
                        <p>Click "Start Recording" to simulate a patient call</p>
                        <small>Or try these examples:</small>
                        <div className="example-transcripts">
                          {exampleTranscripts.map((example, idx) => (
                            <button 
                              key={idx}
                              className="example-btn"
                              onClick={() => {
                                setTranscript(example.text);
                                simulateAgentProcessing();
                              }}
                            >
                              {example.language} Example
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - AI Processing */}
              <div className="ai-processing">
                <div className="processing-header">
                  <h3>AI Processing Pipeline</h3>
                  {loading && (
                    <div className="processing-indicator">
                      <div className="spinner"></div>
                      <span>Processing...</span>
                    </div>
                  )}
                </div>

                <div className="processing-steps">
                  {/* Step 1: ASR */}
                  <div className={`processing-step ${transcript ? 'completed' : ''}`}>
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h5>Speech Recognition</h5>
                      <p>Audio → Text transcription</p>
                      {transcript && (
                        <span className="step-status">✓ Completed</span>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Agent */}
                  <div className={`processing-step ${aiResponse ? 'completed' : ''}`}>
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h5>Intent Analysis</h5>
                      <p>Extract slots & intent</p>
                      {aiResponse && (
                        <span className="step-status">✓ Completed</span>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Patient Lookup */}
                  <div className={`processing-step ${patientData ? 'completed' : ''}`}>
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h5>Patient Identification</h5>
                      <p>Find patient record</p>
                      {patientData && (
                        <span className="step-status">
                          ✓ Found: {patientData.first_name} {patientData.last_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Booking */}
                  <div className={`processing-step ${bookingConfirmed ? 'completed' : ''}`}>
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h5>Appointment Booking</h5>
                      <p>Schedule & confirm</p>
                      {bookingConfirmed && (
                        <span className="step-status">✓ Confirmed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* JSON Output */}
                <div className="json-output">
                  <h4>AI Agent Output</h4>
                  <pre className="json-content">
                    {aiResponse || '{"message": "Waiting for voice input..."}'}
                  </pre>
                </div>

                {/* Patient Data */}
                {patientData && (
                  <div className="patient-data">
                    <h4>Patient Record</h4>
                    <div className="patient-card">
                      <div className="patient-id">ID: {patientData.id}</div>
                      <div className="patient-name">{patientData.first_name} {patientData.last_name}</div>
                      <div className="patient-details">
                        <div>Birthdate: {patientData.birthdate}</div>
                        <div>Phone: {patientData.phone}</div>
                        <div>Email: {patientData.email}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Available Slots */}
                {slots.length > 0 && !selectedSlot && (
                  <div className="available-slots">
                    <h4>Available Appointment Slots</h4>
                    <div className="slots-grid">
                      {slots.map(slot => (
                        <div 
                          key={slot.id}
                          className="slot-card"
                          onClick={() => handleSlotSelect(slot)}
                        >
                          <div className="slot-doctor">{slot.doctor}</div>
                          <div className="slot-time">{formatDate(slot.start)}</div>
                          <div className="slot-service">{slot.service}</div>
                          <button className="slot-select-btn">Select</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Panel - Results */}
            <div className="demo-results">
              {/* Consent Modal */}
              {showConsent && (
                <div className="consent-modal">
                  <div className="consent-content">
                    <h3>Patient Consent Required</h3>
                    <div className="consent-text">
                      <p>Danke Frau Meier. Dürfte ich kurz Ihre Einwilligung erhalten, in Ihrer Akte nachzusehen und mögliche Termine vorzuschlagen?</p>
                      <p className="consent-details">
                        <strong>Appointment Details:</strong><br />
                        Doctor: {selectedSlot.doctor}<br />
                        Time: {formatDate(selectedSlot.start)}<br />
                        Service: {selectedSlot.service}
                      </p>
                    </div>
                    <div className="consent-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleConsent(true)}
                      >
                        Ja, ich stimme zu
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleConsent(false)}
                      >
                        Nein, danke
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Confirmation */}
              {bookingConfirmed && (
                <div className="booking-confirmation">
                  <div className="confirmation-icon">✅</div>
                  <h3>Appointment Booked Successfully!</h3>
                  <div className="confirmation-details">
                    <p><strong>Patient:</strong> {patientData.first_name} {patientData.last_name}</p>
                    <p><strong>Appointment:</strong> {formatDate(selectedSlot.start)}</p>
                    <p><strong>Doctor:</strong> {selectedSlot.doctor}</p>
                    <p><strong>Confirmation:</strong> SMS sent to {patientData.phone}</p>
                  </div>
                  <div className="doctor-summary">
                    <h4>Doctor's Summary</h4>
                    <p>Patient {patientData.first_name} {patientData.last_name} (DOB: {patientData.birthdate}) 
                    booked for {selectedSlot.service} with {selectedSlot.doctor} on {formatDate(selectedSlot.start)}. 
                    Reason: Routine-Vorsorge. Urgency: Medium.</p>
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <div className="demo-controls">
                <button 
                  className="btn btn-outline"
                  onClick={handleReset}
                >
                  Reset Demo
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => toast.info('Exporting demo data...')}
                >
                  Export Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Demo (Tab Content) */}
      {activeTab === 'waitlist' && (
        <section className="waitlist-demo">
          <div className="container">
            <h2>Waitlist Automation Demo</h2>
            <p>See how our AI automatically fills cancelled appointments</p>
            <div className="waitlist-simulation">
              {/* Waitlist simulation content */}
            </div>
          </div>
        </section>
      )}

      {/* Prescription Demo (Tab Content) */}
      {activeTab === 'prescription' && (
        <section className="prescription-demo">
          <div className="container">
            <h2>Prescription AI Demo</h2>
            <p>Watch how prescription renewals are handled automatically</p>
            <div className="prescription-simulation">
              {/* Prescription simulation content */}
            </div>
          </div>
        </section>
      )}

      {/* Audit Logs (Tab Content) */}
      {activeTab === 'audit' && (
        <section className="audit-demo">
          <div className="container">
            <h2>Audit Logs</h2>
            <p>Complete transparency with every action logged</p>
            <div className="audit-logs">
              {auditLogs.length > 0 ? (
                <div className="logs-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Action</th>
                        <th>Patient</th>
                        <th>Details</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id}>
                          <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                          <td>{log.action}</td>
                          <td>{log.patient}</td>
                          <td>{log.slot}</td>
                          <td><span className="status-badge completed">{log.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-logs">
                  <p>No audit logs yet. Run the demo to see logs here.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="demo-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Practice?</h2>
            <p>Join hundreds of GP practices already using MadiCare Pro</p>
            <div className="cta-actions">
              <a href="/contact" className="btn btn-primary btn-lg">
                Request Enterprise Demo
              </a>
              <a href="/pricing" className="btn btn-outline btn-lg">
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Hidden audio for success sound */}
      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3" />
    </div>
  );
};

export default Demo;