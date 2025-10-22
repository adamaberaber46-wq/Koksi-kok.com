// To run this script:
// 1. Make sure you are logged into your application in the browser.
// 2. Open the developer console in your browser.
// 3. Copy and paste the entire content of this file into the console and press Enter.
//
// This will grant your user the 'admin' role. You only need to do this once.

import { initializeFirebase } from '../firebase/index';
import { doc, setDoc } from 'firebase/firestore';

const setAdminRole = async () => {
  const { auth, firestore } = initializeFirebase();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.error(
      'No user is currently logged in. Please log in to the application before running this script.'
    );
    alert(
      'No user is currently logged in. Please log in to the application before running this script.'
    );
    return;
  }

  const userEmail = currentUser.email;
  const userId = currentUser.uid;

  console.log(`Attempting to set admin role for user: ${userEmail} (UID: ${userId})`);

  try {
    const roleDocRef = doc(firestore, 'roles', userId);
    await setDoc(roleDocRef, { roles: ['admin', 'customer'] }, { merge: true });
    console.log(
      `Successfully assigned 'admin' role to ${userEmail}. You may need to refresh the page for the changes to take effect.`
    );
    alert(
      `Successfully assigned 'admin' role to ${userEmail}. You may need to refresh the page for the changes to take effect.`
    );
  } catch (error) {
    console.error('Error setting admin role:', error);
    alert(
      `An error occurred while setting the admin role. Check the console for details.
      
Error: ${error.message}

This might be because the security rules haven't updated yet. Please wait a minute and try again.`
    );
  }
};

setAdminRole();

    