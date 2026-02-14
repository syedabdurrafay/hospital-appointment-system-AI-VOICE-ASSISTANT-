import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './VoiceAssistant.css';

const VoiceAssistant = () => {
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [identifiedPatient, setIdentifiedPatient] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Fallback voice loader
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("🔊 Voices loaded:", voices.length);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceCommand(finalTranscript);
          recognitionRef.current.stop();
        } else if (interimTranscript) {
          setTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          setResponse("I didn't hear anything. Please click 'Start Listening' and speak again.");
          // No auto-speak here to avoid loop if background noise is frequent
        } else if (event.error === 'not-allowed') {
          alert("Microphone access denied. Please allow microphone permissions.");
        }
      };
    } else {
      console.warn('Speech recognition not supported');
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking) {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  const processVoiceCommand = async (command) => {
    setIsProcessing(true);

    console.log('🎤 Processing voice command:', command);

    try {
      // Call backend AI endpoint (New Python-backed endpoint)
      console.log('📡 Calling AI Process-Voice API');

      const res = await api.post('/ai/process-voice', {
        text: command,
        patientId: user?._id || identifiedPatient?.id || null,
        history: conversationHistory,
      });

      console.log('✅ API Response:', res.data);

      if (res.data.success) {
        const { structuredData, doctorSummary, conversation, bookingResult } = res.data;

        // Use the AI's conversational response if available, otherwise construct one
        const aiResponse = conversation && conversation.length > 1
          ? conversation[conversation.length - 1].content
          : (bookingResult?.success ? bookingResult.message : "I've processed your request.");

        setResponse(aiResponse);

        // Store identified patient if returned in booking result
        if (bookingResult?.patientId) {
          setIdentifiedPatient({ id: bookingResult.patientId });
        }

        // Update conversation history
        setConversationHistory(conversation || [
          ...conversationHistory,
          { role: 'user', content: command },
          { role: 'assistant', content: aiResponse }
        ]);

        // Speak the response
        speak(aiResponse);

        if (bookingResult && bookingResult.success) {
          console.log('📅 Appointment Booked:', bookingResult);
        }
      } else {
        const errorMsg = res.data.message || "I'm sorry, I couldn't process that. Please try again.";
        console.error('❌ API returned error:', errorMsg);
        setResponse(errorMsg);
        speak(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error processing voice command:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMsg = "I'm having trouble connecting. ";

      if (error.response?.status === 500) {
        errorMsg += "The AI service might not be configured properly. Please check if the API key is set.";
      } else if (error.response?.data?.message) {
        errorMsg += error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMsg += "Please check if the backend server is running.";
      } else {
        errorMsg += "Please try again.";
      }

      setResponse(errorMsg);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = (text) => {
    if (!text || !window.speechSynthesis) return;

    console.log("🔊 AI speaking:", text);

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Select a pleasant voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.name.includes('Google US English') ||
      voice.name.includes('Female') ||
      voice.name.includes('Samantha') ||
      voice.name.includes('Google') ||
      voice.lang.startsWith('en')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      console.log("🔊 Speech finished");
    };

    utterance.onerror = (err) => {
      console.error("🔊 Speech synthesis error:", err);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleAssistant = () => {
    if (!isVisible) {
      setIsVisible(true);
      // Greet the user when opening
      setTimeout(() => {
        const greeting = user ? `Hello ${user.firstName}! I'm your AI Clinic Receptionist. How can I help you book an appointment today?` : "Hello! I'm your AI Clinic Receptionist. How can I help you book an appointment today?";
        setResponse(greeting);
        speak(greeting);
      }, 300);
    } else {
      setIsVisible(false);
      stopListening();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  };

  const resetConversation = () => {
    setConversationHistory([]);
    setTranscript('');
    setResponse('');
    const msg = "Conversation reset. How can I help you with your clinic booking?";
    setResponse(msg);
    speak(msg);
  };

  return (
    <>
      <button className="voice-assistant-toggle" onClick={toggleAssistant} title="AI Clinic Assistant">
        <span className="assistant-icon">🎙️</span>
        {isListening && <span className="pulse-ring"></span>}
      </button>

      {isVisible && (
        <div className="voice-assistant-container">
          <div className="assistant-header">
            <h3>🏥 AI Clinic Assistant</h3>
            <div className="header-actions">
              <button className="reset-btn" onClick={resetConversation} title="Reset conversation">
                🔄
              </button>
              <button className="close-btn" onClick={toggleAssistant}>×</button>
            </div>
          </div>

          <div className="assistant-body">
            <div className="status-indicator">
              <div className={`pulse ${isListening ? 'listening' : isSpeaking ? 'speaking' : ''}`}>
                {isListening ? '🎤' : isSpeaking ? '🔊' : '💬'}
              </div>
              <span>
                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isProcessing ? 'Thinking...' : 'Ready'}
              </span>
            </div>

            <div className="conversation-display">
              <div className="transcript-box">
                <h4>You said:</h4>
                <p className="transcript">{transcript || 'Click "Start Listening" to speak...'}</p>
              </div>

              <div className="response-box">
                <h4>Assistant:</h4>
                <p className="response">{response || 'Waiting for your message...'}</p>
              </div>
            </div>

            <div className="controls">
              <button
                className={`listen-btn ${isListening ? 'active' : ''}`}
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking || isProcessing}
              >
                {isListening ? '⏹️ Stop Listening' : '🎤 Start Listening'}
              </button>
            </div>

            <div className="quick-commands">
              <h4>Try saying:</h4>
              <div className="commands-list">
                <span onClick={() => processVoiceCommand("I am Anna Meier, DOB 12.03.1985. I need to book an appointment.")}>"I'm [Name], DOB [Date]. I need to book..."</span>
                <span onClick={() => processVoiceCommand("Which doctors are available tomorrow?")}>"Which doctors are available tomorrow?"</span>
                <span onClick={() => processVoiceCommand("Book an appointment with Dr. Schmidt for next Monday at 10 AM")}>"Book with Dr. X for [Date] at [Time]"</span>
              </div>
            </div>

            {conversationHistory.length > 0 && (
              <div className="conversation-history">
                <h4>Conversation History:</h4>
                <div className="history-items">
                  {conversationHistory.slice(-6).map((msg, idx) => (
                    <div key={idx} className={`history-item ${msg.role}`}>
                      <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong>
                      <span>{msg.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;