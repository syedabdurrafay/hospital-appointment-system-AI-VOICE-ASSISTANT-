import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { appointmentService } from '../../services/api';
import {
    HiCalendar,
    HiUserGroup,
    HiClock,
    HiCheckCircle,
    HiXCircle,
    HiEye,
    HiUser
} from 'react-icons/hi';
import './Dashboard.css';

const DoctorDashboard = () => {
    const { user } = useContext(AppContext);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        cancelled: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getAll();

            if (data && data.success) {
                setAppointments(data.appointments || []);
                calculateStats(data.appointments || []);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (apps) => {
        const newStats = {
            total: apps.length,
            pending: apps.filter(a => (a.status || '').toLowerCase() === 'pending').length,
            approved: apps.filter(a => {
                const s = (a.status || '').toLowerCase();
                return s === 'accepted' || s === 'approved' || s === 'confirmed';
            }).length,
            cancelled: apps.filter(a => {
                const s = (a.status || '').toLowerCase();
                return s === 'cancelled' || s === 'rejected';
            }).length
        };
        setStats(newStats);
    };

    const getStatusColor = (status) => {
        if (!status) return 'status-pending';
        switch (status.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'accepted':
            case 'approved':
            case 'confirmed': return 'status-confirmed';
            case 'cancelled':
            case 'rejected': return 'status-cancelled';
            default: return 'status-pending';
        }
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <div className="dashboard-container fade-in">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Doctor Dashboard</h1>
                    <p className="dashboard-subtitle">Welcome back, Dr. {user?.firstName} {user?.lastName}</p>
                </div>
                <div className="date-display">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-wrapper blue">
                        <HiCalendar className="stat-icon" />
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-value">{stats.total}</h3>
                        <p className="stat-label">Total Appointments</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper yellow">
                        <HiClock className="stat-icon" />
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-value">{stats.pending}</h3>
                        <p className="stat-label">Pending Requests</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper green">
                        <HiCheckCircle className="stat-icon" />
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-value">{stats.approved}</h3>
                        <p className="stat-label">Confirmed</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper red">
                        <HiXCircle className="stat-icon" />
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-value">{stats.cancelled}</h3>
                        <p className="stat-label">Cancelled</p>
                    </div>
                </div>
            </div>

            {/* Recent Appointments Table */}
            <div className="recent-appointments">
                <div className="section-header">
                    <h2 className="section-title">Upcoming Appointments</h2>
                </div>

                <div className="table-container">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Patient Details</th>
                                <th>Date & Time</th>
                                <th>Status</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.slice(0, 10).map((appointment) => {
                                // 1. Determine Patient Name
                                let pName = "Unknown Patient";
                                if (appointment.patient_name) {
                                    pName = appointment.patient_name;
                                } else if (appointment.patient) {
                                    const { firstName, lastName } = appointment.patient;
                                    if (firstName) pName = `${firstName} ${lastName || ''}`.trim();
                                } else if (appointment.firstName) {
                                    pName = `${appointment.firstName} ${appointment.lastName || ''}`.trim();
                                }

                                // 2. Determine Patient Phone
                                let pPhone = "No phone";
                                if (appointment.patient_phone) {
                                    pPhone = appointment.patient_phone;
                                } else if (appointment.patient?.phone) {
                                    pPhone = appointment.patient.phone;
                                } else if (appointment.phone) {
                                    pPhone = appointment.phone;
                                }

                                // 3. Determine Date
                                let rawDate = appointment.date || appointment.appointment_date || appointment.appointment?.date || appointment.appointmentDate;
                                let displayDate = "N/A";
                                if (rawDate) {
                                    try {
                                        const d = new Date(rawDate);
                                        if (!isNaN(d.getTime())) {
                                            displayDate = d.toLocaleDateString();
                                        } else {
                                            displayDate = rawDate;
                                        }
                                    } catch (e) {
                                        displayDate = rawDate;
                                    }
                                }

                                // 4. Determine Time
                                let displayTime = appointment.time || appointment.appointment_time || appointment.appointment?.time || appointment.appointmentTime || "N/A";

                                // 5. Determine Department
                                let displayDept = appointment.department || appointment.appointment?.department || "General Physician";

                                return (
                                    <tr key={appointment._id || appointment.id}>
                                        <td>
                                            <div className="patient-cell">
                                                <div className="patient-avatar">
                                                    {pName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="patient-details">
                                                    <div className="patient-name">{pName}</div>
                                                    <div className="patient-meta" style={{ fontSize: '0.8rem', color: '#666' }}>{pPhone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="date-time-cell">
                                                <div>{displayDate}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{displayTime}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusColor(appointment.status || '')}`}>
                                                {appointment.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="dept-badge" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#f3f4f6', fontSize: '0.85rem' }}>
                                                {displayDept}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="action-btn view-btn" title="View Details">
                                                <HiEye />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {appointments.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="empty-state">No appointments found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
