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
  HiArrowLeft
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
    department: '',
    permissions: {
      dashboard: true,
      doctors: true,
      appointments: true,
      patients: true,
      messages: true,
      reports: true,
      settings: true
    }
  });

  const [errors, setErrors] = useState({});

  const translations = {
    en: {
      title: 'Add New Administrator',
      subtitle: 'Register a new administrator to the system',
      personalInfo: 'Personal Information',
      securityInfo: 'Security Information',
      permissionsInfo: 'Permissions',
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
      superAdmin: 'Super Administrator',
      department: 'Department',
      selectDepartment: 'Select Department',
      permissions: 'System Permissions',
      dashboard: 'Dashboard Access',
      doctors: 'Doctors Management',
      appointments: 'Appointments Management',
      patients: 'Patients Management',
      messages: 'Messages Access',
      reports: 'Reports Access',
      settings: 'System Settings',
      saveAdmin: 'Register Administrator',
      cancel: 'Cancel',
      success: 'Administrator registered successfully',
      error: 'Registration failed',
      required: 'This field is required',
      emailInvalid: 'Please enter a valid email',
      phoneInvalid: 'Please enter a valid phone number',
      aadharInvalid: 'Aadhar must be 12 digits',
      passwordMismatch: 'Passwords do not match'
    },
    de: {
      title: 'Neuen Administrator hinzufügen',
      subtitle: 'Registrieren Sie einen neuen Administrator im System',
      personalInfo: 'Persönliche Informationen',
      securityInfo: 'Sicherheitsinformationen',
      permissionsInfo: 'Berechtigungen',
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
      superAdmin: 'Super-Administrator',
      department: 'Abteilung',
      selectDepartment: 'Abteilung auswählen',
      permissions: 'Systemberechtigungen',
      dashboard: 'Dashboard-Zugriff',
      doctors: 'Ärzteverwaltung',
      appointments: 'Terminverwaltung',
      patients: 'Patientenverwaltung',
      messages: 'Nachrichtenzugriff',
      reports: 'Berichtszugriff',
      settings: 'Systemeinstellungen',
      saveAdmin: 'Administrator registrieren',
      cancel: 'Abbrechen',
      success: 'Administrator erfolgreich registriert',
      error: 'Registrierung fehlgeschlagen',
      required: 'Dieses Feld ist erforderlich',
      emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      phoneInvalid: 'Bitte geben Sie eine gültige Telefonnummer ein',
      aadharInvalid: 'Aadhar muss 12-stellig sein',
      passwordMismatch: 'Passwörter stimmen nicht überein'
    }
  };

  const t = translations[language];

  const departments = [
    'Administration',
    'HR Department',
    'IT Department',
    'Finance Department',
    'Operations',
    'Quality Assurance',
    'Patient Services'
  ];

  const roles = [
    { value: 'admin', label: t.admin },
    { value: 'superAdmin', label: t.superAdmin }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const handleSelectAllPermissions = () => {
    const allTrue = Object.values(formData.permissions).every(v => v === true);
    const newPermissions = {};
    Object.keys(formData.permissions).forEach(key => {
      newPermissions[key] = !allTrue;
    });
    
    setFormData(prev => ({
      ...prev,
      permissions: newPermissions
    }));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Simulate API call
    console.log('Admin form submitted:', formData);
    
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
                  placeholder="1234 5678 9012"
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
                  placeholder="admin@hospital.com"
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
                  placeholder="1234567890"
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
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">{t.selectRole}</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t.department}</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">{t.selectDepartment}</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
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
              <p className="requirements-title">
                {language === 'en' ? 'Password Requirements:' : 'Passwortanforderungen:'}
              </p>
              <ul className="requirements-list">
                <li className="requirement">• {language === 'en' ? 'Minimum 8 characters' : 'Mindestens 8 Zeichen'}</li>
                <li className="requirement">• {language === 'en' ? 'At least one uppercase letter' : 'Mindestens ein Großbuchstabe'}</li>
                <li className="requirement">• {language === 'en' ? 'At least one lowercase letter' : 'Mindestens ein Kleinbuchstabe'}</li>
                <li className="requirement">• {language === 'en' ? 'At least one number' : 'Mindestens eine Zahl'}</li>
                <li className="requirement">• {language === 'en' ? 'At least one special character' : 'Mindestens ein Sonderzeichen'}</li>
              </ul>
            </div>
          </div>

          {/* Permissions */}
          <div className="form-section">
            <div className="section-header">
              <HiIdentification className="section-icon" />
              <h3 className="section-title">{t.permissionsInfo}</h3>
            </div>
            
            <div className="permissions-header">
              <label className="permissions-label">{t.permissions}</label>
              <button
                type="button"
                onClick={handleSelectAllPermissions}
                className="select-all-btn"
              >
                {language === 'en' ? 'Select All' : 'Alle auswählen'}
              </button>
            </div>

            <div className="permissions-grid">
              {Object.entries(formData.permissions).map(([key, value]) => (
                <div key={key} className="permission-item">
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handlePermissionChange(key)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom"></span>
                    <span className="permission-label">
                      {t[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  </label>
                  <span className="permission-description">
                    {language === 'en' 
                      ? `Access to ${key} module` 
                      : `Zugriff auf ${key}-Modul`}
                  </span>
                </div>
              ))}
            </div>

            <div className="permissions-note">
              <p>
                {language === 'en' 
                  ? 'Note: Super Administrators have access to all modules by default.'
                  : 'Hinweis: Super-Administratoren haben standardmäßig Zugriff auf alle Module.'}
              </p>
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