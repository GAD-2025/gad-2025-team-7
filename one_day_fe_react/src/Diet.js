import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// --- Helper Components ---

const AutocompletePortal = ({ results, position, onSelect, containerRef }) => {
    if (!results || results.length === 0 || !position) {
        return null;
    }

    const style = {
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        zIndex: 1100,
    };

    return createPortal(
        <div className="autocomplete-results" style={style}>
            {results.map(food => (
                <div key={food.name} className="autocomplete-item" onClick={() => onSelect(food)}>
                    {food.name} ({Math.round(food.calories)}kcal)
                </div>
            ))}
        </div>,
        document.getElementById('portal-root')
    );
};

const CategoryMenu = ({ cardId, onSelect, onClose }) => {
    const categories = ['아침', '점심', '저녁', '간식'];
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="category-select-menu" ref={menuRef}>
            {categories.map(category => (
                <button key={category} onClick={() => onSelect(cardId, category)}>
                    {category}
                </button>
            ))}
        </div>
    );
};

// --- Main Diet Component ---

const Diet = ({ setDietTotals, userId, selectedDate }) => {
    const [mealCards, setMealCards] = useState([]);
    const [openMenuCardId, setOpenMenuCardId] = useState(null);

    const [portalResults, setPortalResults] = useState([]);
    const [portalPosition, setPortalPosition] = useState(null);
    const [activeCardId, setActiveCardId] = useState(null);
    const activeSearchInputRef = useRef(null);
    
    const containerRef = useRef(null);
    const cardRefs = useRef(new Map());

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    const debouncedSave = useRef(debounce((cards) => saveMeals(cards), 2000)).current;

    async function saveMeals(currentMealCards) {
        if (!userId || !selectedDate) return;
        try {
            await fetch('http://localhost:3001/api/meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, date: selectedDate, mealCards: currentMealCards }),
            });
        } catch (error) { console.error('Error saving meals:', error); }
    }

    useEffect(() => {
        const fetchMeals = async () => {
            if (!userId || !selectedDate) return;
            try {
                const res = await fetch(`http://localhost:3001/api/meals/${userId}/${selectedDate}`);
                const data = await res.json();
                if (data.mealCards && data.mealCards.length > 0) {
                    setMealCards(data.mealCards.map(c => ({...c, searchQuery: ''}))); // Ensure searchQuery is initialized
                } else {
                    setMealCards([{ id: Date.now(), category: '아침', foods: [], searchQuery: '' }]);
                }
            } catch (error) {
                console.error("Error fetching meals:", error);
                setMealCards([{ id: Date.now(), category: '아침', foods: [], searchQuery: '' }]);
            }
        };
        fetchMeals();
    }, [userId, selectedDate]);
    
    useEffect(() => {
        cardRefs.current = new Map();
        mealCards.forEach(card => {
            cardRefs.current.set(card.id, React.createRef());
        });
    }, [mealCards]);

    useEffect(() => {
        const totals = { calories: 0, carbs: 0, protein: 0, fat: 0 };
        mealCards.forEach(card => {
            card.foods.forEach(food => {
                totals.calories += (food.calories || 0) * (food.qty || 1);
                totals.carbs += (food.carbs || 0) * (food.qty || 1);
                totals.protein += (food.protein || 0) * (food.qty || 1);
                totals.fat += (food.fat || 0) * (food.qty || 1);
            });
        });
        setDietTotals(totals);
        if (mealCards.length > 0) {
            debouncedSave(mealCards);
        }
    }, [mealCards, setDietTotals, debouncedSave]);

    const searchFoods = useCallback(debounce(async (query) => {
        if (query.length > 0 && activeSearchInputRef.current) {
            try {
                const res = await fetch(`http://localhost:3001/api/foods?search=${encodeURIComponent(query)}`);
                const matches = await res.json();
                
                const rect = activeSearchInputRef.current.getBoundingClientRect();
                setPortalPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                });
                setPortalResults(matches);
            } catch (error) {
                console.error("Error searching food:", error);
                setPortalResults([]);
            }
        } else {
            setPortalResults([]);
        }
    }, 300), []);

    const handleSearchChange = (cardId, query) => {
        setMealCards(cards => cards.map(card => card.id === cardId ? { ...card, searchQuery: query } : card));
        setActiveCardId(cardId); // Ensure active card is set
        searchFoods(query);
    };

    const handleSearchFocus = (e, cardId) => {
        activeSearchInputRef.current = e.target;
        setActiveCardId(cardId);
        // If there's already a query, trigger a search immediately on focus
        const card = mealCards.find(c => c.id === cardId);
        if (card && card.searchQuery) {
            handleSearchChange(cardId, card.searchQuery);
        }
    };
    
    const addFoodToCard = (food) => {
        if (activeCardId) {
            setMealCards(cards => cards.map(card => {
                if (card.id === activeCardId) {
                    const newFoods = [...card.foods, { ...food, qty: 1, id: Date.now() }];
                    return { ...card, foods: newFoods, searchQuery: '' };
                }
                return card;
            }));
        }
        setPortalResults([]);
        setPortalPosition(null);
        if (activeSearchInputRef.current) {
            activeSearchInputRef.current.value = '';
        }
        activeSearchInputRef.current = null;
    };

    const addMealCard = () => {
        const newCard = { id: Date.now(), category: '점심', foods: [], searchQuery: '' };
        setMealCards(prev => [...prev, newCard]);
        setTimeout(() => {
            containerRef.current?.scrollTo({ left: containerRef.current.scrollWidth, behavior: 'smooth' });
        }, 100);
    };
    
    const handleCategoryChange = (cardId, newCategory) => {
        setMealCards(cards => cards.map(card => card.id === cardId ? { ...card, category: newCategory } : card));
        setOpenMenuCardId(null);
    };

    const handleCardClick = (cardId) => {
        const cardRef = cardRefs.current.get(cardId);
        if (cardRef?.current) {
            cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

     const deleteMealCard = (cardId) => {
        if (mealCards.length > 1) {
            setMealCards(mealCards.filter(card => card.id !== cardId));
        } else {
            alert('마지막 식단 칸은 삭제할 수 없습니다.');
        }
    };

     const removeFoodFromCard = (cardId, foodId) => {
        setMealCards(cards => cards.map(card => card.id === cardId ? { ...card, foods: card.foods.filter(f => f.id !== foodId) } : card));
    };
    
    const updateFoodQty = (cardId, foodId, qty) => {
        setMealCards(cards => cards.map(card => {
            if (card.id === cardId) {
                const newFoods = card.foods.map(food => food.id === foodId ? { ...food, qty: parseFloat(qty) || 1 } : food);
                return { ...card, foods: newFoods };
            }
            return card;
        }));
    };
    
    return (
        <>
            <AutocompletePortal 
                results={portalResults} 
                position={portalPosition} 
                onSelect={addFoodToCard}
                containerRef={containerRef}
            />
            <div className="dashboard-section">
                <div className="section-header">
                    <h3>식단 칼로리</h3>
                     <button className="add-card-btn" onClick={addMealCard}>+</button>
                </div>
                <div id="meal-cards-container" ref={containerRef} className="section-content horizontal-scroll">
                    {mealCards.map((card) => (
                        <div 
                            key={card.id} 
                            className="meal-card"
                            ref={cardRefs.current.get(card.id)}
                            onClick={() => handleCardClick(card.id)}
                        >
                             <div className="meal-card-header">
                                 <div className="meal-card-title-container" onClick={(e) => e.stopPropagation()}>
                                    <button className="meal-card-title-btn" onClick={() => setOpenMenuCardId(card.id)}>
                                        {card.category} <span>▾</span>
                                    </button>
                                    {openMenuCardId === card.id && (
                                        <CategoryMenu 
                                            cardId={card.id}
                                            onSelect={handleCategoryChange}
                                            onClose={() => setOpenMenuCardId(null)}
                                        />
                                    )}
                                </div>
                                <button className="delete-meal-card-btn" onClick={(e) => { e.stopPropagation(); deleteMealCard(card.id); }}>X</button>
                            </div>
                            <div className="meal-card-body" onClick={(e) => e.stopPropagation()}>
                                <ul className="food-list">
                                    {card.foods.map((food) => (
                                        <li key={food.id}>
                                            <span className="food-name">{food.name}</span>
                                            <input 
                                                className="food-qty" type="number" value={food.qty} min="0.1" step="0.1" 
                                                onChange={(e) => updateFoodQty(card.id, food.id, e.target.value)}
                                            />
                                            <span className="food-cal">{Math.round((food.calories || 0) * (food.qty || 1))} kcal</span>
                                            <button className="remove-food-btn" onClick={() => removeFoodFromCard(card.id, food.id)}>x</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="food-search-wrapper">
                                    <input 
                                        type="text" 
                                        className="food-search-input" 
                                        placeholder="음식 검색..."
                                        value={card.searchQuery}
                                        onFocus={(e) => handleSearchFocus(e, card.id)}
                                        onChange={(e) => handleSearchChange(card.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                            <div className="meal-card-footer">
                                <span>총: <span className="meal-card-total-calories">{Math.round(card.foods.reduce((acc, food) => acc + (food.calories || 0) * (food.qty || 1), 0))}</span> kcal</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Diet;
