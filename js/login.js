// ملف: js/login.js

// يجب استيراد auth من firebase-init.js
import { auth } from "./firebase-init.js";

// نستخدم DOMContentLoaded للتأكد من أن جميع عناصر HTML قد تم تحميلها قبل محاولة الوصول إليها
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm'); // النموذج الذي أضفنا له ID في index.html
    const messageDiv = document.getElementById('message'); // العنصر الذي أضفنا له ID في index.html (كان errorMsg)

    // تأكد من وجود النموذج قبل إضافة مستمع الحدث
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => { // استخدم event listener على حدث 'submit' للنموذج
            e.preventDefault(); // منع إعادة تحميل الصفحة الافتراضية
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            messageDiv.textContent = ''; // مسح أي رسالة سابقة
            messageDiv.className = 'message'; // إعادة تعيين الفئات لضمان إزالة رسائل النجاح/الخطأ

            if (!email || !password) {
                messageDiv.className = 'message error-message';
                messageDiv.textContent = 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.';
                return;
            }

            try {
                // استخدام auth مباشرة
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // التحقق من البريد الإلكتروني للمسؤول
                if (user.email === 'ahmedaltalqani@gmail.com') { // *** تأكد من مطابقة هذا البريد الإلكتروني تماماً ***
                    window.location.href = 'admin.html'; // تحويل للمسؤول
                } else {
                    window.location.href = 'flights.html'; // تحويل للمستخدمين العاديين
                }

            } catch (error) {
                let message = 'خطأ في تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    message = 'البريد الإلكتروني أو كلمة المرور خاطئة.';
                } else if (error.code === 'auth/invalid-email') {
                    message = 'صيغة البريد الإلكتروني غير صحيحة.';
                } else if (error.code === 'auth/too-many-requests') {
                    message = 'تم حظر هذا الحساب مؤقتًا بسبب كثرة محاولات تسجيل الدخول الفاشلة. يرجى المحاولة لاحقًا.';
                }
                messageDiv.className = 'message error-message';
                messageDiv.textContent = message;
                console.error("Login error:", error);
            }
        });
    } else {
        console.error("Login form (ID 'loginForm') not found in the DOM for login.js.");
    }
});
