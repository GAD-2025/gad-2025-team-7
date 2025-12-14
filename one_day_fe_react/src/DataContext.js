import React, { createContext, useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useProfile } from './ProfileContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// --- HELPER FUNCTIONS ---
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

const STORAGE_KEY = 'oneDayHealthData';

// --- INITIAL STATE LOADER ---
const loadStateFromStorage = () => {
    try {
        const storedState = sessionStorage.getItem(STORAGE_KEY);
        if (storedState) {
            return JSON.parse(storedState);
        }
    } catch (e) {
        console.error("Failed to parse state from sessionStorage", e);
    }
    return { meals: {}, pedometer: {} }; // Default structure
};

export const DataProvider = ({ children }) => {
    const { profile } = useProfile();
    const userId = profile?.userId;

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    // --- CACHING STATES (Initialized from Session Storage) ---
    const [mealsByDate, setMealsByDate] = useState(() => loadStateFromStorage().meals);
    const [pedometerDataByDate, setPedometerDataByDate] = useState(() => loadStateFromStorage().pedometer);

    const [dietTotals, setDietTotals] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
    
    // --- DEBOUNCED SAVE FUNCTIONS ---
    const debouncedSaveApiMealsRef = useRef(debounce((date, cards) => saveMeals(date, cards), 1500));
    const debouncedSaveApiStepsRef = useRef(debounce((date, steps) => saveSteps(date, steps), 1500));
    const debouncedSaveToStorageRef = useRef(debounce((data) => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Failed to save state to sessionStorage", e);
        }
    }, 500));

    // --- API FUNCTIONS ---
    async function saveMeals(dateToSave, mealCardsToSave) {
        if (!userId || !dateToSave || !mealCardsToSave) return;
        if (mealCardsToSave.length === 0 || (mealCardsToSave.length === 1 && mealCardsToSave[0].foods.length === 0)) return; 
        try {
            await fetch('http://localhost:3001/api/meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, date: dateToSave, mealCards: mealCardsToSave }),
            });
        } catch (error) { console.error(`Error saving meals for date ${dateToSave}:`, error); }
    }

    async function saveSteps(dateToSave, stepsToSave) {
        if (!userId || !dateToSave || stepsToSave === undefined) return;
        try {
            await fetch('http://localhost:3001/api/healthcare/steps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, date: dateToSave, steps: stepsToSave }),
            });
        } catch (error) { console.error(`Error saving steps for date ${dateToSave}:`, error); }
    }

    // --- NEW ON-DEMAND DATA FETCHER ---
    const getDataForDate = useCallback(async (date) => {
        if (!userId || !date) return { steps: 0, meals: [] };

        let steps = pedometerDataByDate[date]?.steps;
        let meals = mealsByDate[date];

        const promises = [];

        if (steps === undefined) {
            promises.push(
                fetch(`http://localhost:3001/api/healthcare/steps/${userId}/${date}`)
                    .then(res => res.json())
                    .then(data => {
                        const fetchedSteps = data.steps || 0;
                        setPedometerDataByDate(prev => ({ ...prev, [date]: { steps: fetchedSteps } }));
                        steps = fetchedSteps;
                    })
                    .catch(error => {
                        console.error(`Error fetching steps for ${date}:`, error);
                        setPedometerDataByDate(prev => ({ ...prev, [date]: { steps: 0 } }));
                        steps = 0;
                    })
            );
        }

        if (meals === undefined) {
            promises.push(
                fetch(`http://localhost:3001/api/meals/${userId}/${date}`)
                    .then(res => res.json())
                    .then(data => {
                        const fetchedMeals = data || [];
                        setMealsByDate(prev => ({ ...prev, [date]: fetchedMeals }));
                        meals = fetchedMeals;
                    })
                    .catch(error => {
                        console.error(`Error fetching meals for ${date}:`, error);
                        setMealsByDate(prev => ({ ...prev, [date]: [] }));
                        meals = [];
                    })
            );
        }

        await Promise.all(promises);

        return { steps: steps ?? 0, meals: meals ?? [] };

    }, [userId, pedometerDataByDate, mealsByDate]);


    // --- DATA FETCHING EFFECT for global selectedDate ---
    useEffect(() => {
        if (!userId || !selectedDate) return;
        getDataForDate(selectedDate);
    }, [userId, selectedDate, getDataForDate]);

    // --- SAVE TO STORAGE EFFECT ---
    useEffect(() => {
        debouncedSaveToStorageRef.current({
            meals: mealsByDate,
            pedometer: pedometerDataByDate
        });
    }, [mealsByDate, pedometerDataByDate]);

    // --- CALCULATION & API SAVE EFFECTS ---
    useEffect(() => {
        const currentMealCards = mealsByDate[selectedDate] || [];
        const totals = { calories: 0, carbs: 0, protein: 0, fat: 0 };
        currentMealCards.forEach(card => {
            card.foods.forEach(food => {
                totals.calories += (food.calories || 0) * (food.qty || 1);
                totals.carbs += (food.carbs || 0) * (food.qty || 1);
                totals.protein += (food.protein || 0) * (food.qty || 1);
                totals.fat += (food.fat || 0) * (food.qty || 1);
            });
        });
        setDietTotals(totals);
        debouncedSaveApiMealsRef.current(selectedDate, currentMealCards);
    }, [mealsByDate, selectedDate]);

    useEffect(() => {
        const currentSteps = pedometerDataByDate[selectedDate]?.steps;
        if (currentSteps !== undefined) {
            debouncedSaveApiStepsRef.current(selectedDate, currentSteps);
        }
    }, [pedometerDataByDate, selectedDate]);

    // --- HANDLER FUNCTIONS ---
    const updateCurrentMeals = (updateFn) => setMealsByDate(prev => ({ ...prev, [selectedDate]: updateFn(prev[selectedDate] || []) }));
    const updateSteps = (newSteps) => setPedometerDataByDate(prev => ({ ...prev, [selectedDate]: { steps: newSteps } }));
    const addMealCard = () => updateCurrentMeals(cards => [...cards, { id: Date.now(), category: '점심', foods: [], searchQuery: '' }]);
    const handleCategoryChange = (cardId, newCategory) => updateCurrentMeals(cards => cards.map(card => card.id === cardId ? { ...card, category: newCategory } : card));
    const deleteMealCard = (cardId) => updateCurrentMeals(cards => cards.length > 1 ? cards.filter(card => card.id !== cardId) : cards);
    const removeFoodFromCard = (cardId, foodId) => updateCurrentMeals(cards => cards.map(card => card.id === cardId ? { ...card, foods: card.foods.filter(f => f.id !== foodId) } : card));
    const updateFoodQty = (cardId, foodId, qty) => updateCurrentMeals(cards => cards.map(card => card.id === cardId ? { ...card, foods: card.foods.map(f => f.id === foodId ? { ...f, qty: parseFloat(qty) || 1 } : f) } : cards));
    const addFoodToCard = (cardId, food) => updateCurrentMeals(cards => cards.map(card => card.id === cardId ? { ...card, foods: [...card.foods, { ...food, qty: 1, id: Date.now() }], searchQuery: '' } : card));
    const setSearchQuery = (cardId, query) => updateCurrentMeals(cards => cards.map(card => card.id === cardId ? { ...card, searchQuery: query } : card));

    // --- CONTEXT VALUE ---
    const value = {
        selectedDate, setSelectedDate,
        mealCards: mealsByDate[selectedDate] || [],
        dietTotals,
        steps: pedometerDataByDate[selectedDate]?.steps || 0,
        getDataForDate, // <-- Export the new function
        updateSteps,
        addMealCard, deleteMealCard, handleCategoryChange,
        addFoodToCard, removeFoodFromCard, updateFoodQty, setSearchQuery
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
