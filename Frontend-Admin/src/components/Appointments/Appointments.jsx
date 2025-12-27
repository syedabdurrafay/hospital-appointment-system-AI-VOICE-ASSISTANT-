import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  HiCalendar, 
  HiSearch, 
  HiFilter, 
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
  HiExclamationCircle
} from 'react-icons/hi';
import Button from '../Common/Button';
import { appointmentService } from '../../services/api';
import './Appointments.css';

const Appointments = () => {
  const { language } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [view, setView] = useState('list');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const translations = {
    en: {
      title: 'Appointments',
      subtitle: 'Manage patient appointments',
      searchPlaceholder: 'Search appointments...',
      filterAll: 'All',
      filterPending: 'Pending',
      filterConfirmed: 'Confirmed',
      filterCancelled: 'Cancelled',
      filterCompleted: 'Completed',
      addAppointment: 'New Appointment',
      listView: 'List View',
      calendarView: 'Calendar View',
      patient: 'Patient',
      doctor: 'Doctor',
      department: 'Department',
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
      export: 'Export',
      print: 'Print',
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      upcoming: 'Upcoming',
      past: 'Past',
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
      showing: 'Showing'
    },
    de: {
      title: 'Termine',
      subtitle: 'Patiententermine verwalten',
      searchPlaceholder: 'Termine suchen...',
      filterAll: 'Alle',
      filterPending: 'Ausstehend',
      filterConfirmed: 'Bestätigt',
      filterCancelled: 'Abgesagt',
      filterCompleted: 'Abgeschlossen',
      addAppointment: 'Neuer Termin',
      listView: 'Listenansicht',
      calendarView: 'Kalenderansicht',
      patient: 'Patient',
      doctor: 'Arzt',
      department: 'Abteilung',
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
      export: 'Exportieren',
      print: 'Drucken',
      today: 'Heute',
      thisWeek: 'Diese Woche',
      thisMonth: 'Diesen Monat',
      upcoming: 'Bevorstehend',
      past: 'Vergangenheit',
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
      showing: 'Anzeigen'
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
        // Extract patient name
        const patientName = a.patient?.name || 
                           `${a.patient?.firstName || ''} ${a.patient?.lastName || ''}`.trim() ||
                           a.patient_name ||
                           'Unknown Patient';
        
        // Extract doctor name
        let doctorName = 'TBD';
        if (a.doctor?.firstName) {
          doctorName = `Dr. ${a.doctor.firstName} ${a.doctor.lastName || ''}`;
        } else if (a.doctorName) {
          doctorName = a.doctorName;
        } else if (a.doctorId?.firstName) {
          doctorName = `Dr. ${a.doctorId.firstName} ${a.doctorId.lastName || ''}`;
        }
        
        // Extract date and time
        const date = a.appointment?.date || a.date || a.appointment_date || '';
        const time = a.appointment?.time || a.time || a.appointment_time || '';
        
        // Extract department
        const department = a.appointment?.department || a.department || '';
        
        // Get status (ensure lowercase for consistency)
        const status = (a.status || 'pending').toLowerCase();
        
        // Get phone and email
        const phone = a.patient?.phone || a.patient_phone || '';
        const email = a.patient?.email || a.patient_email || '';
        
        return {
          id: a._id || a.id,
          patient: { 
            name: patientName, 
            phone: phone,
            email: email
          },
          doctor: doctorName,
          department: department,
          date: date,
          time: time,
          duration: a.duration || '30 min',
          status: status,
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

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.patient.phone.includes(searchQuery) ||
                         apt.patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'pending') return matchesSearch && apt.status === 'pending';
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
      const result = await appointmentService.confirm(apptId);
      if (result.success) {
        alert(t.appointmentConfirmed);
        handleRefresh();
      } else {
        throw new Error(result.message || 'Failed to confirm appointment');
      }
    } catch (err) {
      console.error('Confirm error:', err);
      alert(err.message || t.error);
    }
  };

  const handleRejectAppointment = async (apptId) => {
    const message = window.prompt(t.rejectAppointment + ' (Optional message to patient):');
    if (message === null) return; // user cancelled
    
    if (!window.confirm(t.confirmReject)) return;
    
    try {
      const result = await appointmentService.updateStatus(apptId, { 
        status: 'Rejected', 
        adminMessage: message 
      });
      if (result.success) {
        alert(t.appointmentRejected);
        handleRefresh();
      } else {
        throw new Error(result.message || 'Failed to reject appointment');
      }
    } catch (err) {
      console.error('Reject error:', err);
      alert(err.message || t.error);
    }
  };

  const handleDeleteAppointment = async (apptId) => {
    if (!window.confirm(t.confirmDelete)) return;
    
    try {
      const result = await appointmentService.delete(apptId);
      if (result.success) {
        alert(t.appointmentDeleted);
        handleRefresh();
      } else {
        throw new Error(result.message || 'Failed to delete appointment');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || t.error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
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
    switch(status) {
      case 'pending': return <HiClock />;
      case 'confirmed':
      case 'accepted': return <HiCheckCircle />;
      case 'cancelled':
      case 'rejected': return <HiXCircle />;
      case 'completed': return <HiCheckCircle />;
      default: return null;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': t.pending,
      'confirmed': t.confirmed,
      'accepted': t.confirmed,
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
          <div className="view-toggle">
            <button 
              className={`view-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
              disabled={refreshing}
            >
              {t.listView}
            </button>
            <button 
              className={`view-btn ${view === 'calendar' ? 'active' : ''}`}
              onClick={() => setView('calendar')}
              disabled={refreshing}
            >
              {t.calendarView}
            </button>
          </div>
          <Button 
            variant="primary" 
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
          
          <div className="time-filters">
            <button 
              className={`time-filter-btn ${filter === 'today' ? 'active' : ''}`}
              onClick={() => setFilter('today')}
              disabled={refreshing}
            >
              {t.today}
            </button>
            <button 
              className={`time-filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
              disabled={refreshing}
            >
              {t.thisWeek}
            </button>
            <button 
              className={`time-filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilter('confirmed')}
              disabled={refreshing}
            >
              {t.thisMonth}
            </button>
          </div>
        </div>

        <div className="controls-bottom">
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

          <div className="action-buttons">
            {selectedAppointments.length > 0 && (
              <>
                <span className="selected-count">
                  {selectedAppointments.length} {language === 'en' ? 'selected' : 'ausgewählt'}
                </span>
                <Button 
                  variant="danger" 
                  size="small"
                  onClick={() => {
                    selectedAppointments.forEach(id => handleDeleteAppointment(id));
                    setSelectedAppointments([]);
                  }}
                  disabled={refreshing}
                >
                  <HiTrash />
                  {t.deleteSelected}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <div className="appointments-list">
          <div className="list-header">
            <div className="list-header-cell checkbox-cell">
              <input
                type="checkbox"
                checked={selectedAppointments.length === filteredAppointments.length && filteredAppointments.length > 0}
                onChange={handleSelectAll}
                disabled={refreshing || filteredAppointments.length === 0}
              />
            </div>
            <div className="list-header-cell patient-cell">{t.patient}</div>
            <div className="list-header-cell doctor-cell">{t.doctor}</div>
            <div className="list-header-cell department-cell">{t.department}</div>
            <div className="list-header-cell date-cell">{t.date}</div>
            <div className="list-header-cell time-cell">{t.time}</div>
            <div className="list-header-cell status-cell">{t.status}</div>
            <div className="list-header-cell actions-cell">{t.actions}</div>
          </div>

          <div className="list-body">
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
                <div key={appointment.id} className="list-row">
                  <div className="list-cell checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedAppointments.includes(appointment.id)}
                      onChange={() => handleSelectAppointment(appointment.id)}
                      disabled={refreshing}
                    />
                  </div>
                  
                  <div className="list-cell patient-cell">
                    <div className="patient-info">
                      <HiUser className="patient-icon" />
                      <div className="patient-details">
                        <div className="patient-name">{appointment.patient.name}</div>
                        <div className="patient-contact">
                          <HiPhone className="contact-icon" />
                          <span>{appointment.patient.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="list-cell doctor-cell">
                    <div className="doctor-info">
                      <div className="doctor-name">{appointment.doctor}</div>
                      <div className="doctor-department">{appointment.department}</div>
                    </div>
                  </div>
                  
                  <div className="list-cell department-cell">
                    <span className="department-badge">{appointment.department}</span>
                  </div>
                  
                  <div className="list-cell date-cell">
                    <div className="date-display">
                      <HiCalendar className="date-icon" />
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                  </div>
                  
                  <div className="list-cell time-cell">
                    <div className="time-display">
                      <span>{appointment.time || 'N/A'}</span>
                      {appointment.duration && (
                        <span className="duration">({appointment.duration})</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="list-cell status-cell">
                    <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  
                  <div className="list-cell actions-cell">
                    <div className="action-buttons">
                      <button 
                        className="action-btn" 
                        title={t.viewDetails}
                        onClick={() => {
                          // View details implementation
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
      ) : (
        <div className="calendar-view">
          <div className="calendar-header">
            <div className="calendar-nav">
              <button className="nav-btn" disabled={refreshing}>‹</button>
              <h3 className="calendar-month">Calendar View</h3>
              <button className="nav-btn" disabled={refreshing}>›</button>
            </div>
            <div className="calendar-days">
              <div className="day-header">Sun</div>
              <div className="day-header">Mon</div>
              <div className="day-header">Tue</div>
              <div className="day-header">Wed</div>
              <div className="day-header">Thu</div>
              <div className="day-header">Fri</div>
              <div className="day-header">Sat</div>
            </div>
          </div>
          <div className="calendar-grid">
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className="calendar-day">
                <div className="day-number">{index + 1}</div>
                <div className="day-appointments">
                  {appointments
                    .filter(apt => {
                      if (!apt.date) return false;
                      try {
                        const date = new Date(apt.date);
                        return date.getDate() === (index + 1) && date.getMonth() === new Date().getMonth();
                      } catch {
                        return false;
                      }
                    })
                    .map(apt => (
                      <div 
                        key={apt.id} 
                        className={`appointment-event ${getStatusColor(apt.status)}`}
                        onClick={() => console.log('Appointment clicked:', apt)}
                      >
                        <div className="event-time">{apt.time}</div>
                        <div className="event-patient">{apt.patient.name}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;