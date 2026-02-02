import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { HiMail, HiLockClosed, HiOutlineLogin, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import { toast } from 'react-toastify';
import './Login.css';
import { userService } from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { setIsAuthenticated, setUser, language, setLanguage } = useContext(AppContext);
  const navigate = useNavigate();

  const translations = {
    en: {
      title: 'Doctor Portal',
      subtitle: 'Hospital Management System',
      email: 'Email Address',
      password: 'Password',
      login: 'Sign In',
      doctorOnly: 'Doctor Access Only',
      switchToGerman: 'Switch to German',
      switchToEnglish: 'Switch to English',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email',
      passwordRequired: 'Password is required',
    },
    de: {
      title: 'Arztportal',
      subtitle: 'Krankenhausverwaltungssystem',
      email: 'E-Mail-Adresse',
      password: 'Passwort',
      login: 'Anmelden',
      doctorOnly: 'Nur für Ärzte',
      switchToGerman: 'Auf Deutsch wechseln',
      switchToEnglish: 'Auf Englisch wechseln',
      emailRequired: 'E-Mail ist erforderlich',
      emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      passwordRequired: 'Passwort ist erforderlich',
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Attempting login as Doctor...');

      const response = await userService.login(email, password);
      console.log('Login response:', response);

      if (response.success && response.user.role === 'Doctor') {
        setUser(response.user);
        setIsAuthenticated(true);

        if (response.token) {
          localStorage.setItem('doctorToken', response.token);
          localStorage.setItem('token', response.token);
        }

        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        throw new Error('Invalid doctor credentials');
      }
    } catch (err) {
      console.error('Login error details:', err);
      const message = err.response?.data?.message || err.message || 'Login failed';
      setErrors(prev => ({ ...prev, form: message }));
      toast.error(message);
    } finally {
      setLoading(false);
    }
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
              <span className="logo-icon">🩺</span>
              <h1 className="logo-text">{t.title}</h1>
            </div>
            <p className="login-subtitle">{t.subtitle}</p>
          </div>

          <div className="login-alert">
            <HiUser className="alert-icon" />
            <span>{t.doctorOnly}</span>
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
                  placeholder="doctor@healthcare.com"
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

            {errors.form && (
              <div className="form-error">
                <span className="error-message">{errors.form}</span>
              </div>
            )}

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
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;