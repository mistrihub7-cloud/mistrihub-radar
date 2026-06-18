import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let firebaseAdminError = "";

export function hasFirebaseAdminConfig() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

export function getFirebaseAdminError() {
  return firebaseAdminError;
}

export function firebaseAdminMessaging() {
  if (!hasFirebaseAdminConfig()) return null;

  try {
    firebaseAdminError = "";
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
          })
        });

    return getMessaging(app);
  } catch (error) {
    firebaseAdminError = error instanceof Error ? error.message : "Firebase Admin initialization failed.";
    console.error("Firebase Admin initialization failed", { message: firebaseAdminError });
    return null;
  }
}
