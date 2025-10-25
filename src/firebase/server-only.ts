// src/firebase/server-only.ts
import 'server-only';
import { initializeFirebase as initializeFirebaseGeneric } from './index';

/**
 * A wrapper for initializeFirebase that can only be imported and used
 * in Server Components, preventing client-side code from being bundled.
 */
export function initializeFirebase() {
  return initializeFirebaseGeneric();
}
