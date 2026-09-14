/**
 * Firebase Client Abstraction
 * Handles Firebase Authentication, Firestore, and Realtime Database initialization.
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'emergencyconnect-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'emergencyconnect-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'emergencyconnect-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:demo',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://emergencyconnect-demo-default-rtdb.firebaseio.com'
};

// Check if credentials have been populated
export const isFirebaseConfigured = () => {
  return (
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== 'demo-api-key' &&
    import.meta.env.VITE_FIREBASE_API_KEY !== 'your_firebase_api_key'
  );
};
