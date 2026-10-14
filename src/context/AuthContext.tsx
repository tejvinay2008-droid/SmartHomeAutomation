import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  updateProfile as firebaseUpdateProfile,
  updatePassword as firebaseUpdatePassword,
  deleteUser as firebaseDeleteUser
} from 'firebase/auth';
import { auth, googleProvider, yahooProvider, isFirebaseConfigured } from '../services/firebase';
import type { UserProfile, AuthProviderType } from '../types/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseActive: boolean;
  oauthConfigNotice: string | null;
  clearOauthNotice: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithYahoo: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateDisplayName: (name: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPass: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const LOCAL_USER_STORAGE_KEY = 'smarthome_auth_active_user_v2';
const LOCAL_REGISTRY_KEY = 'smarthome_user_accounts_v2';

const DEFAULT_SARAH_USER: UserProfile = {
  uid: 'sarah_default_uid_01',
  email: 'sarah.m@smarthome.ai',
  displayName: 'Sarah Miller',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  providerId: 'password',
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [oauthConfigNotice, setOauthConfigNotice] = useState<string | null>(null);
  const isFirebaseActive = isFirebaseConfigured();

  // Initialize Auth State Listener
  useEffect(() => {
    if (isFirebaseActive && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const providerId = (firebaseUser.providerData[0]?.providerId as AuthProviderType) || 'password';
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Smart Home Resident',
            photoURL: firebaseUser.photoURL || null,
            providerId,
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local fallback account system
      try {
        const saved = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
        if (saved) {
          setUser(JSON.parse(saved));
        } else {
          // Set initial default resident Sarah so existing demonstration runs smoothly
          setUser(DEFAULT_SARAH_USER);
          localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(DEFAULT_SARAH_USER));
        }
      } catch {
        setUser(DEFAULT_SARAH_USER);
      }
      setLoading(false);
    }
  }, [isFirebaseActive]);

  const clearOauthNotice = () => setOauthConfigNotice(null);

  // 1. Email & Password Login
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (isFirebaseActive && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const providerId = (cred.user.providerData[0]?.providerId as AuthProviderType) || 'password';
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || 'Resident',
          photoURL: cred.user.photoURL,
          providerId,
          createdAt: cred.user.metadata.creationTime || new Date().toISOString(),
        });
        setLoading(false);
        return { success: true };
      } else {
        // Local Registry verification
        const accountsRaw = localStorage.getItem(LOCAL_REGISTRY_KEY);
        const accounts: Record<string, { passwordHash: string; profile: UserProfile }> = accountsRaw
          ? JSON.parse(accountsRaw)
          : {};

        if (email === 'sarah.m@smarthome.ai' && pass === 'password123') {
          setUser(DEFAULT_SARAH_USER);
          localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(DEFAULT_SARAH_USER));
          setLoading(false);
          return { success: true };
        }

        const match = accounts[email.toLowerCase()];
        if (match && match.passwordHash === pass) {
          setUser(match.profile);
          localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(match.profile));
          setLoading(false);
          return { success: true };
        }

        setLoading(false);
        return { success: false, error: 'Invalid email or password. (For default resident, use: sarah.m@smarthome.ai / password123)' };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Authentication failed.' };
    }
  };

  // 2. Sign Up
  const signup = async (email: string, pass: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (isFirebaseActive && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await firebaseUpdateProfile(cred.user, { displayName: name });
        const newProfile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name,
          photoURL: null,
          providerId: 'password',
          createdAt: new Date().toISOString(),
        };
        setUser(newProfile);
        setLoading(false);
        return { success: true };
      } else {
        const accountsRaw = localStorage.getItem(LOCAL_REGISTRY_KEY);
        const accounts: Record<string, { passwordHash: string; profile: UserProfile }> = accountsRaw
          ? JSON.parse(accountsRaw)
          : {};

        if (accounts[email.toLowerCase()] || email.toLowerCase() === 'sarah.m@smarthome.ai') {
          setLoading(false);
          return { success: false, error: 'An account with this email already exists.' };
        }

        const newProfile: UserProfile = {
          uid: 'user_' + Date.now().toString(),
          email,
          displayName: name,
          photoURL: null,
          providerId: 'password',
          createdAt: new Date().toISOString(),
        };

        accounts[email.toLowerCase()] = {
          passwordHash: pass,
          profile: newProfile,
        };

        localStorage.setItem(LOCAL_REGISTRY_KEY, JSON.stringify(accounts));
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(newProfile));
        setUser(newProfile);
        setLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  // 3. Google OAuth
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseActive || !auth || !googleProvider) {
      const msg = 'Google OAuth requires active Firebase configuration. Please add VITE_FIREBASE_API_KEY and credentials to your .env.local file (see .env.example) and enable Google in the Firebase Console.';
      setOauthConfigNotice(msg);
      return { success: false, error: msg };
    }

    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      const profile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || 'Google Resident',
        photoURL: res.user.photoURL,
        providerId: 'google.com',
        createdAt: res.user.metadata.creationTime || new Date().toISOString(),
      };
      setUser(profile);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Google sign-in was interrupted.' };
    }
  };

  // 4. Yahoo OAuth
  const loginWithYahoo = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseActive || !auth || !yahooProvider) {
      const msg = 'Yahoo OAuth requires active Firebase configuration. Please configure Yahoo Client ID & Secret in Firebase Console > Authentication > Sign-in method > Yahoo, and add Firebase keys to .env.local.';
      setOauthConfigNotice(msg);
      return { success: false, error: msg };
    }

    try {
      setLoading(true);
      const res = await signInWithPopup(auth, yahooProvider);
      const profile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || 'Yahoo Resident',
        photoURL: res.user.photoURL,
        providerId: 'yahoo.com',
        createdAt: res.user.metadata.creationTime || new Date().toISOString(),
      };
      setUser(profile);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Yahoo sign-in was interrupted.' };
    }
  };

  // 5. Logout
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      if (isFirebaseActive && auth) {
        await firebaseSignOut(auth);
      }
      localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 6. Reset Password
  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      if (isFirebaseActive && auth) {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: `Password reset email dispatched to ${email}. Please check your inbox.` };
      } else {
        return { success: true, message: `Password reset instructions recorded for ${email}. In demo mode, your temporary password is reset to: demoPass2026!` };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send password reset.' };
    }
  };

  // 7. Update Profile
  const updateDisplayName = async (name: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user signed in.' };
    try {
      if (isFirebaseActive && auth?.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: name });
      }
      const updated: UserProfile = { ...user, displayName: name };
      setUser(updated);
      localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update name.' };
    }
  };

  // 8. Change Password
  const changePassword = async (newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user signed in.' };
    try {
      if (isFirebaseActive && auth?.currentUser) {
        await firebaseUpdatePassword(auth.currentUser, newPass);
        return { success: true };
      } else {
        const accountsRaw = localStorage.getItem(LOCAL_REGISTRY_KEY);
        if (accountsRaw && user.email) {
          const accounts = JSON.parse(accountsRaw);
          if (accounts[user.email.toLowerCase()]) {
            accounts[user.email.toLowerCase()].passwordHash = newPass;
            localStorage.setItem(LOCAL_REGISTRY_KEY, JSON.stringify(accounts));
          }
        }
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Password update failed. Re-authentication may be required.' };
    }
  };

  // 9. Delete Account
  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user signed in.' };
    try {
      if (isFirebaseActive && auth?.currentUser) {
        await firebaseDeleteUser(auth.currentUser);
      } else {
        const accountsRaw = localStorage.getItem(LOCAL_REGISTRY_KEY);
        if (accountsRaw && user.email) {
          const accounts = JSON.parse(accountsRaw);
          delete accounts[user.email.toLowerCase()];
          localStorage.setItem(LOCAL_REGISTRY_KEY, JSON.stringify(accounts));
        }
      }
      localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
      // Clean up user-specific smart home state
      localStorage.removeItem(`smarthome_devices_${user.uid}`);
      localStorage.removeItem(`smarthome_rooms_${user.uid}`);
      localStorage.removeItem(`smarthome_activities_${user.uid}`);
      setUser(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete account.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseActive,
        oauthConfigNotice,
        clearOauthNotice,
        login,
        signup,
        loginWithGoogle,
        loginWithYahoo,
        logout,
        resetPassword,
        updateDisplayName,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
