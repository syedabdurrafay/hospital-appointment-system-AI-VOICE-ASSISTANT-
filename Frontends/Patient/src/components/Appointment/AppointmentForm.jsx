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
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
    previousHistory: false,
    emergencyContact: '',
  });

  // Default mock doctors as fallback
  const mockDoctors = [
    {
      _id: '1',
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      specialization: 'General Physician',
      experience: '15',
      workingHours: { start: '09:00', end: '17:00' },
      consultationDuration: 30
    },
    {
      _id: '2',
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      specialization: 'General Physician',
      experience: '12',
      workingHours: { start: '10:00', end: '18:00' },
      consultationDuration: 30
    },
    {
      _id: '3',
      id: '3',
      firstName: 'Michael',
      lastName: 'Brown',
      specialization: 'Cardiologist',
      experience: '20',
      workingHours: { start: '09:00', end: '16:00' },
      consultationDuration: 30
    },
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, appointmentTime: '' }));
    }
  }, [formData.doctorId, formData.appointmentDate]);

  const fetchDoctors = async () => {
    try {
      setFetchingDoctors(true);

      const response = await doctorService.getAll();

      let doctorsList = [];

      // Handle different response structures
      if (response && response.success !== false) {
        if (response.doctors && Array.isArray(response.doctors)) {
          doctorsList = response.doctors;
        } else if (Array.isArray(response)) {
          doctorsList = response;
        }
      }

      if (doctorsList.length === 0) {
        console.warn('No doctors found from API, using mock data');
        doctorsList = mockDoctors;
      }

      // Ensure each doctor has required fields
      doctorsList = doctorsList.map(doctor => ({
        _id: doctor._id || doctor.id,
        id: doctor._id || doctor.id,
        firstName: doctor.firstName || '',
        lastName: doctor.lastName || '',
        specialization: doctor.specialization || doctor.doctDptmnt || doctor.doctrDptmnt || 'General Physician',
        experience: doctor.experience || '5',
        qualification: doctor.qualification || 'MBBS',
        workingHours: doctor.workingHours || { start: '09:00', end: '17:00' },
        consultationDuration: doctor.consultationDuration || 30,
        description: doctor.description || `Experienced ${doctor.specialization || 'doctor'} with ${doctor.experience || '5'} years of experience.`,
        rating: doctor.rating || '4.5'
      }));

      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.warning('Using fallback doctor data');
      setDoctors(mockDoctors);
    } finally {
      setFetchingDoctors(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!formData.doctorId || !formData.appointmentDate) return;

    setCheckingAvailability(true);
    setAvailableSlots([]);
    setFormData(prev => ({ ...prev, appointmentTime: '' }));

    try {
      const response = await appointmentService.getAvailableSlots(
        formData.doctorId,
        formData.appointmentDate
      );

      if (response.success && response.available) {
        setAvailableSlots(response.slots || []);

        if (response.slots.length === 0) {
          toast.info('No available slots for this date. Please choose another date.');
        } else {
          toast.info(`Found ${response.slots.length} available slots`);
        }
      } else {
        toast.error(response.message || 'Doctor not available for this date');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to check availability. Please try again.');
      setAvailableSlots([]);

      // Fallback: Generate time slots
      const generatedSlots = generateTimeSlots();
      setAvailableSlots(generatedSlots);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const generateTimeSlots = () => {
    const selectedDoctor = doctors.find(d => d._id === formData.doctorId);
    const workingHours = selectedDoctor?.workingHours || { start: '09:00', end: '17:00' };
    const duration = selectedDoctor?.consultationDuration || 30;

    const slots = [];
    const isToday = formData.appointmentDate === new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);

    let currentHourSlot = startHour;
    let currentMinuteSlot = startMinute;

    while (currentHourSlot < endHour || (currentHourSlot === endHour && currentMinuteSlot < endMinute)) {
      const period = currentHourSlot >= 12 ? 'PM' : 'AM';
      const displayHour = currentHourSlot % 12 || 12;
      const timeString = `${displayHour}:${currentMinuteSlot.toString().padStart(2, '0')} ${period}`;

      // If today, only show future slots (with 30 min buffer)
      if (!isToday || (currentHourSlot > currentHour) || (currentHourSlot === currentHour && currentMinuteSlot > currentMinute + 30)) {
        slots.push(timeString);
      }

      // Increment by consultation duration
      currentMinuteSlot += duration;
      if (currentMinuteSlot >= 60) {
        currentHourSlot += Math.floor(currentMinuteSlot / 60);
        currentMinuteSlot = currentMinuteSlot % 60;
      }
    }

    return slots.slice(0, 12); // Return max 12 slots
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'appointmentDate') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        appointmentTime: ''
      }));
    } else if (name === 'doctorId') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        appointmentDate: '',
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
        if (!emailRegex.test(formData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }

        // Phone validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone)) {
          toast.error('Please enter a valid 10-digit phone number');
          return false;
        }

        // Date of birth validation
        const dob = new Date(formData.dob);
        const today = new Date();
        if (dob >= today) {
          toast.error('Please enter a valid date of birth');
          return false;
        }

        return true;
      },
      2: () => {
        const requiredFields = ['doctorId', 'appointmentDate', 'appointmentTime'];
        const fieldLabels = {
          doctorId: 'Doctor',
          appointmentDate: 'Appointment Date',
          appointmentTime: 'Appointment Time'
        };

        for (const field of requiredFields) {
          const value = formData[field];
          if (!value || String(value).trim() === '') {
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

        // Check if selected time is in available slots
        if (availableSlots.length > 0 && !availableSlots.includes(formData.appointmentTime)) {
          toast.error('Selected time slot is no longer available. Please choose another time.');
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
          doctorId: formData.doctorId,
          doctorName: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
          doctorSpecialization: selectedDoctor.specialization,
          date: formData.appointmentDate,
          time: formData.appointmentTime,
          symptoms: formData.symptoms,
          hasVisited: formData.previousHistory,
          emergencyContact: formData.emergencyContact,
          department: selectedDoctor.specialization || 'General Physician'
        }
      };

      console.log('Submitting appointment:', appointmentData);

      // Save appointment via API
      const response = await appointmentService.create(appointmentData);
      console.log('Appointment response:', response);

      toast.success(response.message || 'Appointment booked successfully!');

      // Redirect to confirmation page
      setTimeout(() => {
        navigate('/appointment-confirmation', {
          state: {
            appointmentId: response.appointment?._id || 'APPT' + Date.now(),
            patientName: `${formData.firstName} ${formData.lastName}`,
            date: formData.appointmentDate,
            time: formData.appointmentTime,
            doctor: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
            specialization: selectedDoctor.specialization,
            appointmentNumber: response.appointment?.appointmentNumber || 'APT-' + Math.floor(100000 + Math.random() * 900000),
            symptoms: formData.symptoms,
            email: formData.email,
            phone: formData.phone
          }
        });
      }, 1500);

    } catch (error) {
      console.error('Appointment booking error:', error);

      // HANDLE DUPLICATE SLOT (409)
      if (error.response?.data?.errorType === 'SLOT_BOOKED' && error.response.data.availableSlots) {
        toast.error(error.response.data.message);
        toast.info(error.response.data.suggestionMessage || "Suggested slots have been updated.");

        // Update slots with suggestions
        setAvailableSlots(error.response.data.availableSlots);

        // Reset selected time
        setFormData(prev => ({ ...prev, appointmentTime: '' }));

        // Go back to Step 2
        setCurrentStep(2);
        return;
      }

      const errorMessage = error.response?.data?.message || error.message || 'Failed to book appointment. Please try again.';
      toast.error(errorMessage);

      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get the selected doctor for preview
  const selectedDoctor = formData.doctorId ? doctors.find(d => d._id === formData.doctorId) : null;

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
                <div className="step-label">Doctor & Time</div>
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
              <h3 className="section-title">Select Doctor & Appointment Time</h3>

              {/* Doctor Selection */}
              <div className="form-group full-width">
                <label htmlFor="doctorId">Select Doctor *</label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  disabled={fetchingDoctors}
                  required
                >
                  <option value="">Choose a Doctor</option>
                  {fetchingDoctors ? (
                    <option value="" disabled>Loading doctors...</option>
                  ) : doctors.length > 0 ? (
                    doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                        {doctor.experience ? ` (${doctor.experience} years experience)` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No doctors available</option>
                  )}
                </select>
                {!fetchingDoctors && doctors.length === 0 && (
                  <small className="hint error">No doctors available at the moment. Please check back later.</small>
                )}
              </div>

              {/* Doctor Preview Card */}
              {selectedDoctor && (
                <div className="doctor-preview-card">
                  <div className="doctor-avatar-large">
                    {selectedDoctor.firstName?.charAt(0)}{selectedDoctor.lastName?.charAt(0)}
                  </div>
                  <div className="doctor-details">
                    <h4>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h4>
                    <p className="specialty">{selectedDoctor.specialization}</p>
                    {selectedDoctor.experience && (
                      <p className="experience">📅 {selectedDoctor.experience} years experience</p>
                    )}
                    {selectedDoctor.qualification && (
                      <p className="qualification">🎓 {selectedDoctor.qualification}</p>
                    )}
                    {selectedDoctor.workingHours && (
                      <p className="availability">
                        ⏰ Available: {selectedDoctor.workingHours.start} - {selectedDoctor.workingHours.end}
                      </p>
                    )}
                    {selectedDoctor.rating && (
                      <p className="rating">⭐ {selectedDoctor.rating}/5 rating</p>
                    )}
                  </div>
                </div>
              )}

              {/* Date and Time Selection */}
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="appointmentDate">Appointment Date *</label>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={!formData.doctorId}
                    required
                  />
                  {!formData.doctorId && (
                    <small className="hint">Please select a doctor first</small>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="appointmentTime">Preferred Time *</label>
                  <select
                    id="appointmentTime"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    disabled={!formData.doctorId || !formData.appointmentDate || availableSlots.length === 0 || checkingAvailability}
                    required
                  >
                    <option value="">Select Time Slot</option>
                    {checkingAvailability ? (
                      <option value="" disabled>Checking availability...</option>
                    ) : availableSlots.length > 0 ? (
                      availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {formData.doctorId && formData.appointmentDate
                          ? 'No slots available for this date'
                          : 'Select doctor and date first'}
                      </option>
                    )}
                  </select>
                  {checkingAvailability && (
                    <small className="hint checking">
                      <span className="spinner-small"></span> Checking doctor's availability...
                    </small>
                  )}
                  {!checkingAvailability && formData.doctorId && formData.appointmentDate && (
                    <small className="hint">
                      {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available
                    </small>
                  )}
                </div>
              </div>

              {/* Availability Status */}
              {formData.doctorId && formData.appointmentDate && !checkingAvailability && (
                <div className="availability-status">
                  {availableSlots.length > 0 ? (
                    <div className="status-available">
                      <span className="status-icon">✅</span>
                      <span>Doctor is available on {formData.appointmentDate}</span>
                    </div>
                  ) : (
                    <div className="status-unavailable">
                      <span className="status-icon">❌</span>
                      <span>Doctor is not available on {formData.appointmentDate}. Please choose another date.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="form-section active">
              <h3 className="section-title">Additional Information</h3>
              <div className="form-group full-width">
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
                    <span className="summary-label">Doctor:</span>
                    <span className="summary-value">
                      {selectedDoctor ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}` : 'Not selected'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Specialization:</span>
                    <span className="summary-value">
                      {selectedDoctor ? selectedDoctor.specialization : 'Not selected'}
                    </span>
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
                  Continue to {currentStep === 1 ? 'Doctor & Time Selection' : 'Additional Info'} →
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
                      Booking Appointment...
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