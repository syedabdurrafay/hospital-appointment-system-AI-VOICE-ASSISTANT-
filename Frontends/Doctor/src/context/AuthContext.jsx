import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const userData = await userService.getCurrentUser();
        if (userData && userData.role === 'Admin') {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Not an admin, clear token
          localStorage.removeItem('adminToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await userService.login(email, password);
      
      if (response.success && response.user.role === 'Admin') {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('adminToken', response.token);
        toast.success('Login successful!');
        return { success: true };
      } else {
        throw new Error('Invalid admin credentials');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('adminToken');
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        setUser,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);