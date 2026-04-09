import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { onAuthStateChanged, ConfirmationResult } from 'firebase/auth';
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from '../config/firebase';
import { registerUser, getProfile } from '../services/api';
import type { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  pendingRole: UserRole | null;
  pendingPhone: string;
  setRole: (role: UserRole) => void;
  setPendingPhone: (phone: string) => void;
  sendOTP: (phone: string, recaptchaContainerId: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  login: (role: UserRole, phone: string) => void; // kept for compat, use verifyOTP
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
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

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
            const profile = data.user;
            setUser(profile);
            setRoleState(profile.role);
          } else {
            setUser(null);
            setRoleState(null);
          }
        } catch {
          setUser(null);
          setRoleState(null);
        }
      } else {
        setUser(null);
        setRoleState(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const setRole = (r: UserRole) => setPendingRole(r);

  const sendOTP = async (phone: string, recaptchaContainerId: string) => {
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
    const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
      callback: () => {},
    });
    recaptchaRef.current = verifier;
    const formatted = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;
    const result = await signInWithPhoneNumber(auth, formatted, verifier);
    confirmationRef.current = result;
    setPendingPhone(formatted);
  };

  const verifyOTP = async (otp: string) => {
    if (!confirmationRef.current) throw new Error('No OTP session. Please request OTP again.');
    const credential = PhoneAuthProvider.credential(
      (confirmationRef.current as any).verificationId,
      otp
    );
    const result = await signInWithCredential(auth, credential);
    const token = await result.user.getIdToken();

    const selectedRole = pendingRole ?? 'customer';

    // Try register (new user) or fall back to existing profile
    try {
      const data = await registerUser({ name: '', role: selectedRole }) as any;
      setUser(data.user);
      setRoleState(data.user.role);
    } catch {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setRoleState(data.user.role);
      }
    }
    setPendingRole(null);
  };

  // Kept for pages that still call login() during transition
  const login = (r: UserRole, _phone: string) => {
    setPendingRole(r);
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setRoleState(null);
    setPendingRole(null);
    setPendingPhone('');
  };

  return (
    <AuthContext.Provider value={{
      user, role, loading,
      pendingRole, pendingPhone,
      setRole, setPendingPhone,
      sendOTP, verifyOTP, login, logout,
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
