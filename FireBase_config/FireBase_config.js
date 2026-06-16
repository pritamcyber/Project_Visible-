import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT
    );
  } catch (error) {
    throw new Error(
      "Invalid JSON in FIREBASE_SERVICE_ACCOUNT"
    );
  }
} else {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL,
  } = process.env;

  if (
    !FIREBASE_PROJECT_ID ||
    !FIREBASE_PRIVATE_KEY ||
    !FIREBASE_CLIENT_EMAIL
  ) {
    throw new Error(
      "Missing Firebase credentials. Provide FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL."
    );
  }

  serviceAccount = {
    projectId: FIREBASE_PROJECT_ID,
    privateKey: FIREBASE_PRIVATE_KEY.replace(
      /\\n/g,
      "\n"
    ),
    clientEmail: FIREBASE_CLIENT_EMAIL,
  };
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      serviceAccount
    ),
  });
}

export default admin;