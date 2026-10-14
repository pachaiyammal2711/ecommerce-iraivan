const admin = require('firebase-admin');

let firebaseAdminApp = null;

try {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : null;

    if (projectId && clientEmail && privateKey) {
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      // Initialize with project ID if service account key is not yet set in .env
      firebaseAdminApp = admin.initializeApp({
        projectId: projectId || 'iraivan-angadi',
      });
    }
  } else {
    firebaseAdminApp = admin.app();
  }
} catch (error) {
  console.warn('Firebase Admin SDK init notice:', error.message);
}

module.exports = admin;
