import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { onAuthStateChanged, ConfirmationResult, signOut } from 'firebase/auth';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../config/firebase';

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
  sendOTP: (phone: string, recaptchaContainerId: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

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
              // Not an admin — sign out
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

  const sendOTP = async (phone: string, recaptchaContainerId: string) => {
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }

    const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
      callback: () => {},
    });
    recaptchaVerifierRef.current = verifier;

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
    const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    confirmationResultRef.current = result;
  };

  const verifyOTP = async (otp: string) => {
    if (!confirmationResultRef.current) throw new Error('No OTP session. Request OTP again.');

    const result = await confirmationResultRef.current.confirm(otp);
    const token = await result.user.getIdToken();

    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Failed to fetch profile');

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
      sendOTP,
      verifyOTP,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
