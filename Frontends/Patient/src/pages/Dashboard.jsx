import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getMine();
      const raw = response.appointments || [];

      const normalized = raw.map(app => {
        const appointmentDate = app.appointment?.date || app.appointment_date || app.appointment_date;
        const appointmentTime = app.appointment?.time || app.appointment_time || app.appointment_time;
        const doctorFirst = app.doctor?.firstName || app.doctor_firstName || (app.doctor && app.doctor.firstName) || '';
        const doctorLast = app.doctor?.lastName || app.doctor_lastName || (app.doctor && app.doctor.lastName) || '';
        return {
          ...app,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          doctor_firstName: doctorFirst,
          doctor_lastName: doctorLast,
          status: app.status || 'Pending'
        };
      });

      setAppointments(normalized);
      calculateStats(normalized);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointments) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parseDateOnly = (d) => {
      if (!d) return null;
      if (d instanceof Date) {
        const dt = new Date(d);
        dt.setHours(0, 0, 0, 0);
        return dt;
      }
      const match = String(d).match(/(\d{4}-\d{2}-\d{2})/);
      if (match) return new Date(match[1] + 'T00:00:00');
      const dt = new Date(d);
      if (!isNaN(dt)) { dt.setHours(0, 0, 0, 0); return dt; }
      return null;
    };

    const upcoming = appointments.filter(app => {
      const appointmentDate = parseDateOnly(app.appointment_date || app.appointment?.date);
      if (!appointmentDate) return false;
      const status = String(app.status || '').toLowerCase();
      if (['cancelled', 'rejected', 'completed', 'done'].includes(status)) return false;
      return appointmentDate.getTime() >= today.getTime();
    }).length;

    const completed = appointments.filter(app => {
      const status = String(app.status || '').toLowerCase();
      return status === 'completed' || status === 'done';
    }).length;

    const cancelled = appointments.filter(app => {
      const status = String(app.status || '').toLowerCase();
      return status === 'cancelled' || status === 'rejected';
    }).length;

    setStats({ upcoming, completed, cancelled, total: appointments.length });
  };

  const parseDateOnly = (d) => {
    if (!d) return null;
    if (d instanceof Date) { const dt = new Date(d); dt.setHours(0, 0, 0, 0); return dt; }
    const match = String(d).match(/(\d{4}-\d{2}-\d{2})/);
    if (match) return new Date(match[1] + 'T00:00:00');
    const dt = new Date(d);
    if (!isNaN(dt)) { dt.setHours(0, 0, 0, 0); return dt; }
    return null;
  };

  const upcomingAppointments = appointments.filter(app => {
    const appointmentDate = parseDateOnly(app.appointment_date || app.appointment?.date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const status = String(app.status || '').toLowerCase();
    if (!appointmentDate) return false;
    if (['cancelled', 'rejected', 'completed', 'done'].includes(status)) return false;
    // Show even if older than today if it's still 'pending' or 'confirmed' (missed appointment case could be handled separately)
    return appointmentDate.getTime() >= today.getTime();
  }).sort((a, b) => {
    const da = parseDateOnly(a.appointment_date || a.appointment?.date);
    const db = parseDateOnly(b.appointment_date || b.appointment?.date);
    return (da?.getTime() || 0) - (db?.getTime() || 0);
  });

  const pastAppointments = appointments.filter(app => {
    const appointmentDate = parseDateOnly(app.appointment_date || app.appointment?.date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const status = String(app.status || '').toLowerCase();

    // Include completed/cancelled here regardless of date
    if (['cancelled', 'rejected', 'completed', 'done'].includes(status)) return true;

    if (!appointmentDate) return true;
    return appointmentDate.getTime() < today.getTime();
  }).sort((a, b) => {
    const da = parseDateOnly(a.appointment_date || a.appointment?.date);
    const db = parseDateOnly(b.appointment_date || b.appointment?.date);
    return (db?.getTime() || 0) - (da?.getTime() || 0);
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAppointmentAction = async (action, appointmentId) => {
    try {
      switch (action) {
        case 'cancel':
          if (window.confirm('Are you sure you want to cancel this appointment?')) {
            await appointmentService.cancel(appointmentId);
            fetchDashboardData();
          }
          break;
        case 'reschedule':
          window.location.href = `/appointment/reschedule/${appointmentId}`; // Assume this route exists or will exist
          break;
        case 'view':
          // window.location.href = `/appointment/${appointmentId}`;
          console.log('View details for', appointmentId);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing appointment action:', error);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.replace(/([0-9]{1,2}):([0-9]{2})/, (match, hour, minute) => {
      const hourNum = parseInt(hour);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      return `${displayHour}:${minute} ${ampm}`;
    });
  };

  // StatsCard Component
  const StatsCard = ({ title, value, icon, color, trend }) => (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <h3 className="stats-value">{value}</h3>
        <p className="stats-title">{title}</p>
        <span className="stats-trend">{trend}</span>
      </div>
    </div>
  );

  // AppointmentCard Component
  const AppointmentCard = ({ appointment, type = 'upcoming' }) => {
    // Normalize status
    const status = (appointment.status || 'pending').toLowerCase();

    const isCancelled = status === 'cancelled' || status === 'rejected';
    const isCompleted = status === 'completed' || status === 'done';
    const isAccepted = status === 'accepted' || status === 'confirmed';
    const isPending = status === 'pending';

    let statusClass = 'pending';
    let statusText = 'Pending';

    if (isCancelled) {
      statusClass = 'cancelled';
      statusText = 'Cancelled';
    } else if (isCompleted) {
      statusClass = 'completed';
      statusText = 'Completed';
    } else if (isAccepted) {
      statusClass = 'confirmed';
      statusText = 'Confirmed';
    } else {
      statusClass = 'pending';
      statusText = 'Pending';
    }

    return (
      <div className={`appointment-card ${type} status-${statusClass}`}>
        <div className="appointment-card-header">
          <div className="appointment-date-badge">
            <span className="date-day">
              {new Date(appointment.appointment_date).getDate()}
            </span>
            <span className="date-month">
              {new Date(appointment.appointment_date).toLocaleString('default', { month: 'short' }).toUpperCase()}
            </span>
          </div>
          <div className="appointment-status">
            <span className={`status-badge ${statusClass}`}>
              {statusText}
            </span>
          </div>
        </div>

        <div className="appointment-card-body">
          <h4 className="doctor-name">
            Dr. {appointment.doctor_firstName} {appointment.doctor_lastName}
          </h4>
          <p className="appointment-specialty">
            {appointment.department || 'General Medicine'}
          </p>

          <div className="appointment-details">
            <div className="detail-item">
              <span className="detail-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              </span>
              <span className="detail-text">{formatTime(appointment.appointment_time)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </span>
              <span className="detail-text">Room {appointment.room || 'TBD'}</span>
            </div>
            {appointment.reason && (
              <div className="detail-item">
                <span className="detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                </span>
                <span className="detail-text">{appointment.reason}</span>
              </div>
            )}
          </div>
        </div>

        <div className="appointment-card-footer">
          {type === 'upcoming' && !isCancelled && !isCompleted && (
            <>
              {/* Only show Reschedule if supported */}
              {/* 
              <button
                className="btn btn-outline"
                onClick={() => handleAppointmentAction('reschedule', appointment._id)}
              >
                Reschedule
              </button>
              */}
              <button
                className="btn btn-danger"
                onClick={() => handleAppointmentAction('cancel', appointment._id)}
              >
                Cancel
              </button>
            </>
          )}
          {(type === 'past' || isCompleted || isCancelled) && (
            <button
              className="btn btn-secondary"
              onClick={() => handleAppointmentAction('view', appointment._id)}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    );
  };

  // EmptyState Component
  const EmptyState = ({ icon, title, message, actionText, onAction }) => (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {actionText && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );

  // LoadingSpinner Component
  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );

  // DashboardSidebar Component
  const DashboardSidebar = () => {
    const navItems = [
      { id: 'overview', label: 'Overview', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg> },
      { id: 'appointments', label: 'Appointments', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, badge: upcomingAppointments.length },
      { id: 'medical', label: 'Medical Records', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg> },
      { id: 'prescriptions', label: 'Prescriptions', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z" /><line x1="8.5" y1="8.5" x2="15.5" y2="15.5" /></svg> },
      { id: 'billing', label: 'Billing', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
      { id: 'settings', label: 'Settings', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
    ];

    return (
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="profile-avatar">
              {user?.firstName?.charAt(0) || 'P'}
            </div>
            <div className="profile-info">
              <h3>{user?.firstName} {user?.lastName}</h3>
              <p className="profile-email">{user?.email}</p>
              <p className="profile-role">Patient</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="quick-actions">
            <button
              className="btn btn-primary btn-block"
              onClick={() => window.location.href = '/appointment'}
            >
              <span className="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
              </span>
              New Appointment
            </button>
            <button
              className="btn btn-outline btn-block"
              onClick={() => window.location.href = '/emergency'}
            >
              <span className="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </span>
              Emergency Contact
            </button>
          </div>

          <div className="sidebar-help">
            <p>Need help?</p>
            <a href="/help" className="help-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              Contact Support
            </a>
          </div>
        </div>
      </aside>
    );
  };

  const renderOverview = () => (
    <div className="overview-section">
      <div className="dashboard-header">
        <h1 className="greeting">Good Morning, {user?.firstName || 'Patient'}!</h1>
        <p className="greeting-subtitle">Here's what's happening with your healthcare</p>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Upcoming Appointments"
          value={stats.upcoming}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
          color="primary"
          trend={stats.upcoming > 0 ? "+2 this week" : "No appointments"}
        />
        <StatsCard
          title="Completed Visits"
          value={stats.completed}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}
          color="success"
          trend="All time"
        />
        <StatsCard
          title="Cancelled"
          value={stats.cancelled}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
          color="warning"
          trend="Last 30 days"
        />
        <StatsCard
          title="Total Appointments"
          value={stats.total}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>}
          color="info"
          trend="Since joining"
        />
      </div>

      <div className="recent-activity">
        <div className="section-header">
          <h2>Recent Appointments</h2>
          <button className="view-all btn-link" onClick={() => { setActiveTab('appointments-upcoming'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>View All →</button>
        </div>

        {upcomingAppointments.length > 0 ? (
          <div className="activity-list">
            {upcomingAppointments.slice(0, 3).map(appointment => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                type="upcoming"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="64" height="64"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
            title="No upcoming appointments"
            message="Schedule your next visit to get started"
            actionText="Book Appointment"
            onAction={() => window.location.href = '/appointment'}
          />
        )}
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="appointments-section">
      <div className="section-header">
        <div>
          <h2>Appointments</h2>
          <p className="section-subtitle">Manage your upcoming and past appointments</p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => window.location.href = '/appointment'}
        >
          <span className="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          </span>
          Book New Appointment
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'appointments-upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments-upcoming')}
        >
          Upcoming ({upcomingAppointments.length})
        </button>
        <button
          className={`tab ${activeTab === 'appointments-past' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments-past')}
        >
          Past Appointments ({pastAppointments.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'appointments-upcoming' ? (
          <>
            {upcomingAppointments.length > 0 ? (
              <div className="appointments-list">
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    type="upcoming"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="64" height="64"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                title="No upcoming appointments"
                message="Schedule your next visit to get started"
                actionText="Book Appointment"
                onAction={() => window.location.href = '/appointment'}
              />
            )}
          </>
        ) : (
          <>
            {pastAppointments.length > 0 ? (
              <div className="appointments-list">
                {pastAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    type="past"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="64" height="64"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>}
                title="No past appointments"
                message="Your appointment history will appear here"
              />
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderMedicalRecords = () => (
    <div className="medical-section">
      <div className="section-header">
        <div>
          <h2>Medical Records</h2>
          <p className="section-subtitle">Access your medical history and documents</p>
        </div>
      </div>
      <div className="placeholder-content">
        <div className="placeholder-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="80" height="80"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
        </div>
        <h3>Medical Records</h3>
        <p>This feature is currently in development and will be available soon.</p>
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="prescriptions-section">
      <div className="section-header">
        <div>
          <h2>Prescriptions</h2>
          <p className="section-subtitle">View and manage your prescriptions</p>
        </div>
      </div>
      <div className="placeholder-content">
        <div className="placeholder-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="80" height="80"><path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z" /><line x1="8.5" y1="8.5" x2="15.5" y2="15.5" /></svg>
        </div>
        <h3>Prescriptions</h3>
        <p>Your prescription history will be available here shortly.</p>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="billing-section">
      <div className="section-header">
        <div>
          <h2>Billing</h2>
          <p className="section-subtitle">View invoices and payment history</p>
        </div>
      </div>
      <div className="placeholder-content">
        <div className="placeholder-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="80" height="80"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
        </div>
        <h3>Billing Information</h3>
        <p>Billing features will be implemented in the next update.</p>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <div>
          <h2>Account Settings</h2>
          <p className="section-subtitle">Manage your account preferences</p>
        </div>
      </div>
      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <h4>Personal Information</h4>
          <p>Update your contact details and personal info</p>
          <button className="btn btn-outline">Edit Profile</button>
        </div>
        <div className="settings-card">
          <div className="settings-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>
          <h4>Security</h4>
          <p>Change password and security settings</p>
          <button className="btn btn-outline">Update Security</button>
        </div>
        <div className="settings-card">
          <div className="settings-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          </div>
          <h4>Notifications</h4>
          <p>Manage your notification preferences</p>
          <button className="btn btn-outline">Configure</button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        <DashboardSidebar />

        <main className="dashboard-main">
          {activeTab === 'overview' && renderOverview()}
          {(activeTab === 'appointments' || activeTab === 'appointments-upcoming' || activeTab === 'appointments-past') && renderAppointments()}
          {activeTab === 'medical' && renderMedicalRecords()}
          {activeTab === 'prescriptions' && renderPrescriptions()}
          {activeTab === 'billing' && renderBilling()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;