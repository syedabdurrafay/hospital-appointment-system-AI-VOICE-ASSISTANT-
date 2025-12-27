import { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
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
  HiArrowLeft
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
    aadhar: '',
    gender: '',
    password: '',
    confirmPassword: '',
    department: '',
    specialization: '',
    experience: '',
    qualification: '',
    licenseNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bio: ''
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [errors, setErrors] = useState({});

  const translations = {
    en: {
      title: isEditing ? 'Edit Doctor' : 'Add New Doctor',
      subtitle: isEditing ? 'Update doctor information' : 'Register a new doctor to the system',
      personalInfo: 'Personal Information',
      contactInfo: 'Contact Information',
      professionalInfo: 'Professional Information',
      addressInfo: 'Address Information',
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
      department: 'Department',
      selectDepartment: 'Select Department',
      specialization: 'Specialization',
      experience: 'Experience (Years)',
      qualification: 'Qualification',
      licenseNumber: 'License Number',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      bio: 'Bio/Description',
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
      subtitle: isEditing ? 'Arztinformationen aktualisieren' : 'Registrieren Sie einen neuen Arzt im System',
      personalInfo: 'Persönliche Informationen',
      contactInfo: 'Kontaktinformationen',
      professionalInfo: 'Berufliche Informationen',
      addressInfo: 'Adressinformationen',
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
      department: 'Abteilung',
      selectDepartment: 'Abteilung auswählen',
      specialization: 'Spezialisierung',
      experience: 'Erfahrung (Jahre)',
      qualification: 'Qualifikation',
      licenseNumber: 'Lizenznummer',
      address: 'Adresse',
      city: 'Stadt',
      state: 'Bundesland',
      zipCode: 'PLZ',
      bio: 'Bio/Beschreibung',
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

  const departments = [
    'Cardiology',
    'Orthopedics',
    'Neurology',
    'Pediatrics',
    'Dermatology',
    'Psychiatry',
    'General Surgery',
    'ENT',
    'Ophthalmology',
    'Dentistry',
    'Gynecology',
    'Urology',
    'Oncology',
    'Radiology',
    'Anesthesiology'
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
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dob', 'gender', 'department'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = t.required;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = t.phoneInvalid;
    }

    // Aadhar validation
    if (formData.aadhar && !/^\d{12}$/.test(formData.aadhar)) {
      newErrors.aadhar = t.aadharInvalid;
    }

    // Password validation for new doctors
    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = t.required;
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t.required;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t.passwordMismatch;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Simulate API call
    console.log('Form submitted:', { ...formData, avatar });
    
    // Navigate back to doctors list
    navigate('/doctors');
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
          {/* Left column - Personal Info */}
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

            {/* Avatar Upload */}
            <div className="avatar-upload">
              <label className="avatar-label">{t.uploadPhoto}</label>
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
                  placeholder="doctor@hospital.com"
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

            <div className="section-header">
              <HiAcademicCap className="section-icon" />
              <h3 className="section-title">{t.professionalInfo}</h3>
            </div>

            <div className="form-group">
              <label className="form-label">
                {t.department} <span className="required">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`form-input ${errors.department ? 'error' : ''}`}
              >
                <option value="">{t.selectDepartment}</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <span className="error-message">{errors.department}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.specialization}</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Pediatric Cardiology"
                />
              </div>
              
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
            </div>

            <div className="form-group">
              <label className="form-label">{t.qualification}</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                className="form-input"
                placeholder="MBBS, MD, etc."
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.licenseNumber}</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="MED-123456"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.bio}</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Brief description about the doctor..."
                rows="3"
              />
            </div>
          </div>

          {/* Right column - Address & Security */}
          <div className="form-section">
            <div className="section-header">
              <HiIdentification className="section-icon" />
              <h3 className="section-title">{t.addressInfo}</h3>
            </div>
            
            <div className="form-group">
              <label className="form-label">{t.address}</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Street address"
                rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.city}</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="City"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t.state}</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="State"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.zipCode}</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="form-input"
                placeholder="123456"
                maxLength="6"
              />
            </div>

            {!isEditing && (
              <>
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
              </>
            )}
          </div>
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