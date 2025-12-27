import { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { HiMenu, HiBell, HiSearch, HiX } from 'react-icons/hi';
import './Topbar.css';

const Topbar = () => {
  const { user, language, sidebarOpen, setSidebarOpen } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');

  const translations = {
    en: {
      search: 'Search...',
      notifications: 'Notifications',
      welcome: 'Welcome back'
    },
    de: {
      search: 'Suchen...',
      notifications: 'Benachrichtigungen',
      welcome: 'Willkommen zurück'
    }
  };

  const t = translations[language];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button 
          className="menu-toggle" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <HiX /> : <HiMenu />}
        </button>
        
        <div className="search-container">
          <HiSearch className="search-icon" />
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="topbar-right">
        <button className="notification-btn">
          <HiBell />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-profile">
          <div className="user-avatar">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="user-info">
            <span className="user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="user-role">
              {user?.role || 'Administrator'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;