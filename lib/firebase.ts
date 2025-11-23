import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

let auth: Auth | null = null;
let db: Firestore | null = null;
let isDemoMode = false;

try {
  // @ts-ignore
  if (typeof __firebase_config !== 'undefined') {
    // @ts-ignore
    const firebaseConfig = JSON.parse(__firebase_config);
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    isDemoMode = true;
  }
} catch (e) {
  console.warn('Firebase init failed, falling back to demo mode:', e);
  isDemoMode = true;
}

// @ts-ignore
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const appId = rawAppId.replace(/[\/]/g, '_');

export { auth, db, isDemoMode, appId };
