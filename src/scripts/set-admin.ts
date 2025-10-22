// HOW TO BECOME AN ADMIN:
// 1. Log in to your application in the browser with the account you want to make an admin.
// 2. Open the developer console in your browser.
//    (On most browsers, you can right-click the page, select "Inspect," and then go to the "Console" tab).
// 3. Copy the ENTIRE content of this file below this line.
// 4. Paste it into the console and press Enter.
//
// This will grant your user the 'admin' role. You only need to do this once.
// After it succeeds, refresh the page.

import { initializeFirebase } from '../firebase/index';
import { doc, setDoc } from 'firebase/firestore';

const setAdminRole = async () => {
  const { auth, firestore } = initializeFirebase();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    const message = 'No user is currently logged in. Please log in to the application before running this script.';
    console.error(message);
    alert(message);
    return;
  }

  const userEmail = currentUser.email;
  const userId = currentUser.uid;

  console.log(`Attempting to set admin role for user: ${userEmail} (UID: ${userId})`);
  alert(`Attempting to set admin role for user: ${userEmail}`);

  try {
    const roleDocRef = doc(firestore, 'roles', userId);
    await setDoc(roleDocRef, { roles: ['admin', 'customer'] }, { merge: true });
    
    const successMessage = `Successfully assigned 'admin' role to ${userEmail}. Please refresh the page for the changes to take effect.`;
    console.log(successMessage);
    alert(successMessage);
  } catch (error: any) {
    console.error('Error setting admin role:', error);
    
    const errorMessage = `An error occurred while setting the admin role. This might be because the security rules haven't been deployed yet. Please wait a minute and try running the script again.

Error: ${error.message}`;
    
    alert(errorMessage);
  }
};

setAdminRole();
