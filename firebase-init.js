// Import the functions you need from the SDKs you need
// بما أننا نستخدم الإصدار التوافقي (compat version) في ملفات HTML، لن نحتاج لهذه imports هنا
// ولكن إذا كنت تستخدم الوحدات النمطية (modules) فستحتاجها.
// حالياً سنستخدم الطريقة التي تتوافق مع الـ SDKs التي تم تضمينها في الـ HTML.

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiU4-PvYgqnWbVLgISz73P9D4HaSIhW-o",
  authDomain: "abcd-3b894.firebaseapp.com",
  projectId: "abcd-3b894",
  storageBucket: "abcd-3b894.firebasestorage.app",
  messagingSenderId: "41388459465",
  appId: "1:41388459465:web:9c67ef67f0ad4810e55418"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig); // استخدم firebase مباشرة لأننا حملنا firebase-app-compat.js
const auth = firebase.auth(); // قم بتعريف auth هنا
const db = firebase.firestore(); // قم بتعريف db هنا
