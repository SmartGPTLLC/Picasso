import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBV72FSK2Jt1bjA_1s-ef57SCEMRKNq5ws",
  authDomain: "picasso-s-portraits.firebaseapp.com",
  projectId: "picasso-s-portraits",
  storageBucket: "picasso-s-portraits.firebasestorage.app",
  messagingSenderId: "229279412354",
  appId: "1:229279412354:web:9dd73f5c8c218c222f449b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  return firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};