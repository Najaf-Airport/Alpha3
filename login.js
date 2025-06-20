// بما أن auth و db تم تعريفهما في firebase-init.js، يمكننا الوصول إليهما مباشرة هنا
// تأكد أن firebase-init.js تم تحميله قبل هذا الملف في الـ HTML
document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = ''; // مسح أي رسالة خطأ سابقة

    if (!email || !password) {
        errorMsg.textContent = 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.';
        return;
    }

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // التحقق من البريد الإلكتروني للمسؤول
        if (user.email === 'ahmedaltalqani@gmail.com') {
            window.location.href = 'admin.html'; // تحويل للمسؤول
        } else {
            window.location.href = 'flights.html'; // تحويل للمستخدمين العاديين
        }

    } catch (error) {
        let message = 'خطأ في تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = 'البريد الإلكتروني أو كلمة المرور خاطئة.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'صيغة البريد الإلكتروني غير صحيحة.';
        }
        errorMsg.textContent = message;
        console.error("Login error:", error);
    }
});
