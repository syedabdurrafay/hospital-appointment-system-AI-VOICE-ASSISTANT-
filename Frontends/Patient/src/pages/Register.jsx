import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    aadhar: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.phone && formData.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }
    
    if (formData.aadhar && formData.aadhar.length !== 12) {
      toast.error('Aadhar number must be 12 digits');
      return;
    }
    
    setLoading(true);

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      aadhar: formData.aadhar,
      gender: formData.gender,
      password: formData.password,
      role: 'Patient',
    };

    const result = await register(userData);

    if (result.success) {
      toast.success('Registration successful! Welcome to MediCare Pro');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
    }
    
    setLoading(false);
  };

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-content">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Join thousands of patients who trust us with their healthcare</p>
            </div>
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">
                    <span className="input-icon">👤</span>
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">
                    <span className="input-icon">👤</span>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="email">
                    <span className="input-icon">✉️</span>
                    Email Address *
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
                  <label htmlFor="phone">
                    <span className="input-icon">📱</span>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="aadhar">
                    <span className="input-icon">🆔</span>
                    Aadhar Number *
                  </label>
                  <input
                    type="text"
                    id="aadhar"
                    name="aadhar"
                    value={formData.aadhar}
                    onChange={handleChange}
                    placeholder="12-digit Aadhar number"
                    maxLength="12"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="dob">
                    <span className="input-icon">📅</span>
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="gender">
                    <span className="input-icon">⚤</span>
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">
                    <span className="input-icon">🔒</span>
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                    minLength="6"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <span className="input-icon">🔒</span>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  minLength="6"
                />
              </div>

              <div className="form-options">
                <label className="checkbox">
                  <input 
                    type="checkbox" 
                    name="terms"
                    required
                  />
                  <span>
                    I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                  </span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>Or sign up with</span>
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
                Already have an account?{' '}
                <Link to="/login" className="link">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-illustration">
            <div className="illustration-header">
              <h3>Start Your Health Journey</h3>
              <p>
                Create your account today and get access to premium healthcare services and features.
              </p>
            </div>
            
            <div className="features">
              <div className="feature">
                <div className="feature-icon">📱</div>
                <div className="feature-content">
                  <h4>Easy Appointment Booking</h4>
                  <p>Book appointments with specialists in minutes</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🏥</div>
                <div className="feature-content">
                  <h4>24/7 Access</h4>
                  <p>Access medical records anytime, anywhere</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">💬</div>
                <div className="feature-content">
                  <h4>Doctor Consultation</h4>
                  <p>Chat with doctors for quick medical advice</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">📊</div>
                <div className="feature-content">
                  <h4>Health Tracking</h4>
                  <p>Monitor your health progress with our tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;