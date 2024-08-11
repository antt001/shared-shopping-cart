import { auth, googleProvider, facebookProvider } from './firebase-config';
import { signInWithPopup, signInWithEmailAndPassword, UserCredential, createUserWithEmailAndPassword } from 'firebase/auth';


export const signUp = (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};
export const signInWithGoogle = (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};

export const signInWithFacebook = (): Promise<UserCredential> => {
  return signInWithPopup(auth, facebookProvider);
};

export const signOut = (): Promise<void> => {
  return auth.signOut();
};
