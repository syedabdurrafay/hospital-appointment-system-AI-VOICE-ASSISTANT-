import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { appointmentService, doctorService } from '../../services/api';
import './AppointmentForm.css';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    department: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
    previousHistory: false,
    insurance: '',
    emergencyContact: '',
  });

  const departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'Oncology',
    'Gynecology',
    'ENT',
    'General Medicine',
    'Emergency'
  ];

  // Mock doctors data as fallback
  const mockDoctors = [
    { _id: '1', firstName: 'John', lastName: 'Smith', doctDptmnt: 'Cardiology', specialization: 'Cardiologist', experience: '15' },
    { _id: '2', firstName: 'Sarah', lastName: 'Johnson', doctDptmnt: 'Neurology', specialization: 'Neurologist', experience: '12' },
    { _id: '3', firstName: 'Michael', lastName: 'Brown', doctDptmnt: 'Orthopedics', specialization: 'Orthopedic Surgeon', experience: '20' },
    { _id: '4', firstName: 'Emily', lastName: 'Davis', doctDptmnt: 'Pediatrics', specialization: 'Pediatrician', experience: '8' },
    { _id: '5', firstName: 'Robert', lastName: 'Wilson', doctDptmnt: 'Dermatology', specialization: 'Dermatologist', experience: '10' },
    { _id: '6', firstName: 'Lisa', lastName: 'Miller', doctDptmnt: 'Gynecology', specialization: 'Gynecologist', experience: '14' },
    { _id: '7', firstName: 'David', lastName: 'Taylor', doctDptmnt: 'ENT', specialization: 'ENT Specialist', experience: '18' },
    { _id: '8', firstName: 'Jennifer', lastName: 'Anderson', doctDptmnt: 'General Medicine', specialization: 'General Physician', experience: '9' },
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      fetchAvailableSlots();
    }
  }, [formData.doctorId, formData.appointmentDate]);

  const fetchDoctors = async () => {
    try {
      // Try to fetch from API first via doctorService
      const response = await doctorService.getAll();
      // doctorService returns backend payload { success, doctors } or an array
      const list = (response && response.doctors) ? response.doctors : (Array.isArray(response) ? response : mockDoctors);
      setDoctors(list || mockDoctors);
    } catch (error) {
      console.warn('Using mock doctors data due to API error:', error);
      setDoctors(mockDoctors);
    }
  };


  const fetchAvailableSlots = () => {
    // Simulate API call delay
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const isToday = formData.appointmentDate === today;
      
      // If booking for today, only show future slots
      let available = [];
      if (isToday) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        available = timeSlots.filter(slot => {
          const [time, period] = slot.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          
          if (hours > currentHour || (hours === currentHour && minutes > currentMinute)) {
            return true;
          }
          return false;
        }).slice(0, 6); // Show only 6 available slots for today
      } else {
        available = timeSlots.slice(0, 8); // Show 8 slots for future dates
      }
      
      setAvailableSlots(available);
      
      // Reset appointment time if current selection is not available
      if (formData.appointmentTime && !available.includes(formData.appointmentTime)) {
        setFormData(prev => ({ ...prev, appointmentTime: '' }));
        toast.info('Previously selected time is no longer available');
      }
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for department change - reset doctor
    if (name === 'department') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        doctorId: '',
        appointmentTime: ''
      }));
    } else if (name === 'appointmentDate') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        appointmentTime: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateStep = () => {
    const validations = {
      1: () => {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dob', 'gender'];
        const fieldLabels = {
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email Address',
          phone: 'Phone Number',
          dob: 'Date of Birth',
          gender: 'Gender'
        };
        for (const field of requiredFields) {
          const value = String(formData[field] || '').trim();
          if (!value) {
            toast.error(`Please fill in ${fieldLabels[field]}`);
            return false;
          }
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(formData.email || '')) ) {
          toast.error('Please enter a valid email address');
          return false;
        }
        
        // Phone validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(String(formData.phone || '')) ) {
          toast.error('Please enter a valid 10-digit phone number');
          return false;
        }
        
        // Date of birth validation
        const dob = new Date(String(formData.dob || ''));
        const today = new Date();
        if (dob >= today) {
          toast.error('Please enter a valid date of birth');
          return false;
        }
        
        return true;
      },
      2: () => {
        const requiredFields = ['department', 'doctorId', 'appointmentDate', 'appointmentTime'];
        const fieldLabels = {
          department: 'Department',
          doctorId: 'Doctor',
          appointmentDate: 'Appointment Date',
          appointmentTime: 'Appointment Time'
        };
        
        for (const field of requiredFields) {
          const value = formData[field];
          if (value === null || value === undefined || String(value).trim() === '') {
            toast.error(`Please select ${fieldLabels[field]}`);
            return false;
          }
        }
        
        // Date validation
        const selectedDate = new Date(formData.appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          toast.error('Please select a future date');
          return false;
        }
        
        return true;
      }
    };
    
    return validations[currentStep] ? validations[currentStep]() : true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    setLoading(true);

    try {
      // Find selected doctor
      const selectedDoctor = doctors.find(d => d._id === formData.doctorId) || mockDoctors[0];
      
      const appointmentData = {
        patient: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          gender: formData.gender,
        },
        appointment: {
          department: formData.department,
          doctorId: formData.doctorId,
          doctorName: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
          doctorSpecialization: selectedDoctor.specialization || selectedDoctor.doctDptmnt,
          date: formData.appointmentDate,
          time: formData.appointmentTime,
          symptoms: formData.symptoms,
          hasVisited: formData.previousHistory,
          insuranceProvider: formData.insurance,
          emergencyContact: formData.emergencyContact,
        }
      };

      // Save appointment via API (must be authenticated as patient)
      const response = await appointmentService.create(appointmentData);
      toast.success(response.message || 'Appointment booked successfully!');
      
      // Redirect to confirmation page
      setTimeout(() => {
        navigate('/appointment-confirmation', {
          state: {
            appointmentId: response.appointment?._id || 'APPT' + Date.now(),
            patientName: `${formData.firstName} ${formData.lastName}`,
            department: formData.department,
            date: formData.appointmentDate,
            time: formData.appointmentTime,
            doctor: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
            appointmentNumber: response.appointment?.appointmentNumber || 'APT-' + Math.floor(100000 + Math.random() * 900000),
            symptoms: formData.symptoms,
            email: formData.email,
            phone: formData.phone
          }
        });
      }, 1500);

    } catch (error) {
      console.error('Appointment booking error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDoctors = () => {
    const source = (doctors && doctors.length) ? doctors : mockDoctors;
    if (!formData.department) return source;

    return source.filter(doctor => {
      // accept multiple possible field names (doctrDptmnt, doctDptmnt, department)
      const deptFields = [doctor.doctrDptmnt, doctor.doctDptmnt, doctor.department, doctor.specialization];
      return deptFields.some(d => d === formData.department);
    });
  };

  return (
    <section className="appointment-form-section">
      <div className="container">
        <div className="form-header">
          <h2>Book Your Appointment</h2>
          <p>Fill in your details to schedule an appointment with our expert doctors</p>
          
          {/* Progress Bar */}
          <div className="progress-bar">
            <div className="progress-steps">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Personal Info</div>
              </div>
              <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`}></div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Appointment Details</div>
              </div>
              <div className={`progress-line ${currentStep >= 3 ? 'active' : ''}`}></div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Additional Info</div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="appointment-form">
          {currentStep === 1 && (
            <div className="form-section active">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
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
                  <label htmlFor="lastName">Last Name *</label>
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
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    required
                  />
                  <small className="hint">Enter 10 digits without spaces or dashes</small>
                </div>
                <div className="form-group">
                  <label htmlFor="dob">Date of Birth *</label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender *</label>
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
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-section active">
              <h3 className="section-title">Appointment Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="department">Department *</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="doctorId">Select Doctor *</label>
                  <select
                    id="doctorId"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    disabled={!formData.department}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {getFilteredDoctors().map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization || doctor.doctDptmnt || doctor.department}
                        {doctor.experience ? ` (${doctor.experience} years exp)` : ''}
                      </option>
                    ))}
                    {getFilteredDoctors().length === 0 && formData.department && (
                      <option value="" disabled>No doctors available in this department</option>
                    )}
                  </select>
                  {getFilteredDoctors().length === 0 && formData.department && (
                    <small className="hint error">Please select another department or check back later</small>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="appointmentDate">Appointment Date *</label>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="appointmentTime">Preferred Time *</label>
                  <select
                    id="appointmentTime"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    disabled={!formData.doctorId || !formData.appointmentDate || availableSlots.length === 0}
                    required
                  >
                    <option value="">Select Time Slot</option>
                    {availableSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                    {availableSlots.length === 0 && formData.doctorId && formData.appointmentDate && (
                      <option value="" disabled>No slots available for this date</option>
                    )}
                  </select>
                  {formData.doctorId && formData.appointmentDate && (
                    <small className="hint">
                      {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available
                    </small>
                  )}
                </div>
              </div>
              
              {/* Doctor Info Preview */}
              {formData.doctorId && (
                <div className="doctor-preview">
                  <h4>Selected Doctor:</h4>
                  {(() => {
                    const doctor = doctors.find(d => d._id === formData.doctorId);
                    if (!doctor) return null;
                    return (
                      <div className="doctor-info-card">
                        <div className="doctor-avatar">
                          {doctor.firstName?.charAt(0)}{doctor.lastName?.charAt(0)}
                        </div>
                        <div className="doctor-details">
                          <h5>Dr. {doctor.firstName} {doctor.lastName}</h5>
                          <p className="specialty">{doctor.specialization || doctor.doctDptmnt}</p>
                          {doctor.experience && (
                            <p className="experience">{doctor.experience} years experience</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="form-section active">
              <h3 className="section-title">Additional Information</h3>
              <div className="form-group">
                <label htmlFor="symptoms">Symptoms / Reason for Visit</label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Describe your symptoms or reason for visit..."
                  rows="4"
                />
                <small className="hint">Please be as detailed as possible to help your doctor prepare</small>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="insurance">Insurance Provider (Optional)</label>
                  <input
                    type="text"
                    id="insurance"
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleChange}
                    placeholder="e.g., Blue Cross, Aetna, Medicare"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emergencyContact">Emergency Contact (Optional)</label>
                  <input
                    type="tel"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="Emergency contact number"
                  />
                </div>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  id="previousHistory"
                  name="previousHistory"
                  checked={formData.previousHistory}
                  onChange={handleChange}
                />
                <label htmlFor="previousHistory">
                  Have you visited us before?
                </label>
              </div>
              
              {/* Summary Section */}
              <div className="appointment-summary">
                <h4>Appointment Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Patient:</span>
                    <span className="summary-value">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Date & Time:</span>
                    <span className="summary-value">{formData.appointmentDate} at {formData.appointmentTime}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Department:</span>
                    <span className="summary-value">{formData.department}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Contact:</span>
                    <span className="summary-value">{formData.phone} / {formData.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <div className="action-left">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={prevStep}
                >
                  ← Back
                </button>
              )}
            </div>
            
            <div className="action-right">
              {currentStep < 3 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={nextStep}
                >
                  Continue to {currentStep === 1 ? 'Appointment Details' : 'Additional Info'} →
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    'Confirm & Book Appointment'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AppointmentForm;