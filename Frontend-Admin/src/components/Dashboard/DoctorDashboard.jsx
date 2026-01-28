import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { appointmentService } from '../../services/api';
import {
    HiCalendar,
    HiUserGroup,
    HiClock,
    HiCheckCircle,
    HiXCircle
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

            if (data.success) {
                setAppointments(data.appointments);
                calculateStats(data.appointments);
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
            pending: apps.filter(a => a.status === 'Pending').length,
            approved: apps.filter(a => a.status === 'Accepted' || a.status === 'Approved').length,
            cancelled: apps.filter(a => a.status === 'Cancelled' || a.status === 'Rejected').length
        };
        setStats(newStats);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'accepted':
            case 'approved': return 'status-confirmed';
            case 'cancelled':
            case 'rejected': return 'status-cancelled';
            default: return '';
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
                                <th>Patient</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.slice(0, 10).map((appointment) => (
                                <tr key={appointment._id}>
                                    <td>
                                        <div className="patient-cell">
                                            <div className="patient-avatar">
                                                <HiUserGroup />
                                            </div>
                                            <div>
                                                <div className="patient-name">{appointment.firstName} {appointment.lastName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                                    <td>{appointment.appointmentTime || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn view-btn">View Details</button>
                                    </td>
                                </tr>
                            ))}
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
