import { useState, useEffect, useRef } from 'react';
import './VoiceAssistant.css';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const currentTranscript = event.results[0][0].transcript;
        setTranscript(currentTranscript);
        processVoiceCommand(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    } else {
      console.warn('Speech recognition not supported');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
      setResponse('');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    let responseText = '';

    if (lowerCommand.includes('book appointment') || lowerCommand.includes('appointment')) {
      responseText = "I'll help you book an appointment. Please visit the appointments page to schedule.";
      window.location.href = '/appointment';
    } else if (lowerCommand.includes('login') || lowerCommand.includes('sign in')) {
      responseText = "Taking you to the login page. Please sign in to access your account.";
      window.location.href = '/login';
    } else if (lowerCommand.includes('register') || lowerCommand.includes('sign up')) {
      responseText = "Let's create your account. Taking you to the registration page.";
      window.location.href = '/register';
    } else if (lowerCommand.includes('contact') || lowerCommand.includes('call')) {
      responseText = "You can contact us at 1-800-MEDICAL or email support@healthcare.com";
      // Simulate call initiation
      simulateCall();
    } else if (lowerCommand.includes('departments')) {
      responseText = "We have Cardiology, Orthopedics, Neurology, Pediatrics, and more. Check our departments section.";
      document.getElementById('departments')?.scrollIntoView({ behavior: 'smooth' });
    } else if (lowerCommand.includes('emergency')) {
      responseText = "For emergencies, please dial 911 immediately or visit our emergency department.";
    } else if (lowerCommand.includes('hours') || lowerCommand.includes('open')) {
      responseText = "We're open 24/7 for emergencies. Regular hours are 8 AM to 8 PM, Monday to Saturday.";
    } else {
      responseText = "I heard: " + command + ". How can I assist you further?";
    }

    setResponse(responseText);
    speak(responseText);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  const simulateCall = () => {
    // In a real application, this would initiate a phone call or VoIP
    console.log('Initiating call to hospital...');
    // For demo purposes, we'll just show an alert
    alert('Initiating call to hospital reception... Please allow microphone access.');
  };

  const toggleAssistant = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <button className="voice-assistant-toggle" onClick={toggleAssistant}>
        <span className="assistant-icon">🎙️</span>
      </button>

      {isVisible && (
        <div className="voice-assistant-container">
          <div className="assistant-header">
            <h3>AI Voice Assistant</h3>
            <button className="close-btn" onClick={toggleAssistant}>×</button>
          </div>
          
          <div className="assistant-body">
            <div className="status-indicator">
              <div className={`pulse ${isListening ? 'listening' : ''}`}></div>
              <span>{isListening ? 'Listening...' : 'Ready'}</span>
            </div>

            <div className="transcript-box">
              <h4>You said:</h4>
              <p className="transcript">{transcript || 'Speak to get started...'}</p>
            </div>

            <div className="response-box">
              <h4>Response:</h4>
              <p className="response">{response || 'Waiting for your command...'}</p>
            </div>

            <div className="controls">
              <button
                className={`listen-btn ${isListening ? 'active' : ''}`}
                onClick={isListening ? stopListening : startListening}
              >
                {isListening ? '⏹️ Stop Listening' : '🎤 Start Listening'}
              </button>
              
              <button className="speak-btn" onClick={() => speak('How can I help you today?')}>
                🔊 Speak
              </button>
            </div>

            <div className="quick-commands">
              <h4>Try saying:</h4>
              <div className="commands-list">
                <span>"Book an appointment"</span>
                <span>"Contact hospital"</span>
                <span>"Show departments"</span>
                <span>"Emergency help"</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;