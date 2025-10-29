// firebase.js
const app = firebase.initializeApp(window.EMNZ_FIREBASE_CONFIG);
window.firebaseApp = app;
window.auth = firebase.auth();
window.db = firebase.firestore();
