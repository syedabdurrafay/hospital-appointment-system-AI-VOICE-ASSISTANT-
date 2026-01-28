import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import {
  HiHome,
  HiUserGroup,
  HiUserAdd,
  HiUserCircle,
  HiChatAlt2,
  HiCalendar,
  HiCog,
  HiLogout,
  HiSun,
  HiMoon,
  HiGlobe,
  HiUpload
} from 'react-icons/hi';
import './Sidebar.css';

const Sidebar = () => {
  const { theme, setTheme, language, setLanguage, logout, sidebarOpen, setSidebarOpen, user } = useContext(AppContext);
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: <HiHome />, label: { en: 'Dashboard', de: 'Dashboard' } },
    { path: '/doctors', icon: <HiUserGroup />, label: { en: 'Doctors', de: 'Ärzte' } },
    { path: '/doctors/add', icon: <HiUserAdd />, label: { en: 'Add Doctor', de: 'Arzt hinzufügen' } },
    { path: '/admins/add', icon: <HiUserCircle />, label: { en: 'Add Admin', de: 'Admin hinzufügen' } },
    { path: '/appointments', icon: <HiCalendar />, label: { en: 'Appointments', de: 'Termine' } },
    { path: '/patients/import', icon: <HiUpload />, label: { en: 'Import Patients', de: 'Patienten importieren' } },
    { path: '/messages', icon: <HiChatAlt2 />, label: { en: 'Messages', de: 'Nachrichten' } },
    { path: '/settings', icon: <HiCog />, label: { en: 'Settings', de: 'Einstellungen' } },
  ];

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🏥</span>
          <h1 className="logo-text">HealthCare Pro</h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label[language]}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="footer-btn"
          onClick={setTheme}
          title={language === 'en' ? 'Toggle theme' : 'Thema wechseln'}
        >
          {theme === 'light' ? <HiMoon /> : <HiSun />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <button
          className="footer-btn"
          onClick={setLanguage}
          title={language === 'en' ? 'Switch language' : 'Sprache wechseln'}
        >
          <HiGlobe />
          <span>{language === 'en' ? 'DE' : 'EN'}</span>
        </button>

        <button
          className="footer-btn logout-btn"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <HiLogout />
          <span>{language === 'en' ? 'Logout' : 'Abmelden'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;