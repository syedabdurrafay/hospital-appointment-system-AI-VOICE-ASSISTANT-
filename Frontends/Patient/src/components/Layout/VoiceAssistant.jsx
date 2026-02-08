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
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
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
        if (event.error === 'no-speech') {
          speak("I didn't hear anything. Please try again.");
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
      // Call backend AI endpoint
      console.log('📡 Calling AI Chat API');

      const response = await api.post('/ai/chat', {
        message: command,
        history: conversationHistory,
        context: {
          user: user || null
        }
      });

      console.log('✅ API Response:', response.data);

      if (response.data.success) {
        const aiResponse = response.data.response;
        setResponse(aiResponse);

        // Update conversation history
        setConversationHistory(response.data.conversationHistory || [
          ...conversationHistory,
          { role: 'user', content: command },
          { role: 'assistant', content: aiResponse }
        ]);

        // Speak the response
        speak(aiResponse);
      } else {
        const errorMsg = response.data.message || "I'm sorry, I couldn't process that. Please try again.";
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
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select a pleasant voice if available
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Google')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        // Auto-restart listening after AI finishes speaking
        if (isVisible) {
          setTimeout(() => {
            startListening();
          }, 500);
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    }
  };

  const toggleAssistant = () => {
    if (!isVisible) {
      setIsVisible(true);
      // Greet the user when opening
      setTimeout(() => {
        const greeting = user ? `Hello ${user.firstName}! I'm your AI hospital assistant. How can I help you today?` : "Hello! I'm your AI hospital assistant. How can I help you today?";
        setResponse(greeting);
        speak(greeting);
      }, 300);
    } else {
      setIsVisible(false);
      stopListening();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setIsSpeaking(false);
    }
  };

  const resetConversation = () => {
    setConversationHistory([]);
    setTranscript('');
    setResponse('');
    const msg = "Conversation reset. How can I help you?";
    setResponse(msg);
    speak(msg);
  };

  return (
    <>
      <button className="voice-assistant-toggle" onClick={toggleAssistant} title="AI Voice Assistant">
        <span className="assistant-icon">🎙️</span>
        {isListening && <span className="pulse-ring"></span>}
      </button>

      {isVisible && (
        <div className="voice-assistant-container">
          <div className="assistant-header">
            <h3>🏥 AI Hospital Assistant</h3>
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
                <span>"I need to book an appointment"</span>
                <span>"Check available slots"</span>
                <span>"Book for tomorrow"</span>
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