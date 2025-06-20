// ملف: js/firebase-init.js

// Import the functions you need from the SDKs you need (Firebase SDK v9 module method)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, enablePersistence } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiU4-PvYgqnWbVLgISz73P9D4HaSIhW-o", // ضع قيمة apiKey الخاصة بك هنا
  authDomain: "abcd-3b894.firebaseapp.com", // ضع قيمة authDomain الخاصة بك هنا
  projectId: "abcd-3b894", // ضع قيمة projectId الخاصة بك هنا
  storageBucket: "abcd-3b894.firebasestorage.app", // ضع قيمة storageBucket الخاصة بك هنا
  messagingSenderId: "41388459465", // ضع قيمة messagingSenderId الخاصة بك هنا
  appId: "1:41388459465:web:9c67ef67f0ad4810e55418" // ضع قيمة appId الخاصة بك هنا
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// قم بتهيئة خدمات Firebase التي ستستخدمها
const auth = getAuth(app);
const db = getFirestore(app);

// تمكين وضع عدم الاتال بالإنترنت (اختياري، ولكن يفضل)
enablePersistence(db)
    .catch(err => {
        if (err.code == 'failed-precondition') {
            console.warn('Persistence not enabled: Multiple tabs open, persistence can only be enabled in one.');
        } else if (err.code == 'unimplemented') {
            console.warn('Persistence not enabled: The current browser does not support all of the features.');
        }
    });

// قم بتصدير auth و db ليتم استيرادها في ملفات JS الأخرى
export { auth, db };
