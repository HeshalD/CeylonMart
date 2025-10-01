import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'driver', 'manager', or main user role
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing login on app load
  useEffect(() => {
    // Check for main user authentication first
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setUserRole(userData.role);
        setIsAuthenticated(true);
        return;
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    // Check for driver login
    const savedDriverId = localStorage.getItem('driverId');
    if (savedDriverId) {
      setUser({ id: savedDriverId, role: 'driver' });
      setUserRole('driver');
      setIsAuthenticated(true);
    } else {
      // Check if manager is logged in
      const savedManagerId = localStorage.getItem('managerId');
      if (savedManagerId) {
        setUser({ id: savedManagerId, role: 'manager' });
        setUserRole('manager');
        setIsAuthenticated(true);
      }
    }
  }, []);

  const login = (userData, role) => {
    setUser(userData);
    setUserRole(role);
    setIsAuthenticated(true);
    
    // Save to localStorage based on role
    if (role === 'driver') {
      localStorage.setItem('driverId', userData.id);
    } else if (role === 'manager') {
      localStorage.setItem('managerId', userData.id);
    } else {
      // Main user authentication - already handled by Login component
      // Just update the context state
    }
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    
    // Clear all localStorage items
    localStorage.removeItem('driverId');
    localStorage.removeItem('managerId');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    userRole,
    isAuthenticated,
    login,
    logout,
    isDriver: userRole === 'driver',
    isManager: userRole === 'manager'
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
