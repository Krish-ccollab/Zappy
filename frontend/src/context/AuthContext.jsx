import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { connectSocket, disconnectSocket } from '../socket/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socketToken, setSocketToken] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const applySession = useCallback((payload) => {
    setUser(payload.user);
    setSocketToken(payload.socketToken || '');
    if (payload.socketToken) {
      connectSocket(payload.socketToken);
    }
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setSocketToken('');
    disconnectSocket();
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await api.get('/auth/me');
        applySession(data);
      } catch {
        try {
          const { data } = await api.post('/auth/refresh');
          applySession(data);
        } catch {
          clearSession();
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, [applySession, clearSession]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      socketToken,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      setSession: applySession,
      clearSession,
      logout
    }),
    [user, socketToken, isBootstrapping, applySession, clearSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
