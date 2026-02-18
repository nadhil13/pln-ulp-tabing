import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { createUserWithoutSignIn } from '@/lib/firebase-admin';
import { User, UserRole } from '@/types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            uid: doc.id,
            email: data.email || '',
            name: data.name || '',
            role: data.role || 'staff',
            active: data.active ?? true,
            createdAt: data.createdAt?.toDate() || new Date(),
            photoURL: data.photoURL,
          } as User;
        });
        setUsers(usersData);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError('Gagal memuat data pengguna');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createUser = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => {
    try {
      // Create user in Firebase Auth using secondary app
      const { uid } = await createUserWithoutSignIn(email, password);

      // Create user document in Firestore
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        name,
        role,
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return { success: true, uid };
    } catch (error: any) {
      console.error('Error creating user:', error);

      const code = typeof error?.code === 'string' ? error.code : '';

      // Catatan: error ini biasanya muncul jika apiKey salah ATAU apiKey dibatasi (HTTP referrer) di Google Cloud.
      if (code.includes('api-key-not-valid')) {
        return {
          success: false,
          error:
            'Konfigurasi Firebase tidak valid (API key ditolak). Cek apakah apiKey di Firebase Console benar, dan jika API key dibatasi, izinkan domain preview Lovable (*.lovableproject.com dan *.lovable.app).',
        };
      }

      const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'Email sudah terdaftar.',
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/weak-password': 'Password terlalu lemah (min. 6 karakter).',
      };

      return {
        success: false,
        error: errorMessages[code] || error.message || 'Gagal membuat akun.',
      };
    }
  };

  const updateUser = async (uid: string, data: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Gagal mengupdate pengguna' };
    }
  };

  const toggleUserStatus = async (uid: string, active: boolean) => {
    return updateUser(uid, { active });
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      
      const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'Email tidak ditemukan.',
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
      };

      return {
        success: false,
        error: errorMessages[error.code] || 'Gagal mengirim email reset password.',
      };
    }
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    toggleUserStatus,
    resetPassword,
  };
}
