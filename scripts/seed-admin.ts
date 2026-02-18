/**
 * Seed Script for Creating First Admin Account
 *
 * Run this script locally using ts-node or bun:
 *
 * Using bun:
 * $ bun run scripts/seed-admin.ts
 *
 * Using ts-node:
 * $ npx ts-node scripts/seed-admin.ts
 *
 * This script will:
 * 1. Create a user in Firebase Authentication
 * 2. Create a corresponding document in Firestore 'users' collection
 */

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDC2Y74RUUv42TBf7XwADik2qlzW4OYUxE",
  authDomain: "gudangbarangya.firebaseapp.com",
  projectId: "gudangbarangya",
  storageBucket: "gudangbarangya.firebasestorage.app",
  messagingSenderId: "876179737101",
  appId: "1:876179737101:web:bd432ca52a39d4336e2344",
  measurementId: "G-KTX1C7LBFX",
};

// Admin credentials - CHANGE THESE BEFORE RUNNING
const ADMIN_EMAIL = "admin@pln.co.id";
const ADMIN_PASSWORD = "Admin@PLN2024"; // Use a strong password
const ADMIN_NAME = "Super Admin PLN";

async function seedAdmin() {
  console.log("🚀 Starting admin seed script...\n");

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    // Create user in Firebase Auth
    console.log(`📧 Creating auth user: ${ADMIN_EMAIL}`);
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);

    const uid = userCredential.user.uid;
    console.log(`✅ Auth user created with UID: ${uid}`);

    // Create user document in Firestore
    console.log("📝 Creating Firestore document...");
    await setDoc(doc(db, "users", uid), {
      uid,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: "admin_gudang",
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log("✅ Firestore document created");
    console.log("\n========================================");
    console.log("🎉 ADMIN ACCOUNT CREATED SUCCESSFULLY!");
    console.log("========================================");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`Role: admin_gudang`);
    console.log("========================================\n");
    console.log("⚠️  IMPORTANT: Change the password after first login!");
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      console.error("❌ Error: This email is already registered.");
      console.log("If you need to reset, delete the user from Firebase Console first.");
    } else {
      console.error("❌ Error creating admin:", error.message);
    }
    process.exit(1);
  }

  process.exit(0);
}

// Run the seed function
seedAdmin();
