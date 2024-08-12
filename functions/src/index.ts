/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { beforeUserCreated } from "firebase-functions/v2/identity";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as firebaseAdmin from "firebase-admin";

let app: firebaseAdmin.app.App | null = null;

const getApp = () => {
  if (!app) {
    app = firebaseAdmin.initializeApp();
  }
  return app;
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  timestamp: number;
}

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

export const updateUserRole = onCall(async (request) => {
  // Ensure the request is made by an authenticated user
  if (!request.auth) {
    throw new HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const app = getApp();
  // Check if the requesting user has the admin role
  const requester = await firebaseAdmin.auth(app).getUser(request.auth.uid);
  if (requester.customClaims && requester.customClaims.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can update roles.");
  }

  const { uid, role } = request.data;
  try {
    await firebaseAdmin.auth(app).setCustomUserClaims(uid, { role });
    // Save the role to Firestore in a separate collection
    const roleDoc = await firebaseAdmin.firestore(app)
      .collection("userRoles")
      .doc(uid)
      .set({
        role,
      }, { merge: true });
    logger.info(`Updated role document at ${roleDoc.writeTime.toDate()} seconds`);
    return {
      success: true,
    };
  } catch (error) {
    logger.error(error);
    throw new HttpsError("unknown", "Failed to update role.");
  }
});

export const clearExpiredCartItems = onSchedule("every 24 hours", async () => {
  const app = getApp();
  const now = Date.now();
  const cutoff = now - 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds;

  try {
    const carts = await firebaseAdmin.firestore(app)
      .collection("carts")
      .get();
    const promises: Promise<any>[] = [];

    carts.forEach(cart => {
      const cartData = cart.data();
      const expiredItems = cartData.items.filter((item:CartItem) => item.timestamp < cutoff);
      if (expiredItems.length > 0) {
        promises.push(firebaseAdmin.firestore(app)
          .collection("carts")
          .doc(cart.id)
          .update({
            items: firebaseAdmin.firestore.FieldValue.arrayRemove(...expiredItems),
          }));
      }
    });
    await Promise.all(promises);
  } catch (error) {
    logger.error(error);
  }
});
