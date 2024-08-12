/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import * as logger from "firebase-functions/logger";
import * as firebaseAdmin from "firebase-admin";


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

let app: firebaseAdmin.app.App | null = null;

const getApp = () => {
  if (!app) {
    app = firebaseAdmin.initializeApp();
  }
  return app;
};

export const addUserRole = beforeUserCreated(async (event) => {
  const user = event.data;
  const role = "pending"; // Default role

  try {
    const app = getApp();
    logger.info(event.data);
    // Save user to the database
    const userDoc = await firebaseAdmin.firestore(app)
      .collection("users")
      .doc(user.uid)
      .set(event.data);
    logger.info(`Added user document at ${userDoc.writeTime.toDate()}`);

    // Save the role to Firestore in a separate collection
    const roleDoc = await firebaseAdmin.firestore(app)
      .collection("userRoles")
      .doc(user.uid)
      .set({
        role,
        name: user.displayName || user.uid,
      });
    logger.info(`Added role document at ${roleDoc.writeTime.toDate()}`);
  } catch (error) {
    logger.error(error);
  }
  return {
    customClaims: {
      role: role,
    },
  };
});

function beforeUserCreated(arg0: (event: any) => Promise<{ customClaims: { role: string; }; }>) {
  throw new Error("Function not implemented.");
}
