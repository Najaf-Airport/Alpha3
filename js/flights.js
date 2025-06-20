// ملف: js/flights.js

// يجب استيراد auth و db من firebase-init.js
import { auth, db } from "./firebase-init.js";

let currentUserName = localStorage.getItem('userName'); // محاولة استعادة الاسم
let currentUserEmail = ''; // هذا المتغير سيتم تعيين قيمته لاحقاً

// نستخدم DOMContentLoaded للتأكد من أن جميع عناصر HTML قد تم تحميلها قبل محاولة الوصول إليها
document.addEventListener('DOMContentLoaded', () => {
    // تحديث السنة في الـ HTML مباشرة (يمكن أن تكون هذه الوظيفة في HTML نفسه أو في هذا الملف)
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // التحقق من حالة المصادقة عند تحميل الصفحة
    // تأكد من أن auth قد تم تهيئته قبل استخدام onAuthStateChanged
    if (auth) {
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUserEmail = user.email; // تعيين البريد الإلكتروني للمستخدم الحالي
                if (!currentUserName) {
                    // طلب الاسم إذا لم يكن محفوظًا
                    currentUserName = prompt('الرجاء إدخال اسمك (سيتم حفظه تلقائياً):');
                    if (currentUserName) {
                        localStorage.setItem('userName', currentUserName);
                    } else {
                        alert('يجب إدخال الاسم للمتابعة.');
                        auth.signOut().then(() => { // استخدام Promise for signOut
                            window.location.href = 'index.html'; // التوجيه لصفحة تسجيل الدخول الرئيسية
                        }).catch(error => console.error("Error signing out:", error));
                        return;
                    }
                }
                document.getElementById('userNameDisplay').textContent = currentUserName;
                renderFlightForms(); // عرض بطاقات الرحلات
                loadPreviousFlights(user.uid); // تحميل الرحلات السابقة
            } else {
                // إذا لم يكن المستخدم مسجلاً للدخول، أعد التوجيه لصفحة تسجيل الدخول
                window.location.href = 'index.html'; // التوجيه لصفحة تسجيل الدخول الرئيسية
            }
        });
    } else {
        console.error("Firebase Auth object is not available in flights.js.");
        alert("خطأ: لا يمكن الوصول إلى نظام المصادقة.");
        window.location.href = 'index.html'; // fallback
    }

    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                localStorage.removeItem('userName'); // مسح الاسم عند تسجيل الخروج
                window.location.href = 'index.html'; // التوجيه لصفحة تسجيل الدخول الرئيسية
            }).catch(error => {
                console.error("Error signing out:", error);
                alert("حدث خطأ أثناء تسجيل الخروج.");
            });
        });
    }

    // زر حفظ الرحلات
    const saveFlightsBtn = document.getElementById('saveFlightsBtn');
    if (saveFlightsBtn) {
        saveFlightsBtn.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) {
                alert('يرجى تسجيل الدخول أولاً.');
                return;
            }

            const userId = user.uid;
            const currentMonth = new Date().getMonth() + 1; // الشهر الحالي (1-12)
            const currentYear = new Date().getFullYear();
            const flightData = [];
            let hasAtLeastOneFlight = false; // علم للتحقق من وجود رحلة واحدة على الأقل

            // جمع بيانات الرحلات من البطاقات
            for (let i = 0; i < 5; i++) {
                const dateInput = document.getElementById(`date-${i}`);
                const fltNoInput = document.getElementById(`fltNo-${i}`);
                const onChocksTimeInput = document.getElementById(`onChocks-${i}`);
                const openDoorTimeInput = document.getElementById(`openDoor-${i}`);
                const startCleaningTimeInput = document.getElementById(`startCleaning-${i}`);
                const completeCleaningTimeInput = document.getElementById(`completeCleaning-${i}`);
                const readyBoardingTimeInput = document.getElementById(`readyBoarding-${i}`);
                const startBoardingTimeInput = document.getElementById(`startBoarding-${i}`);
                const completeBoardingTimeInput = document.getElementById(`completeBoarding-${i}`);
                const closeDoorTimeInput = document.getElementById(`closeDoor-${i}`);
                const offChocksTimeInput = document.getElementById(`offChocks-${i}`);
                const nameInput = document.getElementById(`name-${i}`);
                const notesInput = document.getElementById(`notes-${i}`);

                // تأكد من أن جميع العناصر موجودة
                if (!dateInput || !fltNoInput || !onChocksTimeInput || !openDoorTimeInput || 
                    !startCleaningTimeInput || !completeCleaningTimeInput || !readyBoardingTimeInput ||
                    !startBoardingTimeInput || !completeBoardingTimeInput || !closeDoorTimeInput ||
                    !offChocksTimeInput || !nameInput || !notesInput) {
                    console.warn(`Missing input fields for flight card ${i + 1}. Skipping.`);
                    continue;
                }

                const date = dateInput.value;
                const fltNo = fltNoInput.value;
                const onChocksTime = onChocksTimeInput.value;
                const openDoorTime = openDoorTimeInput.value;
                const startCleaningTime = startCleaningTimeInput.value;
                const completeCleaningTime = completeCleaningTimeInput.value;
                const readyBoardingTime = readyBoardingTimeInput.value;
                const startBoardingTime = startBoardingTimeInput.value;
                const completeBoardingTime = completeBoardingTimeInput.value;
                const closeDoorTime = closeDoorTimeInput.value;
                const offChocksTime = offChocksTimeInput.value;
                const name = nameInput.value; // الاسم سيكون هو currentUserName
                const notes = notesInput.value;

                // إذا لم يتم إدخال تاريخ، تجاهل هذه الرحلة
                if (!date) {
                    continue; // انتقل إلى الرحلة التالية في الحلقة
                }

                // إذا كان هناك تاريخ، تحقق من الاسم
                if (!name) {
                    alert(`الرحلة رقم ${i + 1}: يجب إدخال الاسم إذا تم إدخال تاريخ.`);
                    return; // أوقف الحفظ إذا كان الاسم مفقوداً لرحلة بها تاريخ
                }

                hasAtLeastOneFlight = true; // تم العثور على رحلة واحدة على الأقل بها تاريخ
                flightData.push({
                    date: date,
                    fltNo: fltNo,
                    onChocksTime: onChocksTime,
                    openDoorTime: openDoorTime,
                    startCleaningTime: startCleaningTime,
                    completeCleaningTime: completeCleaningTime,
                    readyBoardingTime: readyBoardingTime,
                    startBoardingTime: startBoardingTime,
                    completeBoardingTime: completeBoardingTime,
                    closeDoorTime: closeDoorTime,
                    offChocksTime: offChocksTime,
                    name: name,
                    notes: notes,
                    // timestamp: firebase.firestore.FieldValue.serverTimestamp() // هذا سيتم إضافته لاحقاً باستخدام import
                });
            }

            // إذا لم يتم إدخال أي رحلة بها تاريخ
            if (!hasAtLeastOneFlight) {
                alert('الرجاء إدخال تاريخ لرحلة واحدة على الأقل لحفظ البيانات.');
                return;
            }

            try {
                // استخدام Firebase SDK v9 لـ serverTimestamp
                const { serverTimestamp } = await import("https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js");

                for (let i = 0; i < flightData.length; i++) {
                    const data = { ...flightData[i], timestamp: serverTimestamp() }; // تأكد من استخدام serverTimestamp من Firebase V9
                    // إنشاء مسار الحفظ: 'شهر/سنة/مستخدمين/اسم المستخدم/رحلات/تاريخ_اسم_رقم تسلسلي'
                    const monthYearDocId = `${currentYear}-${(currentMonth < 10 ? '0' : '') + currentMonth}`;
                    const docId = `${data.date}_${data.fltNo || 'NoFLT'}_${new Date().getTime()}_${i}`; // لتجنب التكرار
                    await db.collection('months').doc(monthYearDocId).collection('users').doc(userId).collection('flights').doc(docId).set(data);
                }
                alert('تم حفظ الرحلات بنجاح!');
                // بعد الحفظ، أعد تحميل الرحلات السابقة
                loadPreviousFlights(userId);
                // قم بتنظيف الحقول بعد الحفظ
                renderFlightForms();

                // **تصديع إلى Word - هذه وظيفة معقدة وتتطلب مكتبة خارجية**
                exportFlightsToWord(flightData);

            } catch (error) {
                console.error("Error saving flights:", error);
                alert('حدث خطأ أثناء حفظ الرحلات. يرجى المحاولة مرة أخرى.');
            }
        });
    }
});

// دالة لإنشاء بطاقة رحلة
function createFlightCard(index) {
    const card = document.createElement('div');
    card.classList.add('flight-card');
    card.innerHTML = `
        <h3>الرحلة رقم ${index + 1}</h3>
        <div class="form-group">
            <label for="date-${index}">التاريخ:</label>
            <input type="date" id="date-${index}">
        </div>
        <div class="form-group">
            <label for="fltNo-${index}">رقم الرحلة (FLT.NO):</label>
            <input type="text" id="fltNo-${index}">
        </div>
        <div class="form-group">
            <label for="onChocks-${index}">وصول الطائرة (ON chocks Time):</label>
            <input type="time" id="onChocks-${index}">
        </div>
        <div class="form-group">
            <label for="openDoor-${index}">فتح الباب (Open Door Time):</label>
            <input type="time" id="openDoor-${index}">
        </div>
        <div class="form-group">
            <label for="startCleaning-${index}">بدء التنظيف (Start Cleaning Time):</label>
            <input type="time" id="startCleaning-${index}">
        </div>
        <div class="form-group">
            <label for="completeCleaning-${index}">انتهاء التنظيف (Complete Cleaning Time):</label>
            <input type="time" id="completeCleaning-${index}">
        </div>
        <div class="form-group">
            <label for="readyBoarding-${index}">استعداد الصعود (Ready Boarding Time):</label>
            <input type="time" id="readyBoarding-${index}">
        </div>
        <div class="form-group">
            <label for="startBoarding-${index}">بدء الصعود (Start Boarding Time):</label>
            <input type="time" id="startBoarding-${index}">
        </div>
        <div class="form-group">
            <label for="completeBoarding-${index}">اكتمال الصعود (Complete Boarding Time):</label>
            <input type="time" id="completeBoarding-${index}">
        </div>
        <div class="form-group">
            <label for="closeDoor-${index}">إغلاق الباب (Close Door Time):</label>
            <input type="time" id="closeDoor-${index}">
        </div>
        <div class="form-group">
            <label for="offChocks-${index}">مغادرة الطائرة (Off chocks Time):</label>
            <input type="time" id="offChocks-${index}">
        </div>
        <div class="form-group">
            <label for="name-${index}">الاسم:</label>
            <input type="text" id="name-${index}" value="${currentUserName || ''}" readonly required>
        </div>
        <div class="form-group">
            <label for="notes-${index}">ملاحظات:</label>
            <textarea id="notes-${index}"></textarea>
        </div>
    `;
    return card;
}

// دالة لعرض 5 بطاقات رحلات
function renderFlightForms() {
    const container = document.getElementById('flightFormsContainer');
    if (!container) {
        console.error("Flight forms container not found.");
        return;
    }
    container.innerHTML = ''; // مسح أي بطاقات سابقة
    for (let i = 0; i < 5; i++) {
        container.appendChild(createFlightCard(i));
    }
}

// دالة لتحميل وعرض الرحلات السابقة للمستخدم في الشهر الحالي
async function loadPreviousFlights(userId) {
    const previousFlightsList = document.getElementById('previousFlightsList');
    const noPreviousFlightsMsg = document.getElementById('noPreviousFlights');

    if (!previousFlightsList || !noPreviousFlightsMsg) {
        console.error("Previous flights elements not found.");
        return;
    }

    previousFlightsList.innerHTML = ''; // مسح القائمة السابقة
    noPreviousFlightsMsg.style.display = 'block'; // أظهر رسالة "لا توجد" بشكل افتراضي

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthYearDocId = `${currentYear}-${(currentMonth < 10 ? '0' : '') + currentMonth}`;

    try {
        const flightsCollectionRef = db.collection('months').doc(monthYearDocId).collection('users').doc(userId).collection('flights');
        const snapshot = await flightsCollectionRef
                                .orderBy('timestamp', 'desc') // عرض الأحدث أولاً
                                .get();

        if (snapshot.empty) {
            noPreviousFlightsMsg.style.display = 'block'; // إذا كانت فارغة، أظهر الرسالة
            return;
        }
        noPreviousFlightsMsg.style.display = 'none'; // إذا كان هناك بيانات، أخفِ الرسالة

        snapshot.forEach(doc => {
            const flight = doc.data();
            const item = document.createElement('div');
            item.classList.add('previous-flight-item');
            item.innerHTML = `
                <div>
                    <strong>التاريخ:</strong> ${flight.date || '-'} <br>
                    <strong>رقم الرحلة:</strong> ${flight.fltNo || 'غير محدد'} <br>
                    <strong>الملاحظات:</strong> ${flight.notes || 'لا توجد'}
                </div>
            `;
            previousFlightsList.appendChild(item);
        });
    } catch (error) {
        console.error("Error loading previous flights:", error);
        previousFlightsList.innerHTML = `<p style="color:red;">خطأ في تحميل الرحلات السابقة: ${error.message}</p>`;
        noPreviousFlightsMsg.style.display = 'none'; // Hide message if there's an error
    }
}

// **وظيفة تصدير إلى Word (تحتاج إلى مكتبة مثل 'docx' أو حل backend)**
// هذه مجرد دالة وهمية وتحتاج إلى تنفيذ فعلي
async function exportFlightsToWord(flights) {
    alert('جارٍ تحضير ملف Word... (تتطلب هذه الميزة مكتبة خارجية)');
    // هنا يمكن دمج مكتبة docx
}
