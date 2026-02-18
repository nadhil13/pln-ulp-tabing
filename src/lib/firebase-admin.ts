// Secondary Firebase App for Admin operations
// This prevents the admin from being logged out when creating new users

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '@/lib/firebase';

// Same config as main app (imported from '@/lib/firebase')

// Initialize secondary app with unique name
const secondaryAppName = 'secondary-admin-app';

function getSecondaryApp() {
  const existingApp = getApps().find(app => app.name === secondaryAppName);
  if (existingApp) {
    return existingApp;
  }
  return initializeApp(firebaseConfig, secondaryAppName);
}

/**
 * Create a new user without affecting the current admin session
 * Uses a secondary Firebase app instance
 */
export async function createUserWithoutSignIn(
  email: string, 
  password: string
): Promise<{ uid: string; email: string }> {
  const secondaryApp = getSecondaryApp();
  const secondaryAuth = getAuth(secondaryApp);
  
  try {
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      email, 
      password
    );
    
    // Sign out from secondary app immediately
    await secondaryAuth.signOut();
    
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email || email,
    };
  } catch (error) {
    // Make sure to sign out even on error
    try {
      await secondaryAuth.signOut();
    } catch {
      // Ignore signout errors
    }
    throw error;
  }
}
