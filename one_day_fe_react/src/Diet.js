import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useData } from './DataContext'; // Import the new hook

// --- Helper Components (These can remain as they are, they are stateless UI) ---

const AutocompletePortal = ({ results, position, onSelect }) => {
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

    React.useEffect(() => {
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

// --- Main Diet Component (Refactored) ---

const Diet = () => {
    // Get state and functions from the context
    const { 
        mealCards,
        addMealCard,
        deleteMealCard,
        handleCategoryChange,
        addFoodToCard,
        removeFoodFromCard,
        updateFoodQty,
        setSearchQuery
    } = useData();

    // Local UI state can remain here
    const [openMenuCardId, setOpenMenuCardId] = useState(null);
    const [portalResults, setPortalResults] = useState([]);
    const [portalPosition, setPortalPosition] = useState(null);
    const [activeCardId, setActiveCardId] = useState(null);
    
    // Refs for DOM elements
    const activeSearchInputRef = useRef(null);
    const containerRef = useRef(null);

    // --- Debounced search logic (can stay in this component) ---
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

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

    // --- Event Handlers ---

    const handleSearchChange = (cardId, query) => {
        setSearchQuery(cardId, query); // Update context state
        setActiveCardId(cardId);
        searchFoods(query);
    };
    
    const handleSearchFocus = (e, cardId) => {
        activeSearchInputRef.current = e.target;
        setActiveCardId(cardId);
        const card = mealCards.find(c => c.id === cardId);
        if (card && card.searchQuery) {
            handleSearchChange(cardId, card.searchQuery);
        }
    };
    
    const handleAddFood = (food) => {
        if (activeCardId) {
            addFoodToCard(activeCardId, food); // Call context function
        }
        setPortalResults([]);
        setPortalPosition(null);
        if (activeSearchInputRef.current) {
            activeSearchInputRef.current.value = '';
        }
        activeSearchInputRef.current = null;
    };
    
    const handleAddMealCard = () => {
        addMealCard();
        setTimeout(() => {
            containerRef.current?.scrollTo({ left: containerRef.current.scrollWidth, behavior: 'smooth' });
        }, 100);
    };

    return (
        <>
            <AutocompletePortal 
                results={portalResults} 
                position={portalPosition} 
                onSelect={handleAddFood}
            />
            <div className="dashboard-section">
                <div className="section-header">
                    <h3>식단 칼로리</h3>
                     <button className="add-card-btn" onClick={handleAddMealCard}>+</button>
                </div>
                <div id="meal-cards-container" ref={containerRef} className="section-content horizontal-scroll">
                    {mealCards.map((card) => (
                        <div 
                            key={card.id} 
                            className="meal-card"
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