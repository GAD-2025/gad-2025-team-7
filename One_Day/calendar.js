document.addEventListener('DOMContentLoaded', () => {
    // =================================================================================
    // --- 1. STATE MANAGEMENT & GLOBAL VARIABLES ---
    // =================================================================================
    let nav = 0;
    let selectedDate = new Date().toISOString().split('T')[0];

    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    if (dateParam) { selectedDate = dateParam; }

    let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
    let todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
    let diaries = localStorage.getItem('diaries') ? JSON.parse(localStorage.getItem('diaries')) : [];

    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const calendar = document.getElementById('calendar-body');
    const diaryCanvas = document.getElementById('diary-canvas');
    const diaryTextarea = document.getElementById('diary-textarea');
    const diaryTitleInput = document.getElementById('diary-title');
    const ctx = diaryCanvas.getContext('2d');
    
    let isDrawing = false, lastX = 0, lastY = 0;
    let penColor = 'black', penSize = 8, currentTool = 'pen';
    let currentEditorMode = 'text';

    // Undo/Redo History
    let canvasHistory = [];
    let historyStep = -1;
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    // =================================================================================
    // --- 2. CORE FUNCTIONS (DATA, RENDERING, CANVAS) ---
    // =================================================================================
    function saveData() {
        localStorage.setItem('events', JSON.stringify(events));
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('diaries', JSON.stringify(diaries));
    }

    function deleteEvent(eventId) { events = events.filter(e => e.id !== eventId); saveData(); load(); updateDashboard(selectedDate); }
    function deleteTodo(todoId) { todos = todos.filter(t => t.id !== todoId); saveData(); updateDashboard(selectedDate); }

    function renderSchedule(date) {
        const scheduleList = document.getElementById('schedule-list');
        scheduleList.innerHTML = '';
        const eventsForDay = events.filter(e => e.date === date);
        if (eventsForDay.length === 0) { scheduleList.innerHTML = '<p>등록된 일정이 없습니다.</p>'; return; }
        eventsForDay.forEach(event => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${event.isImportant ? '[중요] ' : ''}${event.title}</span>`;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-item-btn';
            deleteBtn.innerText = '×';
            deleteBtn.addEventListener('click', () => deleteEvent(event.id));
            li.appendChild(deleteBtn);
            scheduleList.appendChild(li);
        });
    }

    function renderTodos(date) {
        const todoList = document.getElementById('todolist-list');
        todoList.innerHTML = '';
        const todosForDay = todos.filter(t => t.date === date);
        if (todosForDay.length === 0) { todoList.innerHTML = '<p>등록된 투두리스트가 없습니다.</p>'; return; }
        todosForDay.forEach(todo => {
            const li = document.createElement('li');
            li.classList.toggle('completed', todo.completed);
            li.innerHTML = `<input type="checkbox" ${todo.completed ? 'checked' : ''}><span>${todo.title}</span>`;
            li.querySelector('input').addEventListener('change', () => {
                todo.completed = !todo.completed;
                li.classList.toggle('completed', todo.completed);
                saveData();
            });
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-item-btn';
            deleteBtn.innerText = '×';
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
    }

    function renderReminders(date) {
        const reminderList = document.getElementById('reminder-list');
        reminderList.innerHTML = '';
        const today = new Date(date);
        const upcomingEvents = events.filter(e => new Date(e.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 6);
        if (upcomingEvents.length === 0) { reminderList.innerHTML = '<p>남은 일정이 없습니다.</p>'; return; }
        upcomingEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
            const card = document.createElement('div');
            card.className = 'reminder-card';
            card.innerHTML = `<div class="d-day">D-${diffDays}</div><div class="event-title">${event.title}</div>`;
            card.style.backgroundColor = `rgba(255, 117, 129, ${Math.max(0.2, 1 - (diffDays / 30))})`;
            reminderList.appendChild(card);
        });
    }

    function renderDiary(date) {
        const diaryEntry = diaries.find(d => d.date === date);
        ctx.clearRect(0, 0, diaryCanvas.width, diaryCanvas.height);
        if (diaryEntry) {
            diaryTitleInput.value = diaryEntry.title || '';
            diaryTextarea.value = diaryEntry.text || '';
            if (diaryEntry.canvasData) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    if (canvasHistory.length === 0) { // Only push initial state if history is empty
                        pushToHistory();
                    }
                };
                img.src = diaryEntry.canvasData;
            } else {
                 if (canvasHistory.length === 0) {
                    pushToHistory();
                }
            }
        } else {
            diaryTitleInput.value = '';
            diaryTextarea.value = '';
            if (canvasHistory.length === 0) {
                pushToHistory();
            }
        }
    }
    
    function updateUndoRedoButtons() {
        undoBtn.disabled = historyStep <= 0;
        redoBtn.disabled = historyStep >= canvasHistory.length - 1;
    }

    function pushToHistory() {
        historyStep++;
        if (historyStep < canvasHistory.length) {
            canvasHistory.length = historyStep;
        }
        canvasHistory.push(diaryCanvas.toDataURL());
        updateUndoRedoButtons();
    }

    function undo() {
        if (historyStep > 0) {
            historyStep--;
            redrawFromHistory();
            updateUndoRedoButtons();
        }
    }

    function redo() {
        if (historyStep < canvasHistory.length - 1) {
            historyStep++;
            redrawFromHistory();
            updateUndoRedoButtons();
        }
    }

    function redrawFromHistory() {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, diaryCanvas.width, diaryCanvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = canvasHistory[historyStep];
    }

    function updateDashboard(date) {
        renderSchedule(date);
        renderTodos(date);
        renderReminders(date);
        canvasHistory = [];
        historyStep = -1;
        renderDiary(date);
        updateUndoRedoButtons();
    }

    function selectDate(dateString, daySquare) {
        selectedDate = dateString;
        document.querySelectorAll('.date-cell.selected').forEach(cell => cell.classList.remove('selected'));
        if (daySquare) daySquare.classList.add('selected');
        updateDashboard(selectedDate);
    }

    function load() {
        const dt = new Date();
        if (nav !== 0) dt.setMonth(new Date().getMonth() + nav);
        const day = dt.getDate(), month = dt.getMonth(), year = dt.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dateString = firstDayOfMonth.toLocaleDateString('ko-kr', { weekday: 'long' });
        const paddingDays = weekdays.indexOf(dateString.charAt(0));
        document.getElementById('current-month-year').innerText = `${year}년 ${month + 1}월`;
        calendar.innerHTML = '';
        for (let i = 1; i <= paddingDays + daysInMonth; i++) {
            const daySquare = document.createElement('div');
            daySquare.classList.add('date-cell');
            const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i - paddingDays).padStart(2, '0')}`;
            if (i > paddingDays) {
                daySquare.innerHTML = `<div class="date-number">${i - paddingDays}</div>`;
                if (i - paddingDays === day && nav === 0) daySquare.classList.add('today');
                if (dayString === selectedDate) daySquare.classList.add('selected');
                const eventsForDay = events.filter(e => e.date === dayString);
                eventsForDay.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.className = `event-preview event-${event.category}`;
                    eventDiv.innerText = event.title;
                    daySquare.appendChild(eventDiv);
                });
                daySquare.addEventListener('click', () => selectDate(dayString, daySquare));
            } else { daySquare.classList.add('other-month'); }
            calendar.appendChild(daySquare);
        }
    }

    function initCanvas() {
        const canvas = diaryCanvas;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        canvas.classList.add('pen-tool');
        const startDrawing = (e) => { isDrawing = true; [lastX, lastY] = [e.offsetX, e.offsetY]; };
        const draw = (e) => {
            if (!isDrawing || currentEditorMode !== 'drawing') return;
            ctx.strokeStyle = penColor;
            ctx.globalCompositeOperation = currentTool === 'pen' ? 'source-over' : 'destination-out';
            ctx.lineWidth = currentTool === 'eraser' ? penSize * 2 : penSize;
            ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke();
            [lastX, lastY] = [e.offsetX, e.offsetY];
        };
        const stopDrawing = () => {
            if (isDrawing) {
                pushToHistory();
            }
            isDrawing = false;
        };
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
    }

    // =================================================================================
    // --- 3. INITIALIZATION & EVENT LISTENERS ---
    // =================================================================================
    function init() {
        initCanvas();
        const addScheduleForm = document.getElementById('add-schedule-form');
        const addTodoForm = document.getElementById('add-todo-form');
        const drawingTools = document.querySelector('.drawing-tools');
        const textTools = document.querySelector('.text-tools');
        const modeSelectorButtons = document.querySelectorAll('.mode-selectors .tool-btn');

        function setEditorMode(mode) {
            currentEditorMode = mode;
            modeSelectorButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.mode-selectors .tool-btn[data-mode="${mode}"]`).classList.add('active');
            if (mode === 'text') {
                diaryTextarea.style.display = 'block';
                textTools.style.display = 'flex';
                diaryCanvas.style.display = 'none';
                drawingTools.style.display = 'none';
            } else {
                diaryTextarea.style.display = 'none';
                textTools.style.display = 'none';
                diaryCanvas.style.display = 'block';
                drawingTools.style.display = 'flex';
                currentTool = 'pen';
                diaryCanvas.classList.remove('pen-tool', 'eraser-tool');
                diaryCanvas.classList.add('pen-tool');
                diaryCanvas.width = diaryCanvas.offsetWidth;
                diaryCanvas.height = diaryCanvas.offsetHeight;
                renderDiary(selectedDate);
            }
        }

        modeSelectorButtons.forEach(btn => {
            btn.addEventListener('click', () => setEditorMode(btn.dataset.mode));
        });
        setEditorMode('text');

        document.getElementById('prev-month').addEventListener('click', () => { nav--; load(); });
        document.getElementById('next-month').addEventListener('click', () => { nav++; load(); });
        document.querySelectorAll('.dash-tab-link').forEach(link => {
            link.addEventListener('click', () => {
                const tab = link.getAttribute('data-tab');
                document.querySelectorAll('.dash-tab-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                document.querySelectorAll('.dash-tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(tab).classList.add('active');
            });
        });

        document.getElementById('add-schedule-btn').addEventListener('click', () => addScheduleForm.style.display = addScheduleForm.style.display === 'block' ? 'none' : 'block');
        document.getElementById('add-todo-btn').addEventListener('click', () => addTodoForm.style.display = addTodoForm.style.display === 'block' ? 'none' : 'block');
        document.getElementById('new-schedule-allday').addEventListener('change', (e) => { document.getElementById('new-schedule-time').style.display = e.target.checked ? 'none' : 'block'; });
        document.getElementById('save-schedule-btn').addEventListener('click', () => {
            const title = document.getElementById('new-schedule-title').value;
            if (title) {
                events.push({ id: Date.now(), date: selectedDate, title: title, isImportant: document.getElementById('new-schedule-important').checked, isAllDay: document.getElementById('new-schedule-allday').checked, time: document.getElementById('new-schedule-time').value, category: 'personal' });
                saveData(); load(); updateDashboard(selectedDate); addScheduleForm.style.display = 'none';
            }
        });
        document.querySelectorAll('#home-tab .template-btn[data-category]').forEach(btn => {
            btn.addEventListener('click', () => { events.push({ id: Date.now(), date: selectedDate, title: btn.dataset.title, category: btn.dataset.category }); saveData(); load(); updateDashboard(selectedDate); });
        });
        document.getElementById('new-todo-repeat').addEventListener('change', (e) => { document.getElementById('repeat-end-date-container').style.display = e.target.checked ? 'block' : 'none'; });
        document.getElementById('save-todo-btn').addEventListener('click', () => {
            const title = document.getElementById('new-todo-title').value;
            if (!title) return;
            const isRepeat = document.getElementById('new-todo-repeat').checked;
            if (isRepeat) {
                const endDate = new Date(document.getElementById('new-todo-end-date').value);
                let currentDate = new Date(selectedDate);
                while (currentDate <= endDate) {
                    todos.push({ id: Date.now() + Math.random(), date: currentDate.toISOString().split('T')[0], title: title, completed: false });
                    currentDate.setDate(currentDate.getDate() + 7);
                }
            } else { todos.push({ id: Date.now(), date: selectedDate, title: title, completed: false }); }
            saveData(); updateDashboard(selectedDate); addTodoForm.style.display = 'none';
        });

        document.querySelector('.drawing-tools .tool-btn[data-tool="eraser"]').addEventListener('click', () => {
            currentTool = 'eraser';
            diaryCanvas.classList.remove('pen-tool');
            diaryCanvas.classList.add('eraser-tool');
        });
        document.querySelector('.mode-selectors .tool-btn[data-mode="drawing"]').addEventListener('click', () => {
            currentTool = 'pen'; // Default to pen when switching to drawing mode
            diaryCanvas.classList.remove('eraser-tool');
            diaryCanvas.classList.add('pen-tool');
        });
        document.querySelectorAll('.color-box').forEach(box => {
            box.addEventListener('click', () => {
                document.querySelector('.color-box.active')?.classList.remove('active');
                box.classList.add('active');
                penColor = box.dataset.color;
            });
        });
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.size-btn.active')?.classList.remove('active');
                btn.classList.add('active');
                penSize = parseInt(btn.dataset.size, 10);
            });
        });
        document.getElementById('image-upload-input').addEventListener('change', (e) => {
            const reader = new FileReader();
            reader.onload = (event) => { 
                const img = new Image(); 
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, diaryCanvas.width, diaryCanvas.height);
                    pushToHistory();
                };
                img.src = event.target.result; 
            };
            reader.readAsDataURL(e.target.files[0]);
        });
        
        const emojiContainer = document.querySelector('.emoji-container');
        const emojiPicker = document.querySelector('.emoji-picker');
        emojiContainer.querySelector('.tool-btn').addEventListener('click', (e) => { e.stopPropagation(); emojiPicker.classList.toggle('open'); });
        document.querySelectorAll('.emoji-tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = e.target.dataset.category;
                document.querySelectorAll('.emoji-tab-btn').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                document.querySelectorAll('.emoji-grid').forEach(grid => {
                    grid.classList.remove('active');
                    if (grid.id === category) grid.classList.add('active');
                });
            });
        });
        document.querySelectorAll('.emoji-grid span').forEach(emoji => {
            emoji.addEventListener('click', (e) => { e.stopPropagation(); diaryTextarea.value += emoji.innerText; });
        });
        document.addEventListener('click', (e) => { if (!emojiContainer.contains(e.target)) { emojiPicker.classList.remove('open'); } });

        document.getElementById('save-diary-btn').addEventListener('click', () => {
            let title = diaryTitleInput.value.trim();
            if (!title) {
                const defaultTitle = "이름 없는 다이어리";
                const untitledDiaries = diaries.filter(d => d.title && d.title.startsWith(defaultTitle));
                title = `${defaultTitle} ${untitledDiaries.length + 1}`;
            }
            const newText = diaryTextarea.value;
            const canvasData = diaryCanvas.toDataURL();
            let diaryEntry = diaries.find(d => d.date === selectedDate);
            if (diaryEntry) {
                diaryEntry.title = title;
                diaryEntry.text = newText;
                diaryEntry.canvasData = canvasData;
                if (!diaryEntry.id) { diaryEntry.id = Date.now(); }
            } else {
                diaries.push({ id: Date.now(), date: selectedDate, title: title, text: newText, canvasData: canvasData });
            }
            saveData();
            alert('다이어리가 저장되었습니다.');
        });

        document.getElementById('undo-btn').addEventListener('click', undo);
        document.getElementById('redo-btn').addEventListener('click', redo);

        document.getElementById('collection-trigger').addEventListener('click', () => { document.getElementById('collection-sidebar').classList.toggle('open'); });
        document.getElementById('collection-diary-btn').addEventListener('click', () => { window.location.href = 'diary_collection.html'; });

        load();
        updateDashboard(selectedDate);
    }

    init();
});