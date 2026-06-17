import { useMemo, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './auth';
import type { User } from './auth';

const getStoredUser = (): User | null => {
  const savedUser = localStorage.getItem('user');
  if (!savedUser) return null;

  try {
    const parsedUser = JSON.parse(savedUser) as Partial<User>;
    if (!parsedUser.username || !parsedUser.role) return null;
    return { username: parsedUser.username, role: parsedUser.role };
  } catch {
    return null;
  }
};

const getStoredToken = (): string | null => {
  const rawToken = localStorage.getItem('token');
  if (!rawToken) return null;

  const token = rawToken.trim();
  return token.length > 0 ? token : null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<User | null>(getStoredUser);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = Boolean(token && user);

  const value = useMemo(
    () => ({ user, token, login, logout, isAuthenticated }),
    [user, token, isAuthenticated],
  );

  return (
    <AuthContext.Provider value={value}>
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