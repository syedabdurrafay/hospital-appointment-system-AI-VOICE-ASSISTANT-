import React from 'react';

const DashboardSidebar = ({ user, activeTab, onTabChange, upcomingCount }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'appointments', label: 'Appointments', icon: '📅', badge: upcomingCount },
    { id: 'medical', label: 'Medical Records', icon: '📋' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { id: 'billing', label: 'Billing', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
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
            onClick={() => onTabChange(item.id)}
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
            <span className="btn-icon">+</span>
            New Appointment
          </button>
          <button 
            className="btn btn-outline btn-block"
            onClick={() => window.location.href = '/emergency'}
          >
            <span className="btn-icon">🚨</span>
            Emergency Contact
          </button>
        </div>
        
        <div className="sidebar-help">
          <p>Need help?</p>
          <a href="/help" className="help-link">Contact Support</a>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;