// ملف: js/admin.js

// يجب استيراد auth و db من firebase-init.js
import { auth, db } from "./firebase-init.js";

const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

let selectedMonth = new Date().getMonth() + 1; // الشهر الحالي بشكل افتراضي
let selectedYear = new Date().getFullYear();

// نستخدم DOMContentLoaded للتأكد من أن جميع عناصر HTML قد تم تحميلها
document.addEventListener('DOMContentLoaded', () => {
    // تحديث السنة في الـ HTML مباشرة
    document.getElementById('currentYearAdmin').textContent = selectedYear;
    document.getElementById('currentYearFooter').textContent = selectedYear;

    // ملء قائمة الشهور عند تحميل DOM
    populateMonthSelect();

    // تأكد من أن auth قد تم تهيئته قبل استخدام onAuthStateChanged
    if (auth) {
        auth.onAuthStateChanged(user => {
            if (user) {
                if (user.email === 'ahmedaltalqani@gmail.com') { // *** تأكد من مطابقة هذا البريد الإلكتروني تماماً ***
                    loadAdminData();
                } else {
                    // إذا لم يكن المسؤول، أعد التوجيه لصفحة تسجيل الدخول
                    alert('ليس لديك صلاحيات الوصول لهذه الصفحة.');
                    auth.signOut().then(() => {
                        window.location.href = 'index.html'; // التأكد من التوجيه لـ index.html
                    }).catch(error => console.error("Error signing out:", error));
                }
            } else {
                window.location.href = 'index.html'; // التأكد من التوجيه لـ index.html
            }
        });
    } else {
        console.error("Firebase Auth object is not available in admin.js.");
        alert("خطأ: لا يمكن الوصول إلى نظام المصادقة.");
        window.location.href = 'index.html'; // fallback
    }

    // زر تسجيل الخروج للمسؤول
    const logoutBtnAdmin = document.getElementById('logoutBtnAdmin');
    if (logoutBtnAdmin) {
        logoutBtnAdmin.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'index.html'; // التأكد من التوجيه لـ index.html
            }).catch(error => {
                console.error("Error signing out:", error);
                alert("حدث خطأ أثناء تسجيل الخروج.");
            });
        });
    }

    // ربط مستمع الحدث لقائمة الشهور
    const monthSelect = document.getElementById('monthSelect');
    if (monthSelect) {
        monthSelect.addEventListener('change', (event) => {
            selectedMonth = parseInt(event.target.value);
            document.getElementById('currentMonthName').textContent = monthNames[selectedMonth - 1];
            loadAdminData(); // إعادة تحميل البيانات للشهر الجديد
        });
    }

    // **وظائف التصدير إلى Word (تحتاج إلى مكتبة خارجية)**
    const exportStatsBtn = document.getElementById('exportStatsBtn');
    if (exportStatsBtn) {
        exportStatsBtn.addEventListener('click', async () => {
            alert('جارٍ تحضير ملف Word للإحصائيات... (تتطلب هذه الميزة مكتبة خارجية)');
            // هنا يجب إضافة كود تصدير الإحصائيات الفعلية
            // ستحتاج لجمع البيانات من العناصر الموجودة في الصفحة
        });
    }

    const exportAllFlightsBtn = document.getElementById('exportAllFlightsBtn');
    if (exportAllFlightsBtn) {
        exportAllFlightsBtn.addEventListener('click', async () => {
            alert('جارٍ تحضير ملف Word لجميع الرحلات... (تتطلب هذه الميزة مكتبة خارجية)');
            // هنا يجب إضافة كود تصدير جميع الرحلات الفعلية
            // ستحتاج لجمع البيانات من الجدول #allFlightsTable
        });
    }
}); // نهاية DOMContentLoaded


// ملء قائمة الشهور
function populateMonthSelect() {
    const monthSelect = document.getElementById('monthSelect');
    const currentMonthNameSpan = document.getElementById('currentMonthName');
    
    if (!monthSelect || !currentMonthNameSpan) {
        console.error("Required elements for month selection not found in admin.html");
        return;
    }

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
    currentMonthNameSpan.textContent = monthNames[selectedMonth - 1];
}


async function loadAdminData() {
    const userStatsList = document.getElementById('userStatsList');
    const allFlightsTableDiv = document.getElementById('allFlightsTable'); // هذا هو الـ div الذي يحتوي الجدول
    const totalFlightsCountSpan = document.getElementById('totalFlightsCount');
    const noUserStatsMsg = document.getElementById('noUserStats');
    const noAllFlightsMsg = document.getElementById('noAllFlights');
    
    // تأكد من وجود العناصر قبل محاولة تعديلها
    if (!userStatsList || !allFlightsTableDiv || !totalFlightsCountSpan || !noUserStatsMsg || !noAllFlightsMsg) {
        console.error("One or more required admin UI elements not found.");
        return;
    }

    userStatsList.innerHTML = '';
    // للحفاظ على بنية الجدول، لا تمسح كل الـ div. فقط امسح الـ tbody
    let tbody = allFlightsTableDiv.querySelector('tbody');
    if (tbody) {
        tbody.innerHTML = '';
    } else {
        // إذا لم يكن هناك tbody (لأي سبب)، قم بإنشاء الجدول من جديد
        allFlightsTableDiv.innerHTML = `
            <table>
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
            </table>
        `;
        tbody = allFlightsTableDiv.querySelector('tbody');
    }
    
    noUserStatsMsg.style.display = 'block';
    noAllFlightsMsg.style.display = 'block';

    let totalFlights = 0;
    const userFlightCounts = {};
    const allFlightsData = [];

    try {
        const monthYearDocId = `${selectedYear}-${(selectedMonth < 10 ? '0' : '') + selectedMonth}`;
        const usersCollectionRef = db.collection('months').doc(monthYearDocId).collection('users');
        const usersSnapshot = await usersCollectionRef.get();

        if (usersSnapshot.empty) {
            totalFlightsCountSpan.textContent = '0';
            noUserStatsMsg.style.display = 'block';
            noAllFlightsMsg.style.display = 'block';
            return;
        }

        noUserStatsMsg.style.display = 'none';

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const flightsRef = usersCollectionRef.doc(userId).collection('flights');
            const flightsSnapshot = await flightsRef.get();

            let currentUserFlightsCount = 0;
            flightsSnapshot.forEach(flightDoc => {
                const flight = flightDoc.data();
                allFlightsData.push(flight);
                currentUserFlightsCount++;
                totalFlights++;
            });

            // الحصول على الاسم من أول رحلة أو استخدام UID إذا لم تكن هناك رحلات
            const userNameFromFlight = flightsSnapshot.docs.length > 0 && flightsSnapshot.docs[0].data().name
                ? flightsSnapshot.docs[0].data().name
                : `المستخدم ID: ${userId.substring(0, 8)}`;

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
            noAllFlightsMsg.style.display = 'none';
            // التأكد من أن tbody موجود قبل الإضافة إليه
            if (!tbody) { // إذا لم يتم العثور على tbody في بداية الدالة وتمت إعادة إنشائه
                allFlightsTableDiv.innerHTML = `
                    <table>
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
                    </table>
                `;
                tbody = allFlightsTableDiv.querySelector('tbody');
            }


            allFlightsData.sort((a, b) => {
                // التعامل مع التواريخ غير الصالحة أو المفقودة
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (isNaN(dateA)) return 1; // ضع التواريخ غير الصالحة في النهاية
                if (isNaN(dateB)) return -1;
                return dateA - dateB;
            });

            allFlightsData.forEach(flight => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="التاريخ">${flight.date || '-'}</td>
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
        } else {
            noAllFlightsMsg.style.display = 'block';
        }

    } catch (error) {
        console.error("Error loading admin data:", error);
        userStatsList.innerHTML = `<p style="color:red; text-align:center;">خطأ في تحميل البيانات: ${error.message}</p>`;
        allFlightsTableDiv.innerHTML = `<p style="color:red; text-align:center;">خطأ في تحميل البيانات: ${error.message}</p>`;
        noUserStatsMsg.style.display = 'none';
        noAllFlightsMsg.style.display = 'none';
    }
}
