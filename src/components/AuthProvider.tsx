import { apiFetch } from '../lib/api';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  provider?: string;
  googleId?: string;
  hasPassword?: boolean;
  avatar?: string;
  bio?: string;
  learningGoal?: string;
  preferredLanguage?: string;
  timeZone?: string;
  subscriptionPlan?: string;
  createdAt?: string;
  updatedAt?: string;
  currentStreak?: number;
  longestStreak?: number;
  lastCompletedDate?: string;
  todayCompleted?: boolean;
  xp?: number;
  level?: number;
  coins?: number;
  focusPoints?: number;
  totalTasksCompleted?: number;
  studyDays?: string[];
  achievements?: string[];
  dailyTasksGoal?: number;
  dailyHoursGoal?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch('/api/auth/me', { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
        if (res.ok) {
          const data = await res.json();
          setUser(data.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData: any) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      await apiFetch('/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
