import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AdminUser {
  uid: string;
  phone: string;
  name: string;
  role: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const res = await fetch(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user?.role === 'admin') {
              setAdmin(data.user);
            } else {
              await signOut(auth);
              setAdmin(null);
            }
          } else {
            setAdmin(null);
          }
        } catch {
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();

    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Profile not found. Make sure this account has admin role.');

    const data = await res.json();
    if (data.user?.role !== 'admin') {
      await signOut(auth);
      throw new Error('Access denied. This account does not have admin privileges.');
    }

    setAdmin(data.user);
  };

  const logout = async () => {
    await signOut(auth);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{
      admin,
      isAuthenticated: !!admin,
      loading,
      loginWithEmail,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
