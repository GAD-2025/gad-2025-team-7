import React, { useState, useEffect, useRef } from 'react';
import './Stopwatch.css';

const Stopwatch = ({ userId, selectedDate }) => {
    const [tasks, setTasks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!userId || !selectedDate) return;

        const fetchData = async () => {
            const baseCategories = ['공부', '운동', '취미', '알바'];
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/stopwatch/${userId}/${selectedDate}`);
                if (res.ok) {
                    const data = await res.json();
                    let fetchedCategories = [];
                    if (data && data.categories_data && Array.isArray(data.categories_data)) {
                        // 1. Filter out "???" categories
                        fetchedCategories = data.categories_data.filter(cat => cat !== '???');
                    }

                    // 2. Ensure base categories are present and remove duplicates
                    const combinedCategories = [...new Set([...baseCategories, ...fetchedCategories])];
                    
                    setTasks(data?.tasks_data || []);
                    setCategories(combinedCategories);
                } else {
                    // If fetch fails or not ok, set to base categories
                    setTasks([]);
                    setCategories(baseCategories);
                }
            } catch (error) {
                console.error("Error fetching stopwatch data:", error);
                // On error, set to base categories
                setTasks([]);
                setCategories(baseCategories);
            }
        };

        fetchData();
    }, [userId, selectedDate]);

    const saveStopwatchData = async (currentTasks, currentCategories) => {
        if (!userId || !selectedDate) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/stopwatch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTasks(prevTasks =>
                prevTasks.map(task => 
                    (!task.isPaused && !task.isComplete) 
                        ? { ...task, elapsedTime: task.elapsedTime + 1000 } 
                        : task
                )
            );
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const selectCategory = (categoryName) => {
        setSelectedCategory(categoryName);
        if (!tasks.some(task => task.category === categoryName && !task.isComplete)) {
            const newTask = {
                id: Date.now(),
                category: categoryName,
                elapsedTime: 0,
                isPaused: true,
                isComplete: false,
            };
            setTasks(prev => [...prev, newTask]);
        }
    };

    const startTask = (task) => {
        if (!task || !task.isPaused) return;
        setTasks(tasks.map(t => t.id === task.id ? { ...t, isPaused: false } : t));
    };

    const pauseTask = (task) => {
        if (!task || task.isPaused) return;
        const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, isPaused: true } : t);
        setTasks(updatedTasks);
        saveStopwatchData(updatedTasks, categories);
    };

    const resetTask = (task) => {
        if (!task || !task.isPaused) return;
        const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, elapsedTime: 0 } : t);
        setTasks(updatedTasks);
        saveStopwatchData(updatedTasks, categories);
    };

    const finishTask = (taskId) => {
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, isComplete: true, isPaused: true } : t);
        setTasks(updatedTasks);
        saveStopwatchData(updatedTasks, categories);
        if (selectedCategory === tasks.find(t => t.id === taskId)?.category) {
            setSelectedCategory(null);
        }
    };

    const deleteTask = (taskId) => {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        saveStopwatchData(updatedTasks, categories);
    };

    const addNewCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            const updatedCategories = [...categories, newCategory];
            setCategories(updatedCategories);
            setNewCategory('');
            saveStopwatchData(tasks, updatedCategories);
        }
    };
    
    const selectedTask = tasks.find(t => t.category === selectedCategory && !t.isComplete);

    return (
        <div className="stopwatch-container" data-node-id="661:4003">
            <div className="stopwatch-top-section">
                <div className="category-section" data-node-id="661:4148">
    
                    <div className="category-list">
                        {categories.map(cat => (
                            <div 
                                key={cat} 
                                className={`category-chip ${selectedCategory === cat ? 'selected' : ''}`}
                                onClick={() => selectCategory(cat)}
                            >
                                {cat}
                            </div>
                        ))}
                    </div>
                    <div className="add-category-wrapper">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="새 카테고리 추가"
                        />
                        <button onClick={addNewCategory}>+</button>
                    </div>
                </div>
                
                <div className="main-stopwatch" data-node-id="661:4191">
                    <h3>{selectedCategory || '카테고리를 선택하세요'}</h3>
                    <div className="timer-display" data-node-id="661:4197">
                        {selectedTask ? formatTime(selectedTask.elapsedTime) : '00:00:00'}
                    </div>
                    <div className="main-controls" data-node-id="661:4198">
                        <button 
                            onClick={() => selectedTask && (selectedTask.isPaused ? startTask(selectedTask) : pauseTask(selectedTask))}
                            disabled={!selectedTask}
                            className="start-button"
                        >
                            {selectedTask && !selectedTask.isPaused ? '일시정지' : '시작'}
                        </button>
                        <button 
                            onClick={() => resetTask(selectedTask)}
                            disabled={!selectedTask || !selectedTask.isPaused}
                            className="reset-button"
                        >
                            초기화
                        </button>
                    </div>
                </div>
            </div>

            <div className="task-list-section" data-node-id="661:4171">

                <ul className="stopwatch-task-list">
                    {tasks.filter(t => !t.isComplete).map(task => (
                        <li key={task.id}>
                            <div className="task-details">
                                <span className="task-category-chip" onClick={() => selectCategory(task.category)}>{task.category}</span>
                                <span>{formatTime(task.elapsedTime)}</span>
                            </div>
                            <button onClick={() => finishTask(task.id)}>완료</button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={`task-list-section ${tasks.filter(t => t.isComplete).length === 0 ? 'hide-border' : ''}`} data-node-id="661:4172">

                <ul className="stopwatch-task-list">
                    {tasks.filter(t => t.isComplete).map(task => (
                        <li key={task.id}>
                            <div className="task-details">
                                <span className="task-category-chip">{task.category}</span>
                                <span>{formatTime(task.elapsedTime)}</span>
                            </div>
                            <button className="delete-button-circle" onClick={() => deleteTask(task.id)}>-</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Stopwatch;
