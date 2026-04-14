import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithCustomToken } from '../config/firebase';
import type { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  pendingRole: UserRole | null;
  pendingPhone: string;
  setRole: (role: UserRole) => void;
  setPendingPhone: (phone: string) => void;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<AuthUser | null>;
  login: (role: UserRole, phone: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [pendingPhone, setPendingPhone] = useState('');

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
            setUser(data.user);
            setRoleState(data.user.role);
          } else {
            setUser(null); setRoleState(null);
          }
        } catch {
          setUser(null); setRoleState(null);
        }
      } else {
        setUser(null); setRoleState(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const setRole = (r: UserRole) => setPendingRole(r);

  const sendOTP = async (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    const res = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: digits }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    setPendingPhone(digits);
  };

  const verifyOTP = async (otp: string): Promise<AuthUser | null> => {
    const selectedRole = pendingRole ?? 'customer';
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: pendingPhone, otp, role: selectedRole }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid OTP');

    const credential = await signInWithCustomToken(auth, data.customToken);
    const idToken = await credential.user.getIdToken();

    let resolvedUser: AuthUser | null = null;

    const profileRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ name: '', role: selectedRole }),
    });
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      resolvedUser = profileData.user;
      setUser(profileData.user); setRoleState(profileData.user.role);
    } else {
      const existing = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (existing.ok) {
        const profileData = await existing.json();
        resolvedUser = profileData.user;
        setUser(profileData.user); setRoleState(profileData.user.role);
      }
    }
    setPendingRole(null);
    return resolvedUser;
  };

  const login = (r: UserRole, _phone: string) => setPendingRole(r);

  const logout = async () => {
    await auth.signOut();
    setUser(null); setRoleState(null);
    setPendingRole(null); setPendingPhone('');
  };

  return (
    <AuthContext.Provider value={{
      user, role, loading, pendingRole, pendingPhone,
      setRole, setPendingPhone, sendOTP, verifyOTP, login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
