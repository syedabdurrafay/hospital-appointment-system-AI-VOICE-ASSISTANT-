import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { appointmentService } from '../../services/api';
import { 
  HiCalendar, 
  HiUserGroup, 
  HiChatAlt, 
  HiArrowUp, 
  HiArrowDown,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiUsers,
  HiCash
} from 'react-icons/hi';
import './Dashboard.css';

const Dashboard = () => {
  const { language } = useContext(AppContext);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    revenue: 0,
    activeDoctors: 0,
    completedAppointments: 0
  });

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading dashboard data...');
        const response = await appointmentService.getAll();
        console.log('Dashboard data loaded:', response);
        
        const appts = response.appointments || [];

        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Compute stats
        const total = appts.length;
        const todayCount = appts.filter(a => {
          const aptDate = a.appointment?.date || a.appointment_date || a.date;
          return aptDate === today;
        }).length;
        
        const pending = appts.filter(a => ((a.status || '').toString().toLowerCase() === 'pending')).length;
        const completed = appts.filter(a => {
          const s = (a.status || '').toString().toLowerCase();
          return s === 'completed' || s === 'accepted' || s === 'confirmed';
        }).length;

        // Extract unique patients and doctors
        const uniquePatients = new Set(appts.map(a => a.patientId).filter(id => id));
        const uniqueDoctors = new Set(appts.map(a => a.doctorId).filter(id => id));

        // Calculate revenue (mock calculation - $50 per completed appointment)
        const revenue = completed * 50;

        // Process recent appointments (last 5)
        const recent = appts.slice().sort((x, y) => {
          const tx = new Date(x.createdAt || 0).getTime();
          const ty = new Date(y.createdAt || 0).getTime();
          return ty - tx;
        }).slice(0, 5).map((a) => {
          // Handle doctor name
          let doctorName = '';
          if (a.doctor) {
            if (typeof a.doctor === 'object') {
              if (a.doctor.firstName && a.doctor.lastName) {
                doctorName = `Dr. ${a.doctor.firstName} ${a.doctor.lastName}`;
              } else if (a.doctor.fullName) {
                doctorName = a.doctor.fullName;
              } else if (a.doctor.name) {
                doctorName = a.doctor.name;
              } else {
                doctorName = 'Not Assigned';
              }
            } else if (typeof a.doctor === 'string') {
              doctorName = a.doctor;
            }
          } else if (a.doctorName) {
            if (typeof a.doctorName === 'object') {
              if (a.doctorName.firstName && a.doctorName.lastName) {
                doctorName = `Dr. ${a.doctorName.firstName} ${a.doctorName.lastName}`;
              } else if (a.doctorName.fullName) {
                doctorName = a.doctorName.fullName;
              } else {
                doctorName = 'Not Assigned';
              }
            } else {
              doctorName = a.doctorName;
            }
          } else {
            doctorName = 'Not Assigned';
          }

          // Handle patient name
          let patientName = 'Unknown Patient';
          if (a.patient) {
            if (typeof a.patient === 'object') {
              if (a.patient.firstName && a.patient.lastName) {
                patientName = `${a.patient.firstName} ${a.patient.lastName}`;
              } else if (a.patient.name) {
                patientName = a.patient.name;
              } else if (a.patient.fullName) {
                patientName = a.patient.fullName;
              }
            } else if (typeof a.patient === 'string') {
              patientName = a.patient;
            }
          }

          // Format date if needed
          let formattedDate = '';
          if (a.appointment?.date || a.appointment_date || a.date) {
            const dateStr = a.appointment?.date || a.appointment_date || a.date;
            if (dateStr.includes('T')) {
              const dateObj = new Date(dateStr);
              formattedDate = dateObj.toLocaleDateString();
            } else {
              formattedDate = dateStr;
            }
          }

          return {
            id: a._id || a.id,
            patientName,
            doctorName,
            date: formattedDate,
            time: a.appointment?.time || a.appointment_time || a.time || '',
            status: (a.status || '').toString().toLowerCase(),
          };
        });

        setStats({
          todayAppointments: todayCount,
          totalPatients: uniquePatients.size,
          pendingAppointments: pending,
          revenue: revenue,
          activeDoctors: uniqueDoctors.size,
          completedAppointments: completed
        });
        
        setRecentAppointments(recent);
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
        
        // Set mock data for development
        setStats({
          todayAppointments: 8,
          totalPatients: 45,
          pendingAppointments: 3,
          revenue: 1250,
          activeDoctors: 3,
          completedAppointments: 25
        });
        
        // Mock recent appointments for development
        setRecentAppointments([
          {
            id: 1,
            patientName: 'John Smith',
            doctorName: 'Dr. Sarah Johnson',
            date: 'Today',
            time: '10:30 AM',
            status: 'confirmed'
          },
          {
            id: 2,
            patientName: 'Maria Garcia',
            doctorName: 'Dr. Michael Brown',
            date: 'Today',
            time: '02:15 PM',
            status: 'pending'
          },
          {
            id: 3,
            patientName: 'Robert Wilson',
            doctorName: 'Dr. Sarah Johnson',
            date: 'Tomorrow',
            time: '11:00 AM',
            status: 'confirmed'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const translations = {
    en: {
      title: 'Clinic Dashboard',
      subtitle: 'Overview of your clinic operations',
      todayAppointments: "Today's Appointments",
      totalPatients: 'Total Patients',
      pendingAppointments: 'Pending Appointments',
      revenue: 'Revenue',
      activeDoctors: 'Active Doctors',
      completedAppointments: 'Completed Appointments',
      recentAppointments: 'Recent Appointments',
      patientName: 'Patient',
      doctorName: 'Doctor',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      confirmed: 'Confirmed',
      pending: 'Pending',
      cancelled: 'Cancelled',
      completed: 'Completed',
      viewAll: 'View All',
      loading: 'Loading dashboard data...',
      noAppointments: 'No appointments found',
      today: 'Today',
      tomorrow: 'Tomorrow',
      thisWeek: 'This Week',
      lastWeek: 'Last Week',
      error: 'Error loading data'
    },
    de: {
      title: 'Klinik Dashboard',
      subtitle: 'Übersicht Ihrer Klinikaktivitäten',
      todayAppointments: 'Heutige Termine',
      totalPatients: 'Patienten Gesamt',
      pendingAppointments: 'Ausstehende Termine',
      revenue: 'Umsatz',
      activeDoctors: 'Aktive Ärzte',
      completedAppointments: 'Abgeschlossene Termine',
      recentAppointments: 'Aktuelle Termine',
      patientName: 'Patient',
      doctorName: 'Arzt',
      date: 'Datum',
      time: 'Uhrzeit',
      status: 'Status',
      confirmed: 'Bestätigt',
      pending: 'Ausstehend',
      cancelled: 'Abgesagt',
      completed: 'Abgeschlossen',
      viewAll: 'Alle anzeigen',
      loading: 'Laden...',
      noAppointments: 'Keine Termine gefunden',
      today: 'Heute',
      tomorrow: 'Morgen',
      thisWeek: 'Diese Woche',
      lastWeek: 'Letzte Woche',
      error: 'Fehler beim Laden der Daten'
    }
  };

  const t = translations[language];

  const statCards = [
    {
      title: t.todayAppointments,
      value: stats.todayAppointments,
      icon: <HiCalendar />,
      color: 'primary',
      trend: '+2',
      trendIcon: <HiArrowUp />
    },
    {
      title: t.totalPatients,
      value: stats.totalPatients,
      icon: <HiUsers />,
      color: 'success',
      trend: '+5',
      trendIcon: <HiArrowUp />
    },
    {
      title: t.pendingAppointments,
      value: stats.pendingAppointments,
      icon: <HiClock />,
      color: 'warning',
      trend: '-1',
      trendIcon: <HiArrowDown />
    },
    {
      title: t.revenue,
      value: `$${stats.revenue}`,
      icon: <HiCash />,
      color: 'info',
      trend: '+12%',
      trendIcon: <HiArrowUp />
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed':
      case 'accepted':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
      case 'rejected':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed':
      case 'accepted':
        return <HiCheckCircle />;
      case 'pending':
        return <HiClock />;
      case 'cancelled':
      case 'rejected':
        return <HiXCircle />;
      case 'completed':
        return <HiCheckCircle />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'confirmed':
      case 'accepted':
        return t.confirmed;
      case 'pending':
        return t.pending;
      case 'cancelled':
      case 'rejected':
        return t.cancelled;
      case 'completed':
        return t.completed;
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard error">
        <div className="error-icon">⚠️</div>
        <h3>{t.error}</h3>
        <p>{error}</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{t.title}</h1>
          <p className="dashboard-subtitle">{t.subtitle}</p>
        </div>
        <div className="dashboard-actions">
          <select className="time-filter">
            <option value="today">{t.today}</option>
            <option value="tomorrow">{t.tomorrow}</option>
            <option value="week">{t.thisWeek}</option>
            <option value="last-week">{t.lastWeek}</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-header">
              <div className="stat-icon">
                {stat.icon}
              </div>
              <div className={`stat-trend ${stat.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                {stat.trendIcon}
                <span>{stat.trend}</span>
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">{t.recentAppointments}</h2>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => window.location.href = '/admin/appointments'}
            >
              {t.viewAll}
            </button>
          </div>
          
          <div className="recent-appointments">
            {recentAppointments.length === 0 ? (
              <div className="no-data">
                <p>{t.noAppointments}</p>
              </div>
            ) : (
              <div className="appointments-list">
                {recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="appointment-item">
                    <div className="appointment-time">
                      <span className="time">{appointment.time}</span>
                      <span className="date">{appointment.date}</span>
                    </div>
                    <div className="appointment-info">
                      <div className="patient-name">{appointment.patientName}</div>
                      <div className="doctor-name">{appointment.doctorName}</div>
                    </div>
                    <div className="appointment-status">
                      <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;