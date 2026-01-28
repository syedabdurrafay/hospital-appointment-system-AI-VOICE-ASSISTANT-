import { Navigate } from 'react-router-dom';

const PublicRoute = ({ isAuthenticated, children }) => {
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

export default PublicRoute;