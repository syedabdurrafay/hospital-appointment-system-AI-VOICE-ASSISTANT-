import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AppContext } from './context/AppContext';
import Layout from './components/Layout/Layout';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Auth/Login';
import Doctors from './components/Doctors/Doctors';
import DoctorForm from './components/Doctors/DoctorForm';
import AdminForm from './components/Admin/AdminForm';
import Messages from './components/Messages/Messages';
import Appointments from './components/Appointments/Appointments';
import ImportPatients from './components/Patients/ImportPatients';
import PrivateRoute from './components/Routes/PrivateRoute';
import PublicRoute from './components/Routes/PublicRoute';
import './App.css';

function App() {
  const { isAuthenticated } = useContext(AppContext);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public Routes - show login/register */}
          <Route path="/login" element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <Login />
            </PublicRoute>
          } />

          {/* Protected Routes with Layout */}
          <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/" element={<Layout><DoctorDashboard /></Layout>} />
            <Route path="/dashboard" element={<Layout><DoctorDashboard /></Layout>} />
            <Route path="/messages" element={<Layout><Messages /></Layout>} />
            <Route path="/appointments" element={<Layout><Appointments /></Layout>} />
          </Route>

          {/* Catch-all route - redirect based on auth status */}
          <Route path="*" element={
            isAuthenticated ?
              <Layout><DoctorDashboard /></Layout> :
              <PublicRoute isAuthenticated={isAuthenticated}>
                <Login />
              </PublicRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;