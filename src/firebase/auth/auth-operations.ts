// src/firebase/auth/auth-operations.ts
'use client';

import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword as firebaseSignIn, UserCredential, signOut, updateProfile, User, signInWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { UserProfile } from '@/types';


/**
 * Creates a user profile document in Firestore.
 * This function is designed to be called after a user is created in Firebase Auth.
 * @param db The Firestore instance.
 * @param user The Firebase Auth User object.
 * @param fullName The user's full name.
 * @returns A promise that resolves when the document is written.
 */
async function createUserProfileDocument(db: Firestore, user: User, fullName: string): Promise<void> {
  const userDocRef = doc(db, 'users', user.uid);
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const userProfile: UserProfile = {
    id: user.uid,
    email: user.email!,
    firstName,
    lastName,
    phoneNumber: '',
    address: '',
    preferredLanguage: 'en',
  };

  // Use setDoc and await the result, but chain a .catch for specific error handling.
  return setDoc(userDocRef, userProfile).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: userDocRef.path,
      operation: 'create',
      requestResourceData: userProfile,
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw the original error to fail the parent `signUpWithEmailAndPassword` function
    throw serverError;
  });
}


/**
 * Creates a new user with email and password and sets up their profile document.
 * This is an atomic operation for the UI layer.
 *
 * @param auth The Firebase Auth instance.
 * @param email The user's email address.
 * @param password The user's chosen password.
 * @param fullName The user's full name.
 * @returns A promise that resolves on successful user creation and profile setup, or rejects on failure.
 */
export async function signUpWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
  fullName: string
): Promise<void> {
  try {
    // Step 1: Create the user in Firebase Authentication
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Step 2: Update the user's auth profile with their full name
    await updateProfile(user, { displayName: fullName });

    // Step 3: Create the user profile document in Firestore.
    const db = getFirestore(auth.app);
    await createUserProfileDocument(db, user, fullName);
    
    // Step 4: Automatically sign in the user after successful profile creation
    const credential = EmailAuthProvider.credential(email, password);
    await signInWithCredential(auth, credential);


  } catch (error: any) {
    // This will catch errors from any of the awaited promises above.
    // If a FirestorePermissionError was emitted, we don't need to log a generic one.
    // We re-throw so the UI layer's catch block can handle UI state.
    throw error;
  }
}


/**
 * Signs in a user with their email and password.
 * @param auth The Firebase Auth instance.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves with the UserCredential on success.
 */
export async function signInWithEmail(
  auth: Auth,
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    const userCredential = await firebaseSignIn(auth, email, password);
    return userCredential;
  } catch (error: any) {
    console.error('Error during sign-in process:', error);
    // Re-throw the error to be handled by the calling UI component
    throw error;
  }
}

/**
 * Signs out the current user.
 * @param auth The Firebase Auth instance.
 * @returns A promise that resolves when sign-out is complete.
 */
export async function signOutUser(auth: Auth): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error during sign-out process:', error);
    // Re-throw the error to be handled by the calling UI component
    throw error;
  }
}
