import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import {
  HiCalendar,
  HiSearch,
  HiPlus,
  HiEye,
  HiPencil,
  HiTrash,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiUser,
  HiPhone,
  HiRefresh,
  HiExclamationCircle,
  HiCheck,
  HiX
} from 'react-icons/hi';
import Button from '../Common/Button';
import { appointmentService } from '../../services/api';
import './Appointments.css';

const Appointments = () => {
  const { language } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const translations = {
    en: {
      title: 'Appointments',
      subtitle: 'Manage clinic appointments',
      searchPlaceholder: 'Search appointments...',
      filterAll: 'All',
      filterPending: 'Pending',
      filterConfirmed: 'Confirmed',
      filterCancelled: 'Cancelled',
      filterCompleted: 'Completed',
      addAppointment: 'Add Appointment',
      patient: 'Patient',
      doctor: 'Doctor',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      actions: 'Actions',
      pending: 'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed',
      viewDetails: 'View Details',
      edit: 'Edit',
      delete: 'Delete',
      noAppointments: 'No appointments found',
      selectAll: 'Select All',
      deleteSelected: 'Delete Selected',
      refresh: 'Refresh',
      loading: 'Loading appointments...',
      error: 'Failed to load appointments',
      retry: 'Retry',
      confirmAppointment: 'Confirm Appointment',
      rejectAppointment: 'Reject Appointment',
      confirmDelete: 'Are you sure you want to delete this appointment?',
      confirmReject: 'Are you sure you want to reject this appointment?',
      appointmentConfirmed: 'Appointment confirmed successfully!',
      appointmentRejected: 'Appointment rejected successfully!',
      appointmentDeleted: 'Appointment deleted successfully!',
      totalAppointments: 'Total Appointments',
      showing: 'Showing',
      filters: 'Filters',
      today: 'Today',
      tomorrow: 'Tomorrow',
      thisWeek: 'This Week',
      nextWeek: 'Next Week'
    },
    de: {
      title: 'Termine',
      subtitle: 'Kliniktermine verwalten',
      searchPlaceholder: 'Termine suchen...',
      filterAll: 'Alle',
      filterPending: 'Ausstehend',
      filterConfirmed: 'Bestätigt',
      filterCancelled: 'Abgesagt',
      filterCompleted: 'Abgeschlossen',
      addAppointment: 'Termin hinzufügen',
      patient: 'Patient',
      doctor: 'Arzt',
      date: 'Datum',
      time: 'Uhrzeit',
      status: 'Status',
      actions: 'Aktionen',
      pending: 'Ausstehend',
      confirmed: 'Bestätigt',
      cancelled: 'Abgesagt',
      completed: 'Abgeschlossen',
      viewDetails: 'Details anzeigen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      noAppointments: 'Keine Termine gefunden',
      selectAll: 'Alle auswählen',
      deleteSelected: 'Ausgewählte löschen',
      refresh: 'Aktualisieren',
      loading: 'Termine werden geladen...',
      error: 'Fehler beim Laden der Termine',
      retry: 'Erneut versuchen',
      confirmAppointment: 'Termin bestätigen',
      rejectAppointment: 'Termin ablehnen',
      confirmDelete: 'Sind Sie sicher, dass Sie diesen Termin löschen möchten?',
      confirmReject: 'Sind Sie sicher, dass Sie diesen Termin ablehnen möchten?',
      appointmentConfirmed: 'Termin erfolgreich bestätigt!',
      appointmentRejected: 'Termin erfolgreich abgelehnt!',
      appointmentDeleted: 'Termin erfolgreich gelöscht!',
      totalAppointments: 'Gesamte Termine',
      showing: 'Anzeigen',
      filters: 'Filter',
      today: 'Heute',
      tomorrow: 'Morgen',
      thisWeek: 'Diese Woche',
      nextWeek: 'Nächste Woche'
    }
  };

  const t = translations[language];

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAll();

      if (!data.success) {
        throw new Error(data.message || t.error);
      }

      // Transform the data for the UI
      const list = (data.appointments || []).map((a) => {
        // Safe extraction
        const safePatient = a.patient || {};
        const safeDoctor = a.doctor || {};

        // Extract patient name
        const patientName = safePatient.name ||
          (safePatient.firstName && safePatient.lastName ? `${safePatient.firstName} ${safePatient.lastName}` : '') ||
          a.patient_name ||
          'Unknown Patient';

        // Extract doctor name
        let doctorName = 'Not Assigned';
        if (safeDoctor.fullName) {
          doctorName = safeDoctor.fullName;
        } else if (safeDoctor.firstName) {
          doctorName = `Dr. ${safeDoctor.firstName} ${safeDoctor.lastName || ''}`;
        } else if (a.doctorName) {
          doctorName = a.doctorName;
        } else if (a.doctorId?.firstName) {
          doctorName = `Dr. ${a.doctorId.firstName} ${a.doctorId.lastName || ''}`;
        }

        // Extract date and time
        const date = a.appointment?.date || a.date || a.appointment_date || '';
        const time = a.appointment?.time || a.time || a.appointment_time || '';

        // Get status (ensure lowercase for consistency)
        const status = (a.status || 'pending').toLowerCase();

        // Get phone
        const phone = safePatient.phone || a.patient_phone || '';

        // Extract symptoms/reason
        const symptoms = a.appointment?.symptoms || a.symptoms || '';

        return {
          id: a._id || a.id,
          patient: {
            name: patientName,
            phone: phone
          },
          doctor: doctorName,
          date: date,
          time: time,
          status: status,
          symptoms: symptoms,
          raw: a
        };
      });

      setAppointments(list);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError(err.message || t.error);
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleAddAppointment = () => {
    // In a real app, navigate to add appointment form
    console.log('Navigate to add appointment form');
    // For now, just show a message
    alert('Add appointment form would open here');
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patient.phone.includes(searchQuery);

    if (filter === 'all') return matchesSearch;
    if (filter === 'pending') return matchesSearch && apt.status === 'pending';
    // Match both 'confirmed' and 'accepted'
    if (filter === 'confirmed' || filter === 'accepted') return matchesSearch && (apt.status === 'confirmed' || apt.status === 'accepted');
    if (filter === 'cancelled' || filter === 'rejected') return matchesSearch && (apt.status === 'cancelled' || apt.status === 'rejected');
    if (filter === 'completed') return matchesSearch && apt.status === 'completed';

    return matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedAppointments.length === filteredAppointments.length) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(filteredAppointments.map(a => a.id));
    }
  };

  const handleSelectAppointment = (appointmentId) => {
    setSelectedAppointments(prev =>
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const handleConfirmAppointment = async (apptId) => {
    if (!window.confirm(t.confirmAppointment + '?')) return;
    try {
      await appointmentService.confirm(apptId);
      // Optimistic update
      setAppointments(prev => prev.map(apt =>
        apt.id === apptId ? { ...apt, status: 'accepted' } : apt
      ));
      alert(t.appointmentConfirmed);
    } catch (err) {
      console.error('Confirm error:', err);
      alert(err.message || t.error);
      handleRefresh(); // Revert on failure
    }
  };

  const handleRejectAppointment = async (apptId) => {
    if (!window.confirm(t.confirmReject)) return;
    try {
      await appointmentService.updateStatus(apptId, { status: 'Rejected' });
      setAppointments(prev => prev.map(apt =>
        apt.id === apptId ? { ...apt, status: 'rejected' } : apt
      ));
      alert(t.appointmentRejected);
    } catch (err) {
      console.error('Reject error:', err);
      alert(err.message || t.error);
      handleRefresh();
    }
  };

  const handleDeleteAppointment = async (apptId) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await appointmentService.delete(apptId);
      setAppointments(prev => prev.filter(apt => apt.id !== apptId));
      setSelectedAppointments(prev => prev.filter(id => id !== apptId));
      alert(t.appointmentDeleted);
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || t.error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed':
      case 'accepted': return 'status-confirmed';
      case 'cancelled':
      case 'rejected': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <HiClock />;
      case 'confirmed':
      case 'accepted': return <HiCheckCircle />;
      case 'cancelled':
      case 'rejected': return <HiXCircle />;
      case 'completed': return <HiCheck />;
      default: return null;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      // Check if YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      }

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': t.pending,
      'confirmed': t.confirmed,
      'accepted': t.confirmed, // Display Accepted as Confirmed to user
      'cancelled': t.cancelled,
      'rejected': t.cancelled,
      'completed': t.completed
    };
    return statusMap[status] || status;
  };

  if (loading && !refreshing) {
    return (
      <div className="appointments-page fade-in">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">{t.title}</h1>
            <p className="page-subtitle">{t.subtitle}</p>
          </div>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-page fade-in">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">{t.title}</h1>
          <p className="page-subtitle">{t.subtitle}</p>
          <div className="stats-row">
            <span className="stat-badge total">{t.totalAppointments}: {appointments.length}</span>
            <span className="stat-badge showing">{t.showing}: {filteredAppointments.length}</span>
          </div>
        </div>
        <div className="header-right">
          <Button
            variant="primary"
            icon={<HiPlus />}
            onClick={handleAddAppointment}
            disabled={refreshing}
          >
            {t.addAppointment}
          </Button>
          <Button
            variant="secondary"
            icon={refreshing ? <div className="mini-spinner"></div> : <HiRefresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {t.refresh}
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <HiExclamationCircle />
          <span>{error}</span>
          <button onClick={handleRefresh} className="retry-btn">
            {t.retry}
          </button>
        </div>
      )}

      <div className="appointments-controls">
        <div className="controls-top">
          <div className="search-box">
            <HiSearch className="search-icon" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              disabled={refreshing}
            />
          </div>

          <button
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {t.filters} {showFilters ? '▲' : '▼'}
          </button>
        </div>

        {showFilters && (
          <div className="filter-section">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
                disabled={refreshing}
              >
                {t.filterAll}
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
                disabled={refreshing}
              >
                {t.filterPending}
              </button>
              <button
                className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
                onClick={() => setFilter('confirmed')}
                disabled={refreshing}
              >
                {t.filterConfirmed}
              </button>
              <button
                className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setFilter('cancelled')}
                disabled={refreshing}
              >
                {t.filterCancelled}
              </button>
              <button
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
                disabled={refreshing}
              >
                {t.filterCompleted}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="appointments-table-container">
        <div className="table-header">
          <div className="table-header-cell checkbox-cell">
            <input
              type="checkbox"
              checked={selectedAppointments.length === filteredAppointments.length && filteredAppointments.length > 0}
              onChange={handleSelectAll}
              disabled={refreshing || filteredAppointments.length === 0}
            />
          </div>
          <div className="table-header-cell patient-cell">{t.patient}</div>
          <div className="table-header-cell doctor-cell">{t.doctor}</div>
          <div className="table-header-cell date-cell">{t.date}</div>
          <div className="table-header-cell time-cell">{t.time}</div>
          <div className="table-header-cell status-cell">{t.status}</div>
          <div className="table-header-cell actions-cell">{t.actions}</div>
        </div>

        <div className="table-body">
          {filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <HiCalendar className="empty-icon" />
              <h3>{t.noAppointments}</h3>
              <p>
                {searchQuery || filter !== 'all'
                  ? (language === 'en'
                    ? 'Try adjusting your search or filter'
                    : 'Versuchen Sie, Ihre Suche oder Filter anzupassen')
                  : (language === 'en'
                    ? 'No appointments scheduled yet'
                    : 'Noch keine Termine geplant')
                }
              </p>
              <Button variant="primary" onClick={handleRefresh} disabled={refreshing}>
                {t.refresh}
              </Button>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="table-row">
                <div className="table-cell checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedAppointments.includes(appointment.id)}
                    onChange={() => handleSelectAppointment(appointment.id)}
                    disabled={refreshing}
                  />
                </div>

                <div className="table-cell patient-cell">
                  <div className="patient-info">
                    <HiUser className="patient-icon" />
                    <div className="patient-details">
                      <div className="patient-name">{appointment.patient.name}</div>
                      {appointment.patient.phone && (
                        <div className="patient-contact">
                          <HiPhone className="contact-icon" />
                          <span>{appointment.patient.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="table-cell doctor-cell">
                  <div className="doctor-info">
                    <div className="doctor-name">{appointment.doctor}</div>
                  </div>
                </div>

                <div className="table-cell date-cell">
                  <div className="date-display">
                    <HiCalendar className="date-icon" />
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                </div>

                <div className="table-cell time-cell">
                  <div className="time-display">
                    <span>{appointment.time || 'N/A'}</span>
                  </div>
                </div>

                <div className="table-cell status-cell">
                  <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    {getStatusText(appointment.status)}
                  </span>
                </div>

                <div className="table-cell actions-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn view-btn"
                      title={t.viewDetails}
                      onClick={() => {
                        console.log('View details:', appointment);
                      }}
                      disabled={refreshing}
                    >
                      <HiEye />
                    </button>

                    {appointment.status === 'pending' && (
                      <>
                        <button
                          className="action-btn confirm-btn"
                          title={t.confirmAppointment}
                          onClick={() => handleConfirmAppointment(appointment.id)}
                          disabled={refreshing}
                        >
                          <HiCheckCircle />
                        </button>
                        <button
                          className="action-btn reject-btn"
                          title={t.rejectAppointment}
                          onClick={() => handleRejectAppointment(appointment.id)}
                          disabled={refreshing}
                        >
                          <HiXCircle />
                        </button>
                      </>
                    )}

                    <button
                      className="action-btn delete-btn"
                      title={t.delete}
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      disabled={refreshing}
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedAppointments.length > 0 && (
        <div className="selection-actions-bar">
          <div className="selection-info">
            <span className="selected-count">
              {selectedAppointments.length} {language === 'en' ? 'appointments selected' : 'Termine ausgewählt'}
            </span>
          </div>
          <div className="selection-buttons">
            <Button
              variant="danger"
              size="small"
              icon={<HiTrash />}
              onClick={() => {
                selectedAppointments.forEach(id => handleDeleteAppointment(id));
                setSelectedAppointments([]);
              }}
              disabled={refreshing}
            >
              {t.deleteSelected}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;