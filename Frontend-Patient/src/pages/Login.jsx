import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-content">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Sign in to access your personal healthcare dashboard</p>
            </div>
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">
                  <span className="input-icon">✉️</span>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <span className="input-icon">🔒</span>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="form-options">
                <label className="checkbox">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>Or continue with</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-btn google">
                <span className="social-icon">🔍</span>
                Google
              </button>
              <button type="button" className="social-btn apple">
                <span className="social-icon">🍎</span>
                Apple
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="link">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-illustration">
            <div className="illustration-header">
              <h3>Your Health Journey Starts Here</h3>
              <p>
                Access your medical records, schedule appointments, 
                and connect with healthcare providers—all in one place.
              </p>
            </div>
            
            <div className="features">
              <div className="feature">
                <div className="feature-icon">📱</div>
                <div className="feature-content">
                  <h4>Easy Scheduling</h4>
                  <p>Book appointments 24/7 from anywhere</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🔒</div>
                <div className="feature-content">
                  <h4>Secure & Private</h4>
                  <p>HIPAA compliant data protection</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">📊</div>
                <div className="feature-content">
                  <h4>Health Tracking</h4>
                  <p>Monitor your health progress easily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;