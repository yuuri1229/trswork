import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase's web config is not a secret — access control is enforced by
// Firestore security rules (see firestore.rules), not by hiding these
// values. They're committed so the app works out of the box on GitHub
// Pages; VITE_FIREBASE_* env vars still override them for local dev
// against a different project.
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDtbZAUgqToUmZtbz3YTmlBjS4NTf5Rs7E',
  authDomain: 'sagyoutime.firebaseapp.com',
  projectId: 'sagyoutime',
  storageBucket: 'sagyoutime.firebasestorage.app',
  messagingSenderId: '249298760502',
  appId: '1:249298760502:web:3bb12889f05ca29647f997',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = firebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
