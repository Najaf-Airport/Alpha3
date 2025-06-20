// بما أن auth و db تم تعريفهما في firebase-init.js، يمكننا الوصول إليهما مباشرة هنا
// تأكد أن firebase-init.js تم تحميله قبل هذا الملف في الـ HTML
const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

let selectedMonth = new Date().getMonth() + 1; // الشهر الحالي بشكل افتراضي
let selectedYear = new Date().getFullYear();

// التحقق من حالة المصادقة ومن أن المستخدم هو المسؤول
auth.onAuthStateChanged(user => {
    if (user) {
        if (user.email === 'ahmedaltalqani@gmail.com') { //
            populateMonthSelect(); // يجب أن يتم قبل loadAdminData لتحديد الشهر المختار
            loadAdminData();
        } else {
            // إذا لم يكن المسؤول، أعد التوجيه لصفحة تسجيل الدخول
            alert('ليس لديك صلاحيات الوصول لهذه الصفحة.');
            auth.signOut();
            window.location.href = 'login.html';
        }
    } else {
        window.location.href = 'login.html';
    }
});

// زر تسجيل الخروج للمسؤول
document.getElementById('logoutBtnAdmin').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
});


// ملء قائمة الشهور
function populateMonthSelect() {
    const monthSelect = document.getElementById('monthSelect');
    monthSelect.innerHTML = ''; // مسح الخيارات السابقة

    for (let i = 0; i < 12; i++) {
        const option = document.createElement('option');
        option.value = i + 1; // الشهور من 1 إلى 12
        option.textContent = monthNames[i];
        if (i + 1 === selectedMonth) {
            option.selected = true;
        }
        monthSelect.appendChild(option);
    }
    document.getElementById('currentMonthName').textContent = monthNames[selectedMonth - 1];
}

document.getElementById('monthSelect').addEventListener('change', (event) => {
    selectedMonth = parseInt(event.target.value);
    document.getElementById('currentMonthName').textContent = monthNames[selectedMonth - 1];
    loadAdminData(); // إعادة تحميل البيانات للشهر الجديد
});


async function loadAdminData() {
    const userStatsList = document.getElementById('userStatsList');
    const allFlightsTable = document.getElementById('allFlightsTable');
    const totalFlightsCountSpan = document.getElementById('totalFlightsCount');
    const noUserStatsMsg = document.getElementById('noUserStats'); // جلب العنصر
    const noAllFlightsMsg = document.getElementById('noAllFlights'); // جلب العنصر

    userStatsList.innerHTML = ''; // مسح قائمة إحصائيات المستخدمين القديمة
    allFlightsTable.innerHTML = ''; // مسح جدول الرحلات القديم

    noUserStatsMsg.style.display = 'block'; // إظهار رسالة "لا توجد بيانات مستخدمين" بشكل افتراضي
    noAllFlightsMsg.style.display = 'block'; // إظهار رسالة "لا توجد رحلات" بشكل افتراضي

    let totalFlights = 0;
    const userFlightCounts = {};
    const allFlightsData = [];

    try {
        const usersCollectionRef = db.collection(`months/${selectedMonth}-${selectedYear}/users`);
        const usersSnapshot = await usersCollectionRef.get();

        // إذا لم يكن هناك أي مستخدمين لهذا الشهر
        if (usersSnapshot.empty) {
            totalFlightsCountSpan.textContent = '0';
            noUserStatsMsg.style.display = 'block';
            noAllFlightsMsg.style.display = 'block';
            return; // إنهاء الدالة هنا
        }

        noUserStatsMsg.style.display = 'none'; // إخفاء رسالة "لا توجد بيانات مستخدمين" إذا كان هناك مستخدمون

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const flightsRef = usersCollectionRef.doc(userId).collection('flights');
            const flightsSnapshot = await flightsRef.get();

            let currentUserFlightsCount = 0;
            flightsSnapshot.forEach(flightDoc => {
                const flight = flightDoc.data();
                allFlightsData.push(flight); // جمع كل الرحلات
                currentUserFlightsCount++;
                totalFlights++;
            });

            // سنأخذ الاسم من أول رحلة للمستخدم (افترضنا أن الاسم ثابت للمستخدم)
            const userNameFromFlight = flightsSnapshot.docs.length > 0 ? flightsSnapshot.docs[0].data().name : `المستخدم ID: ${userId.substring(0, 8)}`; // Fallback if no flights

            // إذا كان هناك اسم مستخدم، استخدمه، وإلا استخدم جزء من الـ UID
            userFlightCounts[userNameFromFlight] = (userFlightCounts[userNameFromFlight] || 0) + currentUserFlightsCount;
        }

        // عرض إحصائيات المستخدمين
        for (const name in userFlightCounts) {
            const item = document.createElement('div');
            item.classList.add('user-stat-item');
            item.innerHTML = `
                <span>${name}:</span>
                <span>${userFlightCounts[name]} رحلة</span>
            `;
            userStatsList.appendChild(item);
        }

        totalFlightsCountSpan.textContent = totalFlights;

        // عرض جميع الرحلات في جدول
        if (allFlightsData.length > 0) {
            noAllFlightsMsg.style.display = 'none'; // إخفاء رسالة "لا توجد رحلات" إذا كان هناك رحلات
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>رقم الرحلة</th>
                        <th>الاسم</th>
                        <th>ملاحظات</th>
                        <th>وصول الطائرة</th>
                        <th>فتح الباب</th>
                        <th>بدء التنظيف</th>
                        <th>انتهاء التنظيف</th>
                        <th>استعداد الصعود</th>
                        <th>بدء الصعود</th>
                        <th>اكتمال الصعود</th>
                        <th>إغلاق الباب</th>
                        <th>مغادرة الطائرة</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            const tbody = table.querySelector('tbody');

            allFlightsData.sort((a, b) => new Date(a.date) - new Date(b.date)); // ترتيب حسب التاريخ

            allFlightsData.forEach(flight => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="التاريخ">${flight.date}</td>
                    <td data-label="رقم الرحلة">${flight.fltNo || '-'}</td>
                    <td data-label="الاسم">${flight.name || '-'}</td>
                    <td data-label="ملاحظات">${flight.notes || '-'}</td>
                    <td data-label="وصول الطائرة">${flight.onChocksTime || '-'}</td>
                    <td data-label="فتح الباب">${flight.openDoorTime || '-'}</td>
                    <td data-label="بدء التنظيف">${flight.startCleaningTime || '-'}</td>
                    <td data-label="انتهاء التنظيف">${flight.completeCleaningTime || '-'}</td>
                    <td data-label="استعداد الصعود">${flight.readyBoardingTime || '-'}</td>
                    <td data-label="بدء الصعود">${flight.startBoardingTime || '-'}</td>
                    <td data-label="اكتمال الصعود">${flight.completeBoardingTime || '-'}</td>
                    <td data-label="إغلاق الباب">${flight.closeDoorTime || '-'}</td>
                    <td data-label="مغادرة الطائرة">${flight.offChocksTime || '-'}</td>
                `;
                tbody.appendChild(row);
            });
            allFlightsTable.appendChild(table);
        } else {
            noAllFlightsMsg.style.display = 'block'; // إظهار رسالة "لا توجد رحلات" إذا لم يكن هناك رحلات بعد المعالجة
        }

    } catch (error) {
        console.error("Error loading admin data:", error);
        userStatsList.innerHTML = `<p style="color:red; text-align:center;">خطأ في تحميل البيانات.</p>`;
        allFlightsTable.innerHTML = `<p style="color:red; text-align:center;">خطأ في تحميل البيانات.</p>`;
        // في حالة وجود خطأ عام، قد ترغب في إخفاء رسائل "لا توجد بيانات" وعرض رسالة الخطأ بدلاً من ذلك
        noUserStatsMsg.style.display = 'none';
        noAllFlightsMsg.style.display = 'none';
    }
}

// **وظائف التصدير إلى Word (تحتاج إلى مكتبة خارجية)**
// هذه الوظائف هي مكان لتضمين كود التصدير الفعلي
// ستحتاج إلى دمج مكتبة مثل 'docx' أو إنشاء حل backend
// حالياً، هي تعرض فقط رسالة تنبيه.

document.getElementById('exportStatsBtn').addEventListener('click', async () => {
    alert('جارٍ تحضير ملف Word للإحصائيات... (تتطلب هذه الميزة مكتبة خارجية)');
    // هنا يجب إضافة كود تصدير الإحصائيات الفعلية
    // ستحتاج لجمع البيانات من العناصر الموجودة في الصفحة
});

document.getElementById('exportAllFlightsBtn').addEventListener('click', async () => {
    alert('جارٍ تحضير ملف Word لجميع الرحلات... (تتطلب هذه الميزة مكتبة خارجية)');
    // هنا يجب إضافة كود تصدير جميع الرحلات الفعلية
    // ستحتاج لجمع البيانات من الجدول #allFlightsTable
});
