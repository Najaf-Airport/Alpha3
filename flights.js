// بما أن auth و db تم تعريفهما في firebase-init.js، يمكننا الوصول إليهما مباشرة هنا
// تأكد أن firebase-init.js تم تحميله قبل هذا الملف في الـ HTML
let currentUserName = localStorage.getItem('userName'); // محاولة استعادة الاسم
let currentUserEmail = '';

// التحقق من حالة المصادقة عند تحميل الصفحة
auth.onAuthStateChanged(user => {
    if (user) {
        currentUserEmail = user.email;
        if (!currentUserName) {
            // طلب الاسم إذا لم يكن محفوظًا
            currentUserName = prompt('الرجاء إدخال اسمك (سيتم حفظه تلقائياً):');
            if (currentUserName) {
                localStorage.setItem('userName', currentUserName);
            } else {
                alert('يجب إدخال الاسم للمتابعة.');
                auth.signOut(); // تسجيل الخروج إذا لم يدخل الاسم
                window.location.href = 'login.html';
                return;
            }
        }
        document.getElementById('userNameDisplay').textContent = currentUserName;
        renderFlightForms(); // عرض بطاقات الرحلات
        loadPreviousFlights(user.uid); // تحميل الرحلات السابقة
    } else {
        // إذا لم يكن المستخدم مسجلاً للدخول، أعد التوجيه لصفحة تسجيل الدخول
        window.location.href = 'login.html';
    }
});

// زر تسجيل الخروج
document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => {
        localStorage.removeItem('userName'); // مسح الاسم عند تسجيل الخروج
        window.location.href = 'login.html';
    });
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
    container.innerHTML = ''; // مسح أي بطاقات سابقة
    for (let i = 0; i < 5; i++) {
        container.appendChild(createFlightCard(i));
    }
}

// دالة لحفظ الرحلات في Firestore
document.getElementById('saveFlightsBtn').addEventListener('click', async () => {
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
        const date = document.getElementById(`date-${i}`).value;
        const fltNo = document.getElementById(`fltNo-${i}`).value;
        const onChocksTime = document.getElementById(`onChocks-${i}`).value;
        const openDoorTime = document.getElementById(`openDoor-${i}`).value;
        const startCleaningTime = document.getElementById(`startCleaning-${i}`).value;
        const completeCleaningTime = document.getElementById(`completeCleaning-${i}`).value;
        const readyBoardingTime = document.getElementById(`readyBoarding-${i}`).value;
        const startBoardingTime = document.getElementById(`startBoarding-${i}`).value;
        const completeBoardingTime = document.getElementById(`completeBoarding-${i}`).value;
        const closeDoorTime = document.getElementById(`closeDoor-${i}`).value;
        const offChocksTime = document.getElementById(`offChocks-${i}`).value;
        const name = document.getElementById(`name-${i}`).value; // الاسم سيكون هو currentUserName
        const notes = document.getElementById(`notes-${i}`).value;

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
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // وقت إضافة الرحلة
        });
    }

    // إذا لم يتم إدخال أي رحلة بها تاريخ
    if (!hasAtLeastOneFlight) {
        alert('الرجاء إدخال تاريخ لرحلة واحدة على الأقل لحفظ البيانات.');
        return;
    }

    try {
        for (let i = 0; i < flightData.length; i++) {
            const data = flightData[i];
            // إنشاء مسار الحفظ: 'شهر/اسم المستخدم/تاريخ_اسم_رقم تسلسلي'
            const docId = `${data.date}_${data.fltNo || 'NoFLT'}_${new Date().getTime()}_${i}`; // لتجنب التكرار
            await db.collection(`months/${currentMonth}-${currentYear}/users/${userId}/flights`).doc(docId).set(data);
        }
        alert('تم حفظ الرحلات بنجاح!');
        // بعد الحفظ، أعد تحميل الرحلات السابقة
        loadPreviousFlights(userId);
        // قم بتنظيف الحقول بعد الحفظ (اختياري)
        renderFlightForms();

        // **تصديع إلى Word - هذه وظيفة معقدة وتتطلب مكتبة خارجية**
        // ستحتاج إلى دمج مكتبة مثل 'docx' أو إنشاء HTML ثم تحويله
        exportFlightsToWord(flightData);

    } catch (error) {
        console.error("Error saving flights:", error);
        alert('حدث خطأ أثناء حفظ الرحلات. يرجى المحاولة مرة أخرى.');
    }
});

// دالة لتحميل وعرض الرحلات السابقة للمستخدم في الشهر الحالي
async function loadPreviousFlights(userId) {
    const previousFlightsList = document.getElementById('previousFlightsList');
    const noPreviousFlightsMsg = document.getElementById('noPreviousFlights'); // جلب العنصر

    previousFlightsList.innerHTML = ''; // مسح القائمة السابقة
    noPreviousFlightsMsg.style.display = 'block'; // أظهر رسالة "لا توجد" بشكل افتراضي

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    try {
        const snapshot = await db.collection(`months/${currentMonth}-${currentYear}/users/${userId}/flights`)
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
                    <strong>التاريخ:</strong> ${flight.date} <br>
                    <strong>رقم الرحلة:</strong> ${flight.fltNo || 'غير محدد'} <br>
                    <strong>الملاحظات:</strong> ${flight.notes || 'لا توجد'}
                </div>
            `;
            previousFlightsList.appendChild(item);
        });
    } catch (error) {
        console.error("Error loading previous flights:", error);
        previousFlightsList.innerHTML = `<p style="color:red;">خطأ في تحميل الرحلات السابقة.</p>`;
        noPreviousFlightsMsg.style.display = 'none'; // Hide message if there's an error
    }
}

// **وظيفة تصدير إلى Word (تحتاج إلى مكتبة مثل 'docx' أو حل backend)**
// هذه مجرد دالة وهمية وتحتاج إلى تنفيذ فعلي
async function exportFlightsToWord(flights) {
    // تتطلب مكتبة مثل 'docx' (على الواجهة الأمامية)
    // أو إرسال البيانات إلى backend لإنشاء ملف Word (أكثر تعقيداً)
    alert('جارٍ تحضير ملف Word... (تتطلب هذه الميزة مكتبة خارجية)');

    // مثال تخيلي لاستخدام مكتبة docx (يجب تثبيتها وإعدادها)
    /*
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, BorderStyle, WidthType, AlignmentType, HeadingLevel } = docx;

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    text: "Najaf International Airport",
                    alignment: AlignmentType.CENTER,
                    heading: HeadingLevel.TITLE,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `التاريخ: ${new Date().toLocaleDateString('ar-IQ')}`, rightToLeft: true }),
                    ],
                    alignment: AlignmentType.START,
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Airside Operations Dept", rightToLeft: true }),
                        new TextRun({ text: "Aircraft Coordination Unit", break: 1, rightToLeft: true }),
                    ],
                    alignment: AlignmentType.END,
                    spacing: { after: 200 }
                }),
                // إضافة الجدول
                new Table({
                    rows: [
                        new TableRow({ // Header Row
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Date" })] }),
                                // ... كل العناوين الأخرى
                            ],
                        }),
                        // ... كل صفوف البيانات
                    ]
                }),
                new Paragraph({
                    text: `الاسم: ${currentUserName}`,
                    alignment: AlignmentType.START,
                    spacing: { before: 300 }
                }),
                new Paragraph({
                    text: `ملاحظات: ${flights.map(f => f.notes).filter(Boolean).join('؛ ')}`,
                    alignment: AlignmentType.START,
                }),
            ],
        }],
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, "Flight_Report.docx"); // تتطلب مكتبة FileSaver.js
    });
    */
}
