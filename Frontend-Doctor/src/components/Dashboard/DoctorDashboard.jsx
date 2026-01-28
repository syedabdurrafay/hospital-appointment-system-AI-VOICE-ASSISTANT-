import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { appointmentService } from '../../services/api';
import {
    HiCalendar,
    HiClock,
    HiCheckCircle,
    HiXCircle,
    HiEye,
    HiUser
} from 'react-icons/hi';
import './DoctorDashboard.css';

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

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'accepted':
            case 'approved': return 'status-confirmed';
            case 'cancelled':
            case 'rejected': return 'status-cancelled';
            default: return '';
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
        </div>
    );

    return (
        <div className="doctor-dashboard animate-fade-in">
            <div className="dashboard-heading">
                <div className="dashboard-header">
                    <div>
                        <h2>
                            <HiUser className="welcome-icon" />
                            Hello, Dr. {user?.firstName || 'Doctor'}
                        </h2>
                        <p className="text-gray-500">Here's your schedule overview for today.</p>
                    </div>
                    <div className="date-badge">
                        <HiCalendar />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-content">
                        <h3>Total Appointments</h3>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                    <div className="stat-icon-wrapper">
                        <HiCalendar />
                    </div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-content">
                        <h3>Pending Requests</h3>
                        <div className="stat-value">{stats.pending}</div>
                    </div>
                    <div className="stat-icon-wrapper">
                        <HiClock />
                    </div>
                </div>

                <div className="stat-card approved">
                    <div className="stat-content">
                        <h3>Confirmed</h3>
                        <div className="stat-value">{stats.approved}</div>
                    </div>
                    <div className="stat-icon-wrapper">
                        <HiCheckCircle />
                    </div>
                </div>

                <div className="stat-card cancelled">
                    <div className="stat-content">
                        <h3>Cancelled</h3>
                        <div className="stat-value">{stats.cancelled}</div>
                    </div>
                    <div className="stat-icon-wrapper">
                        <HiXCircle />
                    </div>
                </div>
            </div>

            {/* Appointments Section */}
            <div className="appointments-section">
                <div className="section-header">
                    <h3>Upcoming Appointments</h3>
                </div>

                <div className="table-container">
                    <table className="appointments-table">
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
                            {appointments.slice(0, 5).map((appointment) => (
                                <tr key={appointment._id}>
                                    <td>
                                        <div className="patient-info">
                                            <div className="patient-avatar">
                                                {appointment.firstName?.charAt(0) || <HiUser />}
                                            </div>
                                            <div className="patient-details">
                                                <p className="patient-name">{appointment.firstName} {appointment.lastName}</p>
                                                <p className="patient-meta">{appointment.phone || 'No phone'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="patient-details">
                                            <p className="patient-name">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                                            <p className="patient-meta">{appointment.appointmentTime || 'N/A'}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-gray-600">{appointment.department || 'General'}</span>
                                    </td>
                                    <td>
                                        <button className="action-btn" title="View Details">
                                            <HiEye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {appointments.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="no-data">
                                        <div className="no-data-icon"><HiCalendar /></div>
                                        <p>No appointments scheduled yet.</p>
                                    </td>
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
