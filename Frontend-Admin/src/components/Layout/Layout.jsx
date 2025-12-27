import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

const Layout = ({ children }) => {
  const { sidebarOpen } = useContext(AppContext);

  return (
    <div className="layout">
      <Sidebar />
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Topbar />
        <main className="page-content">
          <div className="container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;