export type AuthProviderType = 'password' | 'google.com' | 'yahoo.com' | 'local';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: AuthProviderType;
  createdAt: string;
  themePreference?: ThemeMode;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseActive: boolean;
  firebaseError: string | null;
}
