import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/api';
import './Appointment.css';

const AppointmentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(location.state?.appointment || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!appointment && location.state?.appointmentId) {
      fetchAppointment(location.state.appointmentId);
    }
  }, [location.state]);

  const fetchAppointment = async (id) => {
    setLoading(true);
    try {
      const resp = await appointmentService.getMine();
      const found = resp.appointments?.find(a => String(a._id) === String(id));
      if (found) {
        const normalized = {
          ...found,
          appointment_date: found.appointment?.date || found.appointment_date,
          appointment_time: found.appointment?.time || found.appointment_time,
          doctor_firstName: found.doctor?.firstName || found.doctor_firstName,
          doctor_lastName: found.doctor?.lastName || found.doctor_lastName,
          status: found.status || 'Pending'
        };
        setAppointment(normalized);
      }
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  if (!appointment) return (
    <div className="page-container">
      <h2>Appointment</h2>
      <p>No appointment found.</p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );

  return (
    <div className="page-container appointment-confirmation">
      <h2>Appointment {appointment.status || 'Pending'}</h2>
      <div className="confirmation-card">
        <p><strong>Patient:</strong> {appointment.patient?.firstName} {appointment.patient?.lastName}</p>
        <p><strong>Doctor:</strong> Dr. {appointment.doctor_firstName} {appointment.doctor_lastName}</p>
        <p><strong>Department:</strong> {appointment.appointment?.department || appointment.department}</p>
        <p><strong>Date & Time:</strong> {appointment.appointment_date} at {appointment.appointment_time}</p>
        <p><strong>Status:</strong> {appointment.status}</p>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
