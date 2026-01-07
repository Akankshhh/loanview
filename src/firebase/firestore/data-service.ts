// src/firebase/firestore/data-service.ts
'use client';

import { Firestore, addDoc, collection } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { DetailedApplicationData } from '@/types';

/**
 * Adds a new loan application for a specific user to Firestore.
 * This function handles its own error emission.
 * @param firestore The Firestore instance.
 * @param userId The ID of the user submitting the application.
 * @param applicationData The loan application data.
 * @returns A promise that resolves on successful creation, or rejects with an error on failure.
 */
export function addLoanApplication(
  firestore: Firestore,
  userId: string,
  applicationData: DetailedApplicationData
): Promise<void> {
  const applicationsCollectionRef = collection(firestore, 'users', userId, 'loanApplications');
  
  // Ensure the userId is part of the document data to comply with security rules
  const dataToSave = { ...applicationData, userId };

  // Return the promise chain
  return new Promise((resolve, reject) => {
    addDoc(applicationsCollectionRef, dataToSave)
      .then(() => {
        resolve(); // Resolve the promise on success
      })
      .catch((serverError: any) => {
        // Create and emit a contextual error for permission issues
        const permissionError = new FirestorePermissionError({
          path: `${applicationsCollectionRef.path}/${'new-doc-id'}`, // Use a placeholder for the path
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        
        // Reject the promise with the original error
        reject(serverError);
      });
  });
}
