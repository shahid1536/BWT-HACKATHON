import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from token and verify with backend
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('docukeep_token');
      const savedUser = localStorage.getItem('docukeep_user');

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            console.error('Failed to parse cached user', e);
          }
        }

        try {
          const res = await authApi.getMe();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('docukeep_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid, clearing local auth');
          localStorage.removeItem('docukeep_token');
          localStorage.removeItem('docukeep_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data?.success) {
      const { user: loggedInUser, token: authToken } = res.data;
      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem('docukeep_token', authToken);
      localStorage.setItem('docukeep_user', JSON.stringify(loggedInUser));
      return loggedInUser;
    } else {
      throw new Error(res.data?.message || 'Login failed.');
    }
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    if (res.data?.success) {
      const { user: registeredUser, token: authToken } = res.data;
      setUser(registeredUser);
      setToken(authToken);
      localStorage.setItem('docukeep_token', authToken);
      localStorage.setItem('docukeep_user', JSON.stringify(registeredUser));
      return registeredUser;
    } else {
      throw new Error(res.data?.message || 'Registration failed.');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Logout API call failed, clearing client state anyway', e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('docukeep_token');
      localStorage.removeItem('docukeep_user');
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('docukeep_user', JSON.stringify(updatedUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
