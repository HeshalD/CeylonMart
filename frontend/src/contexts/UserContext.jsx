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
  const [userRole, setUserRole] = useState(null); // 'driver' or 'manager'
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing login on app load
  useEffect(() => {
    const savedDriverId = localStorage.getItem('driverId');
    if (savedDriverId) {
      // Driver is logged in
      setUser({ id: savedDriverId, role: 'driver' });
      setUserRole('driver');
      setIsAuthenticated(true);
    } else {
      // Check if manager is logged in (you can implement manager login later)
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
    }
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('driverId');
    localStorage.removeItem('managerId');
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
