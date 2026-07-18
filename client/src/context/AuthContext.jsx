import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cfm_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('cfm_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('cfm_token', token);
    } else {
      localStorage.removeItem('cfm_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cfm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cfm_user');
    }
  }, [user]);

  const authHeaders = useMemo(
    () => ({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
    [token]
  );

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (payload) => {
    const cleanedPayload = {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    };

    const { data } = await api.post('/auth/register', cleanedPayload);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) {
      return null;
    }
    const { data } = await api.get('/users/me', authHeaders);
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, authHeaders, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
