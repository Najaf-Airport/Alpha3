import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { auth } from './firebase-init.js'; // استيراد auth من firebase-init.js

// دالة تسجيل الدخول
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("تم تسجيل الدخول بنجاح");
    // إعادة توجيه المستخدم بعد الدخول
    window.location.href = "flights.html";
  } catch (error) {
    console.error("Login error:", error.message);
    alert("فشل تسجيل الدخول: " + error.message);
  }
};
