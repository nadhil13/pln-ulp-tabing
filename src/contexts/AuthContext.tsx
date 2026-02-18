import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; redirectPath?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isRole: (role: UserRole | UserRole[]) => boolean;
  getRedirectPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any old demo data if exists (migration cleanup)
    localStorage.removeItem('demo_user');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              uid: user.uid,
              email: user.email || '',
              name: data.name || '',
              role: data.role || 'staff',
              createdAt: data.createdAt?.toDate() || new Date(),
              active: data.active ?? true,
              photoURL: data.photoURL,
            });
          } else {
            console.error('User document not found in Firestore');
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getRedirectPathForRole = (role: UserRole): string => {
    switch (role) {
      case 'staff':
        return '/dashboard';
      case 'verifikator':
        return '/dashboard';
      case 'admin_gudang':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; redirectPath?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Verify user exists in Firestore and is active
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        await firebaseSignOut(auth);
        return { success: false, error: 'Akun tidak terdaftar dalam sistem. Hubungi Admin.' };
      }

      const data = userDoc.data();
      if (!data.active) {
        await firebaseSignOut(auth);
        return { success: false, error: 'Akun Anda telah dinonaktifkan. Hubungi Admin.' };
      }

      // Set userData immediately so redirect is correct
      setCurrentUser(userCredential.user);
      setUserData({
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        name: data.name || '',
        role: data.role || 'staff',
        createdAt: data.createdAt?.toDate() || new Date(),
        active: data.active ?? true,
        photoURL: data.photoURL,
      });

      return { success: true, redirectPath: getRedirectPathForRole(data.role || 'staff') };
    } catch (error: any) {
      console.error('Login error:', error);

      // Map Firebase error codes to Indonesian messages
      const errorMessages: Record<string, string> = {
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/user-disabled': 'Akun Anda telah dinonaktifkan.',
        'auth/user-not-found': 'Email tidak terdaftar.',
        'auth/wrong-password': 'Password salah.',
        'auth/invalid-credential': 'Email atau password salah.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
        'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Konfigurasi Firebase tidak valid. Hubungi Admin.',
      };

      return {
        success: false,
        error: errorMessages[error.code] || 'Gagal login. Periksa email & password.',
      };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const isRole = (role: UserRole | UserRole[]) => {
    if (!userData) return false;
    if (Array.isArray(role)) {
      return role.includes(userData.role);
    }
    return userData.role === role;
  };

  const getRedirectPath = (): string => {
    if (!userData) return '/login';
    return getRedirectPathForRole(userData.role);
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signIn,
    signOut,
    resetPassword,
    isRole,
    getRedirectPath,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
