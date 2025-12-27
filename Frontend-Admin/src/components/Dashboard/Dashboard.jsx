import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  HiCalendar, 
  HiUserGroup, 
  HiChatAlt, 
  HiArrowUp, 
  HiArrowDown,
  HiClock,
  HiCheckCircle,
  HiXCircle
} from 'react-icons/hi';
import './Dashboard.css';

// Temporary API service - replace with your actual API calls
const appointmentService = {
  getAll: async () => {
    try {
      // Call backend appointment list endpoint and include credentials so cookies are sent
      // Include credentials so cookies are sent via the Vite dev proxy.
      // Also include Authorization header fallback if a token is stored in localStorage.
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      // Try proxied request first (dev). If it returns 401, retry directly against backend.
      let response = await fetch('/api/appointment/getall', {
        credentials: 'include',
        headers
      });

      if (response.status === 401 && token) {
        try {
          console.warn('Proxy returned 401 — retrying direct backend request with Authorization header');
          response = await fetch('http://localhost:5000/api/v1/appointment/getall', {
            method: 'GET',
            headers: { ...headers },
          });
        } catch (e) {
          console.error('Direct backend retry failed', e);
        }
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // Return empty data structure to prevent crashes
      return { appointments: [] };
    }
  }
};

const Dashboard = () => {
  const { language } = useContext(AppContext);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    activeDoctors: 0,
    unreadMessages: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch appointments using the API service
        const response = await appointmentService.getAll();
        const appts = response.appointments || [];

        // compute stats
        const total = appts.length;
        const pending = appts.filter(a => ((a.status || '').toString().toLowerCase() === 'pending')).length;
        const completed = appts.filter(a => {
          const s = (a.status || '').toString().toLowerCase();
          return s === 'completed' || s === 'accepted' || s === 'confirmed';
        }).length;

        // Extract unique patients and doctors
        const uniquePatients = new Set(appts.map(a => a.patientId).filter(id => id));
        const uniqueDoctors = new Set(appts.map(a => a.doctorId).filter(id => id));

        // recent appointments: sort by createdAt desc
        const recent = appts.slice().sort((x, y) => {
          const tx = new Date(x.createdAt || 0).getTime();
          const ty = new Date(y.createdAt || 0).getTime();
          return ty - tx;
        }).slice(0, 5).map((a) => ({
          id: a._id || a.id,
          patientName: (a.patient?.firstName || '') + ' ' + (a.patient?.lastName || '') || a.patient?.name || 'Unknown',
          doctorName: a.doctor?.firstName ? `Dr. ${a.doctor.firstName} ${a.doctor.lastName || ''}` : (a.doctor || a.doctorName || 'TBD'),
          department: a.appointment?.department || a.department || '',
          date: a.appointment?.date || a.appointment_date || a.date || '',
          time: a.appointment?.time || a.appointment_time || a.time || '',
          status: (a.status || '').toString().toLowerCase()
        }));

        setStats({
          totalAppointments: total,
          activeDoctors: uniqueDoctors.size,
          unreadMessages: 0, // You can add message service later
          totalPatients: uniquePatients.size,
          pendingAppointments: pending,
          completedAppointments: completed
        });
        
        setRecentAppointments(recent);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Set mock data for development
        setStats({
          totalAppointments: 24,
          activeDoctors: 8,
          unreadMessages: 3,
          totalPatients: 156,
          pendingAppointments: 5,
          completedAppointments: 19
        });
        
        // Mock recent appointments for development
        setRecentAppointments([
          {
            id: 1,
            patientName: 'John Smith',
            doctorName: 'Dr. Sarah Johnson',
            department: 'Cardiology',
            date: '2024-01-15',
            time: '10:30 AM',
            status: 'confirmed'
          },
          {
            id: 2,
            patientName: 'Maria Garcia',
            doctorName: 'Dr. Michael Chen',
            department: 'Pediatrics',
            date: '2024-01-15',
            time: '02:15 PM',
            status: 'pending'
          },
          {
            id: 3,
            patientName: 'Robert Wilson',
            doctorName: 'Dr. Emily Brown',
            department: 'Orthopedics',
            date: '2024-01-14',
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
      title: 'Dashboard Overview',
      subtitle: 'Welcome to HealthCare Management System',
      totalAppointments: 'Total Appointments',
      activeDoctors: 'Active Doctors',
      unreadMessages: 'Unread Messages',
      totalPatients: 'Total Patients',
      pendingAppointments: 'Pending Appointments',
      completedAppointments: 'Completed Appointments',
      recentAppointments: 'Recent Appointments',
      patientName: 'Patient',
      doctorName: 'Doctor',
      department: 'Department',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      confirmed: 'Confirmed',
      pending: 'Pending',
      cancelled: 'Cancelled',
      viewAll: 'View All',
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      loading: 'Loading...',
      noAppointments: 'No appointments found'
    },
    de: {
      title: 'Dashboard-Übersicht',
      subtitle: 'Willkommen im HealthCare Management System',
      totalAppointments: 'Gesamte Termine',
      activeDoctors: 'Aktive Ärzte',
      unreadMessages: 'Ungelesene Nachrichten',
      totalPatients: 'Patienten Gesamt',
      pendingAppointments: 'Ausstehende Termine',
      completedAppointments: 'Abgeschlossene Termine',
      recentAppointments: 'Aktuelle Termine',
      patientName: 'Patient',
      doctorName: 'Arzt',
      department: 'Abteilung',
      date: 'Datum',
      time: 'Uhrzeit',
      status: 'Status',
      confirmed: 'Bestätigt',
      pending: 'Ausstehend',
      cancelled: 'Abgesagt',
      viewAll: 'Alle anzeigen',
      today: 'Heute',
      thisWeek: 'Diese Woche',
      thisMonth: 'Diesen Monat',
      lastMonth: 'Letzten Monat',
      loading: 'Laden...',
      noAppointments: 'Keine Termine gefunden'
    }
  };

  const t = translations[language];

  const statCards = [
    {
      title: t.totalAppointments,
      value: stats.totalAppointments.toLocaleString(),
      icon: <HiCalendar />,
      color: 'primary',
      trend: '+12%',
      trendIcon: <HiArrowUp />
    },
    {
      title: t.activeDoctors,
      value: stats.activeDoctors,
      icon: <HiUserGroup />,
      color: 'success',
      trend: '+5%',
      trendIcon: <HiArrowUp />
    },
    {
      title: t.unreadMessages,
      value: stats.unreadMessages,
      icon: <HiChatAlt />,
      color: 'warning',
      trend: '-3%',
      trendIcon: <HiArrowDown />
    },
    {
      title: t.totalPatients,
      value: stats.totalPatients.toLocaleString(),
      icon: <HiUserGroup />,
      color: 'info',
      trend: '+8%',
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
            <option value="week">{t.thisWeek}</option>
            <option value="month">{t.thisMonth}</option>
            <option value="last-month">{t.lastMonth}</option>
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
            <button className="btn btn-primary btn-sm">
              {t.viewAll}
            </button>
          </div>
          
          <div className="table-responsive">
            {recentAppointments.length === 0 ? (
              <div className="no-data">
                <p>{t.noAppointments}</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t.patientName}</th>
                    <th>{t.doctorName}</th>
                    <th>{t.department}</th>
                    <th>{t.date}</th>
                    <th>{t.time}</th>
                    <th>{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <div className="patient-info">
                          <span className="patient-name">{appointment.patientName}</span>
                        </div>
                      </td>
                      <td>{appointment.doctorName}</td>
                      <td>
                        <span className="department-badge">{appointment.department}</span>
                      </td>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          {getStatusText(appointment.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;