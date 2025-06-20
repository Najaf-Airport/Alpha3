// ملف: js/firebase-init.js

// استيراد الدوال التي تحتاجها من الـ SDKs (طريقة وحدة Firebase SDK v9)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, enablePersistence } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
// إذا كنت تنوي استخدام Analytics، فستحتاج أيضًا إلى استيراد getAnalytics
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";


// إعدادات Firebase لتطبيق الويب الخاص بك
const firebaseConfig = {
  apiKey: "AIzaSyAiU4-PvYgqnWbVLgISz73P9D4HaSIhW-o",
  authDomain: "abcd-3b894.firebaseapp.com",
  projectId: "abcd-3b894",
  storageBucket: "abcd-3b894.firebasestorage.app",
  messagingSenderId: "41388459465",
  appId: "1:41388459465:web:9c67ef67f0ad4810e55418",
  measurementId: "G-7W49C0JDFT" // هذا السطر تحديدًا هو ما قدمته ويجب أن يكون في ملفك
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// قم بتهيئة خدمات Firebase التي ستستخدمها
const auth = getAuth(app);
const db = getFirestore(app);

// إذا كنت تريد استخدام Analytics، قم بإلغاء التعليق عن السطر التالي:
// const analytics = getAnalytics(app);


// تمكين وضع عدم الاتصال بالإنترنت (اختياري، ولكن يفضل)
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
