import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { 
  HiUser, 
  HiMail, 
  HiPhone, 
  HiCalendar, 
  HiLockClosed, 
  HiIdentification,
  HiArrowLeft,
  HiKey,
  HiShieldCheck
} from 'react-icons/hi';
import Button from '../Common/Button';
import './AdminForm.css';

const AdminForm = () => {
  const { language } = useContext(AppContext);
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
    confirmPassword: '',
    role: 'admin',
  });

  const [errors, setErrors] = useState({});

  const translations = {
    en: {
      title: 'Add New Staff Member',
      subtitle: 'Register a new staff member for the clinic',
      personalInfo: 'Personal Information',
      securityInfo: 'Security Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      dob: 'Date of Birth',
      aadhar: 'Aadhar Number',
      gender: 'Gender',
      selectGender: 'Select Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      role: 'Role',
      selectRole: 'Select Role',
      admin: 'Administrator',
      receptionist: 'Receptionist',
      nurse: 'Nurse',
      saveAdmin: 'Register Staff',
      cancel: 'Cancel',
      success: 'Staff member registered successfully',
      error: 'Registration failed',
      required: 'This field is required',
      emailInvalid: 'Please enter a valid email',
      phoneInvalid: 'Please enter a valid phone number',
      aadharInvalid: 'Aadhar must be 12 digits',
      passwordMismatch: 'Passwords do not match',
      passwordRequirements: 'Password Requirements:',
      minChars: 'Minimum 8 characters',
      oneUppercase: 'At least one uppercase letter',
      oneLowercase: 'At least one lowercase letter',
      oneNumber: 'At least one number',
      oneSpecial: 'At least one special character'
    },
    de: {
      title: 'Neuen Mitarbeiter hinzufügen',
      subtitle: 'Registrieren Sie einen neuen Mitarbeiter für die Klinik',
      personalInfo: 'Persönliche Informationen',
      securityInfo: 'Sicherheitsinformationen',
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail-Adresse',
      phone: 'Telefonnummer',
      dob: 'Geburtsdatum',
      aadhar: 'Aadhar-Nummer',
      gender: 'Geschlecht',
      selectGender: 'Geschlecht auswählen',
      male: 'Männlich',
      female: 'Weiblich',
      other: 'Andere',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      role: 'Rolle',
      selectRole: 'Rolle auswählen',
      admin: 'Administrator',
      receptionist: 'Rezeptionist',
      nurse: 'Krankenschwester',
      saveAdmin: 'Mitarbeiter registrieren',
      cancel: 'Abbrechen',
      success: 'Mitarbeiter erfolgreich registriert',
      error: 'Registrierung fehlgeschlagen',
      required: 'Dieses Feld ist erforderlich',
      emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      phoneInvalid: 'Bitte geben Sie eine gültige Telefonnummer ein',
      aadharInvalid: 'Aadhar muss 12-stellig sein',
      passwordMismatch: 'Passwörter stimmen nicht überein',
      passwordRequirements: 'Passwortanforderungen:',
      minChars: 'Mindestens 8 Zeichen',
      oneUppercase: 'Mindestens ein Großbuchstabe',
      oneLowercase: 'Mindestens ein Kleinbuchstabe',
      oneNumber: 'Mindestens eine Zahl',
      oneSpecial: 'Mindestens ein Sonderzeichen'
    }
  };

  const t = translations[language];

  const roles = [
    { value: 'admin', label: t.admin, icon: <HiKey /> },
    { value: 'receptionist', label: t.receptionist, icon: <HiUser /> },
    { value: 'nurse', label: t.nurse, icon: <HiShieldCheck /> }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dob', 'gender', 'password', 'confirmPassword'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = t.required;
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = t.phoneInvalid;
    }

    if (formData.aadhar && !/^\d{12}$/.test(formData.aadhar)) {
      newErrors.aadhar = t.aadharInvalid;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordMismatch;
    }

    // Password strength validation
    if (formData.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = t.passwordRequirements;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Simulate API call
    console.log('Staff form submitted:', formData);
    
    // Navigate back
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="admin-form-page fade-in">
      <div className="form-header">
        <button className="back-btn" onClick={handleCancel}>
          <HiArrowLeft />
          <span>{language === 'en' ? 'Back' : 'Zurück'}</span>
        </button>
        <div className="header-content">
          <h1 className="form-title">{t.title}</h1>
          <p className="form-subtitle">{t.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-grid">
          {/* Personal Information */}
          <div className="form-section">
            <div className="section-header">
              <HiUser className="section-icon" />
              <h3 className="section-title">{t.personalInfo}</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  {t.firstName} <span className="required">*</span>
                </label>
                <div className="input-group">
                  <HiUser className="input-icon" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  {t.lastName} <span className="required">*</span>
                </label>
                <div className="input-group">
                  <HiUser className="input-icon" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  {t.gender} <span className="required">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`form-input ${errors.gender ? 'error' : ''}`}
                >
                  <option value="">{t.selectGender}</option>
                  <option value="male">{t.male}</option>
                  <option value="female">{t.female}</option>
                  <option value="other">{t.other}</option>
                </select>
                {errors.gender && <span className="error-message">{errors.gender}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  {t.dob} <span className="required">*</span>
                </label>
                <div className="input-group">
                  <HiCalendar className="input-icon" />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className={`form-input ${errors.dob ? 'error' : ''}`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.dob && <span className="error-message">{errors.dob}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.aadhar}</label>
              <div className="input-group">
                <HiIdentification className="input-icon" />
                <input
                  type="text"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleInputChange}
                  className={`form-input ${errors.aadhar ? 'error' : ''}`}
                  placeholder="123456789012"
                  maxLength="12"
                />
              </div>
              {errors.aadhar && <span className="error-message">{errors.aadhar}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                {t.email} <span className="required">*</span>
              </label>
              <div className="input-group">
                <HiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="staff@clinic.com"
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                {t.phone} <span className="required">*</span>
              </label>
              <div className="input-group">
                <HiPhone className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="9876543210"
                  maxLength="10"
                />
              </div>
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>

          {/* Security Information */}
          <div className="form-section">
            <div className="section-header">
              <HiLockClosed className="section-icon" />
              <h3 className="section-title">{t.securityInfo}</h3>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                {t.role} <span className="required">*</span>
              </label>
              <div className="role-selector">
                {roles.map(role => (
                  <label 
                    key={role.value} 
                    className={`role-option ${formData.role === role.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleInputChange}
                      className="role-radio"
                    />
                    <div className="role-content">
                      <div className="role-icon">{role.icon}</div>
                      <div className="role-info">
                        <span className="role-title">{role.label}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {t.password} <span className="required">*</span>
              </label>
              <div className="input-group">
                <HiLockClosed className="input-icon" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                {t.confirmPassword} <span className="required">*</span>
              </label>
              <div className="input-group">
                <HiLockClosed className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="password-requirements">
              <p className="requirements-title">{t.passwordRequirements}</p>
              <ul className="requirements-list">
                <li className={`requirement ${formData.password.length >= 8 ? 'met' : ''}`}>
                  • {t.minChars}
                </li>
                <li className={`requirement ${/[A-Z]/.test(formData.password) ? 'met' : ''}`}>
                  • {t.oneUppercase}
                </li>
                <li className={`requirement ${/[a-z]/.test(formData.password) ? 'met' : ''}`}>
                  • {t.oneLowercase}
                </li>
                <li className={`requirement ${/\d/.test(formData.password) ? 'met' : ''}`}>
                  • {t.oneNumber}
                </li>
                <li className={`requirement ${/[@$!%*?&]/.test(formData.password) ? 'met' : ''}`}>
                  • {t.oneSpecial}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            {t.cancel}
          </Button>
          <Button type="submit" variant="primary">
            {t.saveAdmin}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminForm;