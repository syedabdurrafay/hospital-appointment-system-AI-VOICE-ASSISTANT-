import { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { userService } from '../../services/api';
import {
  HiUser,
  HiMail,
  HiPhone,
  HiCalendar,
  HiLockClosed,
  HiIdentification,
  HiAcademicCap,
  HiPhotograph,
  HiUpload,
  HiArrowLeft,
  HiBriefcase
} from 'react-icons/hi';
import Button from '../Common/Button';
import './DoctorForm.css';

const DoctorForm = () => {
  const { language } = useContext(AppContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    password: '',
    confirmPassword: '',
    specialization: 'General Physician',
    experience: '',
    qualification: 'MBBS',
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    en: {
      title: isEditing ? 'Edit Doctor' : 'Add New Doctor',
      subtitle: isEditing ? 'Update doctor information' : 'Register a new doctor for the clinic',
      personalInfo: 'Personal Information',
      contactInfo: 'Contact Information',
      professionalInfo: 'Professional Information',
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
      specialization: 'Specialization',
      selectSpecialization: 'Select Specialization',
      experience: 'Experience (Years)',
      qualification: 'Qualification',
      uploadPhoto: 'Upload Photo',
      changePhoto: 'Change Photo',
      removePhoto: 'Remove Photo',
      saveDoctor: isEditing ? 'Update Doctor' : 'Register Doctor',
      cancel: 'Cancel',
      success: isEditing ? 'Doctor updated successfully' : 'Doctor registered successfully',
      error: 'Operation failed',
      required: 'This field is required',
      emailInvalid: 'Please enter a valid email',
      phoneInvalid: 'Please enter a valid phone number',
      aadharInvalid: 'Aadhar must be 12 digits',
      passwordMismatch: 'Passwords do not match'
    },
    de: {
      title: isEditing ? 'Arzt bearbeiten' : 'Neuen Arzt hinzufügen',
      subtitle: isEditing ? 'Arztinformationen aktualisieren' : 'Registrieren Sie einen neuen Arzt für die Klinik',
      personalInfo: 'Persönliche Informationen',
      contactInfo: 'Kontaktinformationen',
      professionalInfo: 'Berufliche Informationen',
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
      specialization: 'Spezialisierung',
      selectSpecialization: 'Spezialisierung auswählen',
      experience: 'Erfahrung (Jahre)',
      qualification: 'Qualifikation',
      uploadPhoto: 'Foto hochladen',
      changePhoto: 'Foto ändern',
      removePhoto: 'Foto entfernen',
      saveDoctor: isEditing ? 'Arzt aktualisieren' : 'Arzt registrieren',
      cancel: 'Abbrechen',
      success: isEditing ? 'Arzt erfolgreich aktualisiert' : 'Arzt erfolgreich registriert',
      error: 'Vorgang fehlgeschlagen',
      required: 'Dieses Feld ist erforderlich',
      emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      phoneInvalid: 'Bitte geben Sie eine gültige Telefonnummer ein',
      aadharInvalid: 'Aadhar muss 12-stellig sein',
      passwordMismatch: 'Passwörter stimmen nicht überein'
    }
  };

  const t = translations[language];

  const specializations = [
    'General Physician',
    'Family Medicine',
    'Internal Medicine',
    'Pediatrics',
    'Geriatrics',
    'Emergency Medicine'
  ];

  const qualifications = [
    'MBBS',
    'MD',
    'MS',
    'DNB',
    'MCh',
    'DM'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, avatar: 'File size must be less than 5MB' }));
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setErrors(prev => ({ ...prev, avatar: 'Only JPEG, PNG, and GIF images are allowed' }));
        return;
      }

      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);

      if (errors.avatar) {
        setErrors(prev => ({ ...prev, avatar: '' }));
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dob', 'gender'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation for new doctors
    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'This field is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'This field is required';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (avatar) {
        data.append('doctrAvatar', avatar);
      }

      await userService.addDoctor(data);

      // Success
      alert(isEditing ? 'Doctor updated successfully' : 'Doctor registered successfully');
      navigate('/doctors');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/doctors');
  };

  return (
    <div className="doctor-form-page fade-in">
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

      <form onSubmit={handleSubmit} className="doctor-form">
        <div className="form-grid">
          {/* Left column - Personal Info & Photo */}
          <div className="form-section">
            <div className="section-header">
              <HiUser className="section-icon" />
              <h3 className="section-title">{t.personalInfo}</h3>
            </div>

            {/* Avatar Upload */}
            <div className="avatar-upload">
              <div className="avatar-container">
                <div className="avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="avatar-image" />
                  ) : (
                    <div className="avatar-placeholder">
                      <HiUser className="avatar-icon" />
                    </div>
                  )}
                </div>
                <div className="avatar-actions">
                  <label className="avatar-btn">
                    <HiUpload className="btn-icon" />
                    {avatarPreview ? t.changePhoto : t.uploadPhoto}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="avatar-input"
                    />
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="avatar-btn remove-btn"
                    >
                      {t.removePhoto}
                    </button>
                  )}
                </div>
              </div>
              {errors.avatar && <span className="error-message">{errors.avatar}</span>}
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
                  <option value="Male">{t.male}</option>
                  <option value="Female">{t.female}</option>
                  <option value="Other">{t.other}</option>
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
          </div>

          {/* Middle column - Contact & Professional Info */}
          <div className="form-section">
            <div className="section-header">
              <HiMail className="section-icon" />
              <h3 className="section-title">{t.contactInfo}</h3>
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
                  placeholder="doctor@clinic.com"
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

            <div className="section-header">
              <HiBriefcase className="section-icon" />
              <h3 className="section-title">{t.professionalInfo}</h3>
            </div>

            <div className="form-group">
              <label className="form-label">{t.specialization}</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">{t.selectSpecialization}</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.experience}</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="5"
                  min="0"
                  max="50"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.qualification}</label>
                <select
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  {qualifications.map(qual => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right column - Security Info */}
          {!isEditing && (
            <div className="form-section">
              <div className="section-header">
                <HiLockClosed className="section-icon" />
                <h3 className="section-title">{t.securityInfo}</h3>
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

              <div className="password-note">
                <p className="note-text">
                  {language === 'en'
                    ? 'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.'
                    : 'Das Passwort muss mindestens 8 Zeichen lang sein und Großbuchstaben, Kleinbuchstaben, Zahlen und Sonderzeichen enthalten.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            {t.cancel}
          </Button>
          <Button type="submit" variant="primary">
            {t.saveDoctor}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;