document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const categoryList = document.getElementById('category-list');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const newCategoryInput = document.getElementById('new-category-input');
    const currentCategoryDisplay = document.getElementById('current-category-display');
    const stopwatchTimer = document.getElementById('stopwatch-timer');
    const startPauseBtn = document.getElementById('start-pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const inProgressList = document.getElementById('in-progress-list');
    const completedList = document.getElementById('completed-list');

    // State
    let tasks = [];
    let selectedCategory = null;

    // --- Utility Functions ---
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function getTask(category) {
        return tasks.find(task => task.category === category && !task.isComplete);
    }

    // --- Core Logic ---
    function selectCategory(categoryName) {
        selectedCategory = categoryName;
        
        document.querySelectorAll('#category-list li').forEach(li => {
            li.classList.toggle('selected', li.dataset.category === categoryName);
        });

        let task = getTask(categoryName);
        if (!task) {
            task = {
                id: Date.now(),
                category: categoryName,
                startTime: 0,
                elapsedTime: 0,
                isPaused: true,
                isComplete: false,
                intervalId: null,
            };
            tasks.push(task);
        }
        
        updateMainDisplay(task);
        renderInProgressList();
    }

    function startTask(task) {
        if (!task || !task.isPaused) return;

        task.isPaused = false;
        task.startTime = Date.now();
        
        task.intervalId = setInterval(() => {
            const timePassed = Date.now() - task.startTime;
            const totalElapsed = task.elapsedTime + timePassed;
            
            // Update list item
            const taskItem = document.querySelector(`.task-item[data-id='${task.id}'] .task-time`);
            if (taskItem) {
                taskItem.textContent = formatTime(totalElapsed);
            }
            // Update main display if it's the selected task
            if (selectedCategory === task.category) {
                stopwatchTimer.textContent = formatTime(totalElapsed);
            }
        }, 1000);

        if (selectedCategory === task.category) {
            updateMainDisplay(task);
        }
        renderInProgressList();
    }

    function pauseTask(task) {
        if (!task || task.isPaused) return;

        clearInterval(task.intervalId);
        task.intervalId = null;

        const timePassed = Date.now() - task.startTime;
        task.elapsedTime += timePassed;
        task.isPaused = true;
        
        if (selectedCategory === task.category) {
            updateMainDisplay(task);
        }
        renderInProgressList();
    }

    function resetTask(task) {
        if (!task || !task.isPaused) return;
        task.elapsedTime = 0;
        updateMainDisplay(task);
        renderInProgressList();
    }

    function finishTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        if (!task.isPaused) {
            pauseTask(task);
        }
        task.isComplete = true;

        if (selectedCategory === task.category) {
            selectedCategory = null;
            updateMainDisplay(); // Clear main display
            document.querySelectorAll('#category-list li').forEach(li => li.classList.remove('selected'));
        }

        renderInProgressList();
        renderCompletedList();
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(t => t.id !== taskId);
        renderCompletedList();
    }

    // --- UI Rendering ---
    function updateMainDisplay(task) {
        if (task) {
            currentCategoryDisplay.textContent = task.category;
            stopwatchTimer.textContent = formatTime(task.elapsedTime);
            startPauseBtn.disabled = false;
            resetBtn.disabled = !task.isPaused;
            startPauseBtn.textContent = task.isPaused ? '시작' : '일시정지';
            startPauseBtn.classList.toggle('paused', !task.isPaused);
        } else {
            currentCategoryDisplay.textContent = '카테고리를 선택하세요';
            stopwatchTimer.textContent = '00:00:00';
            startPauseBtn.disabled = true;
            resetBtn.disabled = true;
            startPauseBtn.textContent = '시작';
            startPauseBtn.classList.remove('paused');
        }
    }

    function renderInProgressList() {
        inProgressList.innerHTML = '';
        tasks.filter(t => !t.isComplete).forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${!task.isPaused ? 'active' : 'paused'}`;
            li.dataset.id = task.id;

            const currentElapsedTime = task.isPaused ? task.elapsedTime : task.elapsedTime + (Date.now() - task.startTime);

            li.innerHTML = `
                <span class="task-category">${task.category}</span>
                <span class="task-time">${formatTime(currentElapsedTime)}</span>
                <div class="task-controls">
                    ${task.isPaused
                        ? `<button class="resume-btn" data-action="resume">▶</button>`
                        : `<button class="pause-btn" data-action="pause">❚❚</button>`
                    }
                    <button class="finish-btn" data-action="finish">완료</button>
                </div>
            `;
            inProgressList.appendChild(li);
        });
    }

    function renderCompletedList() {
        completedList.innerHTML = '';
        tasks.filter(t => t.isComplete).forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item completed';
            li.dataset.id = task.id;
            li.innerHTML = `
                <span class="task-category">${task.category}</span>
                <span class="task-time">${formatTime(task.elapsedTime)}</span>
                <div class="task-controls">
                    <button class="delete-btn" data-action="delete">삭제</button>
                </div>
            `;
            completedList.appendChild(li);
        });
    }

    function addNewCategory(categoryName) {
        if (!categoryName || tasks.some(t => t.category === categoryName)) return;
        const li = document.createElement('li');
        li.dataset.category = categoryName;
        li.textContent = categoryName;
        categoryList.appendChild(li);
        newCategoryInput.value = '';
    }

    // --- Event Listeners ---
    categoryList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            selectCategory(e.target.dataset.category);
        }
    });

    addCategoryBtn.addEventListener('click', () => {
        addNewCategory(newCategoryInput.value.trim());
    });

    newCategoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNewCategory(newCategoryInput.value.trim());
        }
    });

    startPauseBtn.addEventListener('click', () => {
        const task = getTask(selectedCategory);
        if (!task) return;
        if (task.isPaused) {
            startTask(task);
        } else {
            pauseTask(task);
        }
    });

    resetBtn.addEventListener('click', () => {
        const task = getTask(selectedCategory);
        resetTask(task);
    });

    inProgressList.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        
        const li = button.closest('.task-item');
        const taskId = parseInt(li.dataset.id, 10);
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const action = button.dataset.action;

        if (action === 'finish') {
            finishTask(taskId);
        } else if (action === 'resume') {
            startTask(task);
        } else if (action === 'pause') {
            pauseTask(task);
        }
    });

    completedList.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const li = button.closest('.task-item');
        const taskId = parseInt(li.dataset.id, 10);
        if (button.dataset.action === 'delete') {
            deleteTask(taskId);
        }
    });

    // Initial Render
    renderInProgressList();
    renderCompletedList();
    updateMainDisplay();
});