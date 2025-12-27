import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { HiMail, HiLockClosed, HiOutlineLogin, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { setIsAuthenticated, setUser, language, setLanguage } = useContext(AppContext);
  const navigate = useNavigate();

  const translations = {
    en: {
      title: 'HealthCare Pro',
      subtitle: 'Hospital Management System',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      login: 'Sign In',
      adminOnly: 'Administrator Access Only',
      switchToGerman: 'Switch to German',
      switchToEnglish: 'Switch to English',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email',
      passwordRequired: 'Password is required',
      passwordMismatch: 'Passwords do not match',
      demoCredentials: 'Demo: admin@healthcare.com / password123'
    },
    de: {
      title: 'HealthCare Pro',
      subtitle: 'Krankenhausverwaltungssystem',
      email: 'E-Mail-Adresse',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      login: 'Anmelden',
      adminOnly: 'Nur Administratorzugriff',
      switchToGerman: 'Auf Deutsch wechseln',
      switchToEnglish: 'Auf Englisch wechseln',
      emailRequired: 'E-Mail ist erforderlich',
      emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      passwordRequired: 'Passwort ist erforderlich',
      passwordMismatch: 'Passwörter stimmen nicht überein',
      demoCredentials: 'Demo: admin@healthcare.com / password123'
    }
  };

  const t = translations[language];

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = t.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t.emailInvalid;
    }

    if (!password) {
      newErrors.password = t.passwordRequired;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t.passwordRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t.passwordMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const resp = await fetch('/api/user/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Login failed');
      }
      // backend sets adminToken cookie; store user in context
      setIsAuthenticated(true);
      setUser(data.user || data.user);
      // Persist token locally as fallback for Authorization header
      if (data.token) {
        try {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('token', data.token);
        } catch (e) {
          console.warn('Failed to persist token to localStorage', e);
        }
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error', err);
      setErrors(prev => ({ ...prev, form: err.message || 'Login failed' }));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@healthcare.com');
    setPassword('password123');
    setConfirmPassword('password123');
  };

  return (
    <div className="login-page">
      <div className="language-toggle">
        <button 
          onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
          className="lang-btn"
        >
          {language === 'en' ? t.switchToGerman : t.switchToEnglish}
        </button>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <span className="logo-icon">🏥</span>
              <h1 className="logo-text">{t.title}</h1>
            </div>
            <p className="login-subtitle">{t.subtitle}</p>
          </div>

          <div className="login-alert">
            <HiUser className="alert-icon" />
            <span>{t.adminOnly}</span>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">{t.email}</label>
              <div className="input-group">
                <HiMail className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="admin@healthcare.com"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">{t.password}</label>
              <div className="input-group">
                <HiLockClosed className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">{t.confirmPassword}</label>
              <div className="input-group">
                <HiLockClosed className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="••••••••"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                >
                  {showConfirmPassword ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <HiOutlineLogin className="btn-icon" />
                  {t.login}
                </>
              )}
            </button>

            <div className="demo-section">
              <button 
                type="button"
                onClick={handleDemoLogin}
                className="demo-btn"
              >
                {t.demoCredentials}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;