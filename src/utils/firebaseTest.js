/**
 * Firebase Test Utility
 * Use this to verify your Firebase setup is working correctly
 */

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import auth from '../firebase/firebase-config';

/**
 * Test Firebase configuration
 */
export const testFirebaseConfig = () => {
  console.log('🔍 Testing Firebase Configuration...');

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
  };

  console.table(config);

  const allSet = Object.values(config).every(val => val === '✅ Set');

  if (allSet) {
    console.log('✅ All Firebase environment variables are set!');
    console.log('📋 Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
  } else {
    console.error('❌ Some Firebase environment variables are missing!');
    console.error('💡 Make sure your .env.local file exists and server is restarted');
  }

  return allSet;
};

/**
 * Test user registration
 */
export const testRegister = async (email = 'test@example.com', password = 'Test123456') => {
  try {
    console.log('🧪 Testing user registration...');
    console.log('Email:', email);

    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Registration successful!');
    console.log('User ID:', result.user.uid);
    console.log('Email:', result.user.email);

    return result;
  } catch (error) {
    console.error('❌ Registration failed:', error.code);
    console.error('Message:', error.message);

    if (error.code === 'auth/email-already-in-use') {
      console.log('💡 This email is already registered. Try logging in instead.');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.error('💡 Email/Password authentication is NOT enabled in Firebase Console!');
      console.error('👉 Go to: https://console.firebase.google.com/');
      console.error('👉 Select your project → Authentication → Sign-in method');
      console.error('👉 Enable "Email/Password" authentication');
    }

    throw error;
  }
};

/**
 * Test user login
 */
export const testLogin = async (email = 'test@example.com', password = 'Test123456') => {
  try {
    console.log('🧪 Testing user login...');
    console.log('Email:', email);

    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login successful!');
    console.log('User ID:', result.user.uid);
    console.log('Email:', result.user.email);

    return result;
  } catch (error) {
    console.error('❌ Login failed:', error.code);
    console.error('Message:', error.message);

    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
      console.error('💡 User not found or wrong password.');
      console.error('👉 Make sure you register first before logging in!');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.error('💡 Email/Password authentication is NOT enabled in Firebase Console!');
    }

    throw error;
  }
};

// Make functions available globally in dev mode
if (import.meta.env.DEV) {
  window.firebaseTest = {
    testConfig: testFirebaseConfig,
    testRegister,
    testLogin,
  };

  console.log('🔧 Firebase test utilities loaded!');
  console.log('Run these in console:');
  console.log('  window.firebaseTest.testConfig()');
  console.log('  await window.firebaseTest.testRegister("your@email.com", "YourPassword123")');
  console.log('  await window.firebaseTest.testLogin("your@email.com", "YourPassword123")');
}
