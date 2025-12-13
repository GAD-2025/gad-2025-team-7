import React, { useState, useEffect, useRef } from 'react';
import './Stopwatch.css';

const Stopwatch = ({ userId, selectedDate }) => {
    const [tasks, setTasks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const intervalRef = useRef(null);
    // saveTimeoutRef removed as it's no longer needed for debounced saves


    // Fetch data on load and date change
    useEffect(() => {
        if (!userId || !selectedDate) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/stopwatch/${userId}/${selectedDate}`);
                if (res.ok) {
                    const data = await res.json();
                    // Data exists and has non-empty categories
                    if (data && data.categories_data && data.categories_data.length > 0) {
                        setTasks(data.tasks_data || []);
                        setCategories(data.categories_data);
                    } else {
                        // Data is null, or categories are empty, set to default
                        setTasks(data ? data.tasks_data || [] : []);
                        setCategories(['공부', '운동', '취미', '알바']);
                    }
                } else {
                    // Handle non-ok responses (e.g., 500 error)
                    setTasks([]);
                    setCategories(['공부', '운동', '취미', '알바']);
                }
            } catch (error) {
                console.error("Error fetching stopwatch data:", error);
                // Handle fetch errors (e.g., network issue)
                setTasks([]);
                setCategories(['공부', '운동', '취미', '알바']);
            }
        };

        fetchData();
    }, [userId, selectedDate]);
    
    // Function to save stopwatch data explicitly
    const saveStopwatchData = async (currentTasks, currentCategories) => {
        if (!userId || !selectedDate) return;
        try {
            const res = await fetch('http://localhost:3001/api/stopwatch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    date: selectedDate,
                    tasksData: currentTasks,
                    categoriesData: currentCategories,
                }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Backend error saving stopwatch data:", errorData);
            }
        } catch (error) {
            console.error("Network error saving stopwatch data:", error);
        }
    };


    // Timer interval
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTasks(prevTasks =>
                prevTasks.map(task => {
                    if (!task.isPaused && !task.isComplete) {
                        return { ...task, elapsedTime: task.elapsedTime + 1000 };
                    }
                    return task;
                })
            );
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, []);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const selectCategory = (categoryName) => {
        setSelectedCategory(categoryName);
        const task = tasks.find(task => task.category === categoryName && !task.isComplete);
        if (!task) {
            const newTask = {
                id: Date.now(),
                category: categoryName,
                elapsedTime: 0,
                isPaused: true,
                isComplete: false,
            };
            setTasks([...tasks, newTask]);
        }
    };

    const startTask = (task) => {
        if (!task || !task.isPaused) return;
        setTasks(tasks.map(t => 
            t.id === task.id ? { ...t, isPaused: false } : t
        ));
    };

    const pauseTask = (task) => {
        if (!task || task.isPaused) return;
        setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(t => 
                t.id === task.id ? { ...t, isPaused: true } : t
            );
            saveStopwatchData(updatedTasks, categories); // Save immediately
            return updatedTasks;
        });
    };

    const resetTask = (task) => {
        if (!task || !task.isPaused) return;
        setTasks(tasks.map(t => 
            t.id === task.id ? { ...t, elapsedTime: 0 } : t
        ));
    };

    const finishTask = (taskId) => {
        setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(t => 
                t.id === taskId ? { ...t, isComplete: true, isPaused: true } : t
            );
            saveStopwatchData(updatedTasks, categories); // Save immediately
            return updatedTasks;
        });

        // The selectedCategory logic can remain
        const task = tasks.find(t => t.id === taskId);
        if (task && selectedCategory === task.category) {
            setSelectedCategory(null);
        }
    };

    const deleteTask = (taskId) => {
        setTasks(prevTasks => {
            const updatedTasks = prevTasks.filter(t => t.id !== taskId);
            saveStopwatchData(updatedTasks, categories); // Save immediately
            return updatedTasks;
        });
    };

    const addNewCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            const updatedCategories = [...categories, newCategory];
            setCategories(updatedCategories);
            setNewCategory('');
            saveStopwatchData(tasks, updatedCategories); // Save immediately
        }
    };

    const selectedTask = tasks.find(t => t.category === selectedCategory && !t.isComplete);

    return (
        <div className="record-container">
            <aside className="category-sidebar">
                <h2>카테고리</h2>
                <ul id="category-list">
                    {categories.map(category => (
                        <li 
                            key={category} 
                            data-category={category} 
                            className={selectedCategory === category ? 'selected' : ''}
                            onClick={() => selectCategory(category)}
                        >
                            {category}
                        </li>
                    ))}
                </ul>
                <div className="add-category">
                    <input 
                        type="text" 
                        id="new-category-input" 
                        placeholder="새 카테고리 추가" 
                        value={newCategory} 
                        onChange={(e) => setNewCategory(e.target.value)} 
                    />
                    <button id="add-category-btn" onClick={addNewCategory}>+</button>
                </div>
            </aside>
    
            <main className="stopwatch-main">
                <div className="stopwatch-display-area">
                    <h3 id="current-category-display">{selectedCategory || '카테고리를 선택하세요'}</h3>
                    <div id="stopwatch-timer">{selectedTask ? formatTime(selectedTask.elapsedTime) : '00:00:00'}</div>
                    <div className="stopwatch-controls">
                        <button 
                            id="start-pause-btn" 
                            disabled={!selectedTask}
                            onClick={() => selectedTask && (selectedTask.isPaused ? startTask(selectedTask) : pauseTask(selectedTask))}
                            className={selectedTask && !selectedTask.isPaused ? 'paused' : ''}
                        >
                            {selectedTask && !selectedTask.isPaused ? '일시정지' : '시작'}
                        </button>
                        <button 
                            id="reset-btn" 
                            disabled={!selectedTask || !selectedTask.isPaused}
                            onClick={() => resetTask(selectedTask)}
                        >
                            초기화
                        </button>
                    </div>
                </div>
    
                <div className="task-lists">
                    <section className="task-list-section">
                        <h3>진행중인 기록</h3>
                        <ul id="in-progress-list">
                            {tasks.filter(t => !t.isComplete).map(task => (
                                <li key={task.id} className={`task-item ${!task.isPaused ? 'active' : 'paused'}`}>
                                    <span className="task-category" onClick={() => selectCategory(task.category)}>{task.category}</span>
                                    <span className="task-time">{formatTime(task.elapsedTime)}</span>
                                    <div className="task-controls">
                                        {task.isPaused
                                            ? <button className="resume-btn" onClick={() => startTask(task)}>▶</button>
                                            : <button className="pause-btn" onClick={() => pauseTask(task)}>❚❚</button>
                                        }
                                        <button className="finish-btn" onClick={() => finishTask(task.id)}>완료</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section className="task-list-section">
                        <h3>기록 완료</h3>
                        <ul id="completed-list">
                            {tasks.filter(t => t.isComplete).map(task => (
                                <li key={task.id} className="task-item completed">
                                    <span className="task-category">{task.category}</span>
                                    <span className="task-time">{formatTime(task.elapsedTime)}</span>
                                    <div className="task-controls">
                                        <button className="delete-btn" onClick={() => deleteTask(task.id)}>삭제</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Stopwatch;
