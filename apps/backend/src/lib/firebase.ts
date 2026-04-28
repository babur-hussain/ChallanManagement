import admin from 'firebase-admin';
import { env } from '../config/env.js';
import { logger } from './logger.js';

// ═══════════════════════════════════════════════════════════════
// Firebase Admin SDK
// Initialized once at startup with service account credentials
// ═══════════════════════════════════════════════════════════════

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase(): admin.app.App {
  if (firebaseApp) return firebaseApp;

  try {
    // Use private key from env (handles escaped newlines)
    const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      projectId: env.FIREBASE_PROJECT_ID,
    });

    logger.info('✅ Firebase Admin SDK initialized', {
      projectId: env.FIREBASE_PROJECT_ID,
    });

    return firebaseApp;
  } catch (error) {
    logger.error('❌ Failed to initialize Firebase Admin SDK', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export function getFirebaseAuth(): admin.auth.Auth {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return admin.auth(firebaseApp);
}

export function getFirebaseFirestore(): admin.firestore.Firestore {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return admin.firestore(firebaseApp);
}

export async function checkFirebaseHealth(): Promise<boolean> {
  try {
    if (!firebaseApp) return false;
    // Simple check: list 1 user to verify connectivity
    await admin.auth(firebaseApp).listUsers(1);
    return true;
  } catch {
    return false;
  }
}
