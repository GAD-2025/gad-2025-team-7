import React, { useState, useEffect, useRef } from 'react';
import './Stopwatch.css';

const Stopwatch = ({ userId, selectedDate }) => {
    const [tasks, setTasks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [selectedNewCategoryColor, setSelectedNewCategoryColor] = useState('#FFC0CB'); // Default color
    const [isAddCategoryPopupOpen, setIsAddCategoryPopupOpen] = useState(false); // State for popup visibility
    const intervalRef = useRef(null);

    // Predefined colors for new categories
    const predefinedColors = [
        '#FFC0CB', '#FFD700', '#ADD8E6', '#90EE90', '#FFB6C1', '#FFDAB9', '#E6E6FA', '#FFFACD',
    ];

    useEffect(() => {
        if (!userId || !selectedDate) return;

        const fetchData = async () => {
            const baseColors = ['#FFC0CB', '#FFD700', '#ADD8E6', '#90EE90']; // Corresponding colors for base categories
            const baseCategories = ['공부', '운동', '취미', '알바'].map((name, index) => ({
                name,
                color: baseColors[index] || '#FFC0CB' // Assign a default if no specific color
            }));
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/stopwatch/${userId}/${selectedDate}`);
                if (res.ok) {
                    const data = await res.json();
                    let fetchedCategories = [];
                    if (data && data.categories_data && Array.isArray(data.categories_data)) {
                        // Ensure fetched categories have a color, default if missing
                        fetchedCategories = data.categories_data
                            .filter(cat => cat.name !== '???') // Filter out "???" categories
                            .map(cat => ({ name: cat.name, color: cat.color || '#FFC0CB' }));
                    }

                    // Combine base and fetched, ensuring unique names
                    const combinedCategoriesMap = new Map();
                    baseCategories.forEach(cat => combinedCategoriesMap.set(cat.name, cat));
                    fetchedCategories.forEach(cat => combinedCategoriesMap.set(cat.name, cat));
                    const combinedCategories = Array.from(combinedCategoriesMap.values());
                    
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
                    // Convert category objects back to a simpler format for storage if needed,
                    // or ensure backend can handle objects directly.
                    // For now, assume backend can handle objects {name, color}
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

    const selectCategory = (categoryObject) => { // Accept category object
        setSelectedCategory(categoryObject.name); // Set selected category name
        if (!tasks.some(task => task.category === categoryObject.name && !task.isComplete)) {
            const newTask = {
                id: Date.now(),
                category: categoryObject.name,
                color: categoryObject.color, // Include color in the new task
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
        if (newCategory && !categories.some(cat => cat.name === newCategory)) {
            const newCatObject = { name: newCategory, color: selectedNewCategoryColor };
            const updatedCategories = [...categories, newCatObject];
            setCategories(updatedCategories);
            setNewCategory('');
            saveStopwatchData(tasks, updatedCategories);
            setIsAddCategoryPopupOpen(false); // Close the popup after adding category
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
                                key={cat.name} 
                                className={`category-chip ${selectedCategory === cat.name ? 'selected' : ''}`}
                                style={{
                                    backgroundColor: `rgba(${parseInt(cat.color.slice(1,3), 16)}, ${parseInt(cat.color.slice(3,5), 16)}, ${parseInt(cat.color.slice(5,7), 16)}, 0.5)`,
                                    border: `1px solid ${cat.color}`
                                }}
                                onClick={() => selectCategory(cat)} // Pass the full object
                            >
                                {cat.name}
                                {cat.name === '공부' && (
                                    <button 
                                        className="add-category-trigger-button"
                                        onClick={(e) => { e.stopPropagation(); setIsAddCategoryPopupOpen(true); }}
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                        ))}
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
                                <span 
                                    className="task-category-chip" 
                                    style={{
                                        backgroundColor: `rgba(${parseInt(task.color?.slice(1,3), 16)}, ${parseInt(task.color?.slice(3,5), 16)}, ${parseInt(task.color?.slice(5,7), 16)}, 0.5)`,
                                        border: `1px solid ${task.color}`
                                    }}
                                    onClick={() => selectCategory({name: task.category, color: task.color})}
                                >
                                    {task.category}
                                </span>
                                <div className="task-separator-line"></div>
                                <span>{formatTime(task.elapsedTime)}</span>
                            </div>
                            <button
                                className="play-pause-button"
                                onClick={() => task.isPaused ? startTask(task) : pauseTask(task)}
                            >
                                {task.isPaused ? '▶' : '⏸'}
                            </button>
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
                                <span 
                                    className="task-category-chip" 
                                    style={{
                                        backgroundColor: `rgba(${parseInt(task.color?.slice(1,3), 16)}, ${parseInt(task.color?.slice(3,5), 16)}, ${parseInt(task.color?.slice(5,7), 16)}, 0.5)`,
                                        border: `1px solid ${task.color}`
                                    }}
                                >
                                    {task.category}
                                </span>
                                <div className="task-separator-line"></div>
                                <span>{formatTime(task.elapsedTime)}</span>
                            </div>
                            <button className="delete-button-circle" onClick={() => deleteTask(task.id)}>-</button>
                        </li>
                    ))}
                </ul>
            </div>
            {isAddCategoryPopupOpen && (
                <div className="add-category-popup-overlay">
                    <div className="add-category-popup-content">
                        <button className="add-category-popup-close-button" onClick={() => setIsAddCategoryPopupOpen(false)}>X</button>
                        <h4>새 카테고리 추가</h4>
                        <div className="add-category-wrapper">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="새 카테고리 추가"
                            />
                            <button onClick={addNewCategory}>+</button>
                        </div>
                        <div className="color-picker-palette">
                            {predefinedColors.map(color => (
                                <div
                                    key={color}
                                    className={`color-swatch ${selectedNewCategoryColor === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedNewCategoryColor(color)}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stopwatch;
