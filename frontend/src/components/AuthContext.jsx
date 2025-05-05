import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('token') !== null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');

  const login = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    
    // Extract email from token if it exists
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.email) {
        localStorage.setItem('userEmail', payload.email);
        setUserEmail(payload.email);
      }
    } catch (err) {
      console.error('Failed to extract email from token:', err);
    }
    
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserRole('');
    setUserEmail('');
  };

  // Check token validity on mount and when token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    
    if (token) {
      // Verify token with backend
      fetch('http://localhost:5000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(response => {
        if (!response.ok) {
          logout();
        }
      }).catch(() => {
        // If there's any error, we'll keep the user logged in
        // since the token might still be valid
      });
    } else {
      setIsLoggedIn(false);
      setUserRole('');
      setUserEmail('');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;