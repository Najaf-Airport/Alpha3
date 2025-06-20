// ملف: js/firebase-init.js

// استيراد الدوال من Firebase SDK v9.22.0
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js"; // اختياري

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAiU4-PvYgqnWbVLgISz73P9D4HaSIhW-o",
  authDomain: "abcd-3b894.firebaseapp.com",
  projectId: "abcd-3b894",
  storageBucket: "abcd-3b894.firebasestorage.app",
  messagingSenderId: "41388459465",
  appId: "1:41388459465:web:9c67ef67f0ad4810e55418",
  measurementId: "G-7W49C0JDFT"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// تفعيل التخزين المؤقت (Persistence)
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence not enabled: Multiple tabs open.');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence not enabled: Browser not supported.');
  }
});

// تصدير المتغيرات
export { auth, db };
