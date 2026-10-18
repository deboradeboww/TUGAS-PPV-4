document.addEventListener('DOMContentLoaded', () => {
    let taskListArray = [];
    let notesListArray = [];
    let selectedNoteColor = 'kuning';
    let toastTimeout;

    // Data Default Jadwal Kuliah (Bisa dikustomisasi langsung oleh pengguna)
    let scheduleData = {
        "SENIN": [
            { time: "08.00 – 09.40 WIB", subject: "Animasi 2D (Teori & Praktikum)", room: "JJ 3.11" },
            { time: "09.40 – 11.30 WIB", subject: "Sistem Pemancar (Teori & Praktikum)", room: "JJ 3.11" }
        ],
        "SELASA": [
            { time: "08.00 – 09.40 WIB", subject: "Praktikum Pemrograman Visual", room: "JJ 3.10" },
            { time: "09.40 – 12.10 WIB", subject: "Workshop UI/UX", room: "JJ 3.10" },
            { time: "13.00 – 14.40 WIB", subject: "Teori + Praktikum Jaringan Komputer", room: "JJ 3.11" }
        ],
        "RABU": [
            { time: "08.50 – 11.20 WIB", subject: "Workshop Jurnalistik", room: "PS-11.04" },
            { time: "11.20 – 14.40 WIB", subject: "Workshop Produksi Konten Digital", room: "JJ 3.11" }
        ],
        "KAMIS": [
            { time: "09.45 – 12.10 WIB", subject: "Teknik Penyiaran", room: "PS Lt.11 Studio Pertunjukan" },
            { time: "14.40 – 16.20 WIB", subject: "Pemrograman Visual", room: "SAW 03.06" }
        ]
    };

    // Element Navigasi & Halaman
    const navInput = document.getElementById('navInput');
    const navList = document.getElementById('navList');
    const navNotes = document.getElementById('navNotes');
    const navSchedule = document.getElementById('navSchedule');

    const pageInput = document.getElementById('pageInput');
    const pageList = document.getElementById('pageList');
    const pageNotes = document.getElementById('pageNotes');
    const pageSchedule = document.getElementById('pageSchedule');

    // Element Form Tugas & Edit Tugas
    const taskForm = document.getElementById('taskForm');
    const taskTitle = document.getElementById('taskTitle');
    const taskCategory = document.getElementById('taskCategory');
    const taskDeadline = document.getElementById('taskDeadline');
    const taskPriority = document.getElementById('taskPriority');
    const taskStatus = document.getElementById('taskStatus');
    const titleError = document.getElementById('titleError');
    const categoryError = document.getElementById('categoryError');
    const deadlineError = document.getElementById('deadlineError');

    const editModal = document.getElementById('editModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const editTaskForm = document.getElementById('editTaskForm');
    const editTaskId = document.getElementById('editTaskId');
    const editTaskTitle = document.getElementById('editTaskTitle');
    const editTaskCategory = document.getElementById('editTaskCategory');
    const editTaskDeadline = document.getElementById('editTaskDeadline');
    const editTaskPriority = document.getElementById('editTaskPriority');

    // Element Modal Edit Jadwal
    const editScheduleModal = document.getElementById('editScheduleModal');
    const closeScheduleModalBtn = document.getElementById('closeScheduleModalBtn');
    const editScheduleForm = document.getElementById('editScheduleForm');
    const editSchedDay = document.getElementById('editSchedDay');
    const editSchedIndex = document.getElementById('editSchedIndex');
    const editSchedTime = document.getElementById('editSchedTime');
    const editSchedSubject = document.getElementById('editSchedSubject');
    const editSchedRoom = document.getElementById('editSchedRoom');
    const scheduleContainer = document.getElementById('scheduleContainer');

    // Element Catatan & Lainnya
    const noteInputText = document.getElementById('noteInputText');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const notesContainer = document.getElementById('notesContainer');
    const emptyNotesState = document.getElementById('emptyNotesState');
    const colorBtns = document.querySelectorAll('.color-btn');

    const taskListContainer = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const taskCountBadge = document.getElementById('taskCountBadge');
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');
    const toastNotification = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    const closeToastBtn = document.getElementById('closeToastBtn');
    const actionSound = document.getElementById('actionSound');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    function playAudioFeedback() {
        if (actionSound) {
            actionSound.currentTime = 0;
            actionSound.play().catch(err => console.log("Audio play blocked", err));
        }
    }

    function switchPage(activeNav, activePage) {
        [navInput, navList, navNotes, navSchedule].forEach(n => n.classList.remove('active'));
        [pageInput, pageList, pageNotes, pageSchedule].forEach(p => p.classList.add('hidden'));

        activeNav.classList.add('active');
        activePage.classList.remove('hidden');

        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            activePage.animate([
                { opacity: 0, transform: 'translateY(12px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], { duration: 250, easing: 'ease-out' });
        }
    }

    navInput.addEventListener('click', () => switchPage(navInput, pageInput));
    navList.addEventListener('click', () => { switchPage(navList, pageList); renderTasks(); });
    navNotes.addEventListener('click', () => { switchPage(navNotes, pageNotes); renderNotes(); });
    navSchedule.addEventListener('click', () => { switchPage(navSchedule, pageSchedule); renderSchedule(); });

    closeToastBtn.addEventListener('click', () => {
        toastNotification.classList.remove('show');
        if (toastTimeout) clearTimeout(toastTimeout);
    });

    // --- RENDER & EDIT JADWAL KULIAH ---
    function renderSchedule() {
        if (!scheduleContainer) return;
        scheduleContainer.innerHTML = '';

        Object.keys(scheduleData).forEach(day => {
            const classes = scheduleData[day];
            let rowsHTML = '';

            classes.forEach((item, index) => {
                rowsHTML += `
                    <tr>
                        <td>${escapeHTML(item.time)}</td>
                        <td>${escapeHTML(item.subject)}</td>
                        <td>
                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                                <span class="room-badge">${escapeHTML(item.room)}</span>
                                <button class="btn-act" onclick="openEditScheduleModal('${day}', ${index})" title="Ubah Jadwal" style="padding: 3px 6px; font-size: 0.68rem;">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            const card = document.createElement('div');
            card.className = 'day-schedule-card';
            card.innerHTML = `
                <div class="day-header">
                    <span><i class="fa-solid fa-calendar-day"></i> ${day}</span>
                </div>
                <table class="schedule-table">
                    <thead>
                        <tr>
                            <th>Waktu</th>
                            <th>Mata Kuliah</th>
                            <th>Ruang</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML}
                    </tbody>
                </table>
            `;
            scheduleContainer.appendChild(card);
        });
    }

    window.openEditScheduleModal = function(day, index) {
        const item = scheduleData[day][index];
        editSchedDay.value = day;
        editSchedIndex.value = index;
        editSchedTime.value = item.time;
        editSchedSubject.value = item.subject;
        editSchedRoom.value = item.room;

        editScheduleModal.classList.remove('hidden');
    };

    closeScheduleModalBtn.addEventListener('click', () => {
        editScheduleModal.classList.add('hidden');
    });

    editScheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const day = editSchedDay.value;
        const index = Number(editSchedIndex.value);

        scheduleData[day][index] = {
            time: editSchedTime.value.trim(),
            subject: editSchedSubject.value.trim(),
            room: editSchedRoom.value.trim()
        };

        editScheduleModal.classList.add('hidden');
        playAudioFeedback();
        showToast("Jadwal kuliah berhasil diperbarui!");
        renderSchedule();
    });

    // --- FORM TUGAS & ENTER ---
    taskForm.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            simpanTugasBaru();
        }
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        simpanTugasBaru();
    });

    function simpanTugasBaru() {
        titleError.style.display = 'none';
        categoryError.style.display = 'none';
        deadlineError.style.display = 'none';

        let isValid = true;
        if (!taskTitle.value.trim()) { titleError.style.display = 'block'; isValid = false; }
        if (!taskCategory.value) { categoryError.style.display = 'block'; isValid = false; }
        if (!taskDeadline.value) { deadlineError.style.display = 'block'; isValid = false; }

        if (!isValid) {
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                taskForm.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-6px)' },
                    { transform: 'translateX(6px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 250 });
            }
            return;
        }

        const newTask = {
            id: Date.now(),
            title: taskTitle.value.trim(),
            category: taskCategory.value,
            deadline: taskDeadline.value,
            priority: taskPriority.value,
            status: taskStatus.value
        };

        taskListArray.push(newTask);
        taskTitle.value = '';
        taskCategory.value = '';
        taskDeadline.value = '';

        taskCountBadge.textContent = taskListArray.length;
        playAudioFeedback();
        showToast("Yey! Tugas barumu berhasil ditambahkan!");
        navList.click();
    }

    // Edit Tugas Modal
    window.openEditModal = function(id) {
        const task = taskListArray.find(t => t.id === id);
        if (!task) return;
        editTaskId.value = task.id;
        editTaskTitle.value = task.title;
        editTaskCategory.value = task.category;
        editTaskDeadline.value = task.deadline;
        editTaskPriority.value = task.priority;
        editModal.classList.remove('hidden');
    };

    closeModalBtn.addEventListener('click', () => editModal.classList.add('hidden'));

    editTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = Number(editTaskId.value);
        taskListArray = taskListArray.map(t => {
            if (t.id === id) {
                return {
                    ...t,
                    title: editTaskTitle.value.trim(),
                    category: editTaskCategory.value,
                    deadline: editTaskDeadline.value,
                    priority: editTaskPriority.value
                };
            }
            return t;
        });
        editModal.classList.add('hidden');
        playAudioFeedback();
        showToast("Tugas berhasil diperbarui!");
        renderTasks();
    });

    // Sticky Notes (Warna & Pin)
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedNoteColor = btn.getAttribute('data-color');
        });
    });

    addNoteBtn.addEventListener('click', () => {
        const text = noteInputText.value.trim();
        if (!text) return;
        notesListArray.push({ id: Date.now(), text: text, color: selectedNoteColor, isPinned: false });
        noteInputText.value = '';
        playAudioFeedback();
        showToast("Catatan cepat disimpan!");
        renderNotes();
    });

    noteInputText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addNoteBtn.click(); }
    });

    function renderNotes() {
        notesContainer.innerHTML = '';
        if (notesListArray.length === 0) {
            notesContainer.appendChild(emptyNotesState);
            emptyNotesState.style.display = 'block';
            return;
        }
        emptyNotesState.style.display = 'none';

        const sortedNotes = [...notesListArray].sort((a, b) => b.isPinned - a.isPinned);
        sortedNotes.forEach(note => {
            const card = document.createElement('div');
            card.className = `note-card-item note-${note.color || 'kuning'} ${note.isPinned ? 'is-pinned' : ''}`;
            card.innerHTML = `
                <button class="btn-pin ${note.isPinned ? 'active' : ''}" onclick="togglePinNote(${note.id})" title="Sematkan">
                    <i class="fa-solid fa-thumbtack"></i>
                </button>
                <span class="note-text">${escapeHTML(note.text)}</span>
                <button class="btn-act btn-del" onclick="deleteNote(${note.id})"><i class="fa-solid fa-trash"></i></button>
            `;
            notesContainer.appendChild(card);
        });
    }

    window.togglePinNote = function(id) {
        notesListArray = notesListArray.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
        renderNotes();
    };

    window.deleteNote = function(id) {
        notesListArray = notesListArray.filter(n => n.id !== id);
        renderNotes();
    };

    // Filter & Render Tugas
    filterCategory.addEventListener('change', renderTasks);
    filterStatus.addEventListener('change', renderTasks);

    function renderTasks() {
        const catVal = filterCategory.value;
        const statVal = filterStatus.value;
        const filtered = taskListArray.filter(t => {
            return (catVal === 'Semua' || t.category === catVal) && (statVal === 'Semua' || t.status === statVal);
        });

        taskCountBadge.textContent = taskListArray.length;
        taskListContainer.innerHTML = '';

        if (filtered.length === 0) {
            taskListContainer.appendChild(emptyState);
            emptyState.style.display = 'block';
            updateStats();
            return;
        }
        emptyState.style.display = 'none';

        filtered.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card-item';
            card.innerHTML = `
                <div class="task-header-row">
                    <p class="task-title-text">${escapeHTML(task.title)}</p>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn-act btn-edit" onclick="openEditModal(${task.id})" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn-act btn-del" onclick="deleteTask(${task.id})" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div class="task-meta-tags">
                    <span class="tag-badge tag-mk"><i class="fa-solid fa-book"></i> ${task.category}</span>
                    <span class="tag-badge tag-date"><i class="fa-solid fa-calendar"></i> ${task.deadline}</span>
                    <span class="tag-badge tag-prio-${task.priority}">Prioritas: ${task.priority}</span>
                </div>
                <div class="task-footer-row">
                    <span class="status-badge status-${task.status.split(' ')[0]}">${task.status}</span>
                    <button class="btn-act" onclick="toggleStatus(${task.id})">Ubah Status <i class="fa-solid fa-rotate"></i></button>
                </div>
            `;
            taskListContainer.appendChild(card);
        });
        updateStats();
    }

    window.deleteTask = function(id) {
        taskListArray = taskListArray.filter(t => t.id !== id);
        renderTasks();
    };

    window.toggleStatus = function(id) {
        taskListArray = taskListArray.map(t => {
            if (t.id === id) {
                let next = 'Belum Selesai';
                if (t.status === 'Belum Selesai') next = 'Sedang Dikerjakan';
                else if (t.status === 'Sedang Dikerjakan') next = 'Selesai';
                return { ...t, status: next };
            }
            return t;
        });
        renderTasks();
    };

    function updateStats() {
        const total = taskListArray.length;
        if (total === 0) {
            progressBar.style.width = '0%';
            progressText.textContent = '0% Selesai';
            return;
        }
        const completed = taskListArray.filter(t => t.status === 'Selesai').length;
        const percent = Math.round((completed / total) * 100);
        progressBar.style.width = percent + '%';
        progressText.textContent = `${percent}% Selesai (${completed}/${total})`;
    }

    function showToast(msg) {
        toastMessage.textContent = msg;
        toastNotification.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toastNotification.classList.remove('show'), 3500);
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
    }
});