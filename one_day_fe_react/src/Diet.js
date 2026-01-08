import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useData } from './DataContext';
import './Diet.css'; // Import the new CSS file

const imgPolygon4 = "https://www.figma.com/api/mcp/asset/c6b7ce0f-1bfa-4f5d-9227-19fb806c34bd";
const imgEllipse7 = "https://www.figma.com/api/mcp/asset/4906b425-206e-4d9e-9e41-81728c38cb87";
const imgRectangle240653668 = "https://www.figma.com/api/mcp/asset/6414e675-9fdd-4f75-a751-39ac75aaa291";

function X({ onClick }) {
    return (
        <button className="delete-meal-card-btn" onClick={onClick} data-name="x" data-node-id="771:2407">
            x
        </button>
    );
}

function Polygon() {
    return (
        <span className="meal-card-title-icon" data-node-id="771:2403">
            <img alt="" src={imgPolygon4} />
        </span>
    );
}

// Reverted Component back to its structural form from Figma output,
// without an onClick prop directly on its root div.
function Component() {
    return (
        <div className="add-food-icon" data-name="Component 3" data-node-id="771:2404">
            <div className="add-food-icon-plus-bg" data-node-id="771:2386">
                <div className="add-food-icon-ellipse" data-node-id="771:2387">
                    <img alt="" src={imgEllipse7} />
                </div>
                <p className="add-food-icon-plus-text" data-node-id="771:2388">
                    +
                </p>
            </div>
            <div className="add-food-icon-plus-bg bottom" data-node-id="771:2390">
                <div className="add-food-icon-ellipse" data-node-id="771:2391">
                    <img alt="" src={imgEllipse7} />
                </div>
                <p className="add-food-icon-plus-text" data-node-id="771:2392">
                    +
                </p>
            </div>
        </div>
    );
}


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
                <div key={food.id} className="autocomplete-item" onClick={() => onSelect(food)}>
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

const Diet = () => {
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

    const [openMenuCardId, setOpenMenuCardId] = useState(null);
    const [portalResults, setPortalResults] = useState([]);
    const [portalPosition, setPortalPosition] = useState(null);
    const [activeCardId, setActiveCardId] = useState(null);
    
    const activeSearchInputRef = useRef(null);
    const containerRef = useRef(null);

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
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/foods?search=${encodeURIComponent(query)}`);
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
        setSearchQuery(cardId, query);
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
            addFoodToCard(activeCardId, food);
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
                    <h3>식단 기록</h3>
                    <div className="header-actions">

                        <button className="add-card-btn" onClick={handleAddMealCard}>+</button>
                    </div>
                </div>
                <div id="meal-cards-container" ref={containerRef} className="meal-cards-wrapper">
                    {mealCards.map((card) => (
                        <div 
                            key={card.id} 
                            className="meal-card"
                            data-node-id="661:2905" // Overall meal card div
                        >
                             <div className="meal-card-header">
                                 <div className="meal-card-title-container" onClick={(e) => e.stopPropagation()} data-node-id="661:2907">
                                    <button className="meal-card-title-btn" onClick={() => setOpenMenuCardId(card.id)} data-node-id="661:2908">
                                        {card.category} <Polygon />
                                    </button>
                                    {openMenuCardId === card.id && (
                                        <CategoryMenu 
                                            cardId={card.id}
                                            onSelect={handleCategoryChange}
                                            onClose={() => setOpenMenuCardId(null)}
                                        />
                                    )}
                                </div>
                                <X onClick={(e) => { e.stopPropagation(); deleteMealCard(card.id); }} />
                            </div>
                            <div className="meal-card-body" onClick={(e) => e.stopPropagation()}>
                                <ul className="food-list">
                                    {card.foods.map((food) => (
                                        <li key={food.id} data-node-id="661:2912">
                                            <span className="food-name">{food.name}</span>
                                            <input 
                                                className="food-qty" type="number" value={food.qty} min="0.1" step="0.1" 
                                                onChange={(e) => updateFoodQty(card.id, food.id, e.target.value)}
                                                data-node-id="771:2394"
                                            />
                                            <span className="food-cal" data-node-id="771:2399">{Math.round((food.calories || 0) * (food.qty || 1))} kcal</span>
                                            <button className="remove-food-btn" onClick={() => removeFoodFromCard(card.id, food.id)}>x</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="food-search-wrapper" data-node-id="771:2383">
                                    <input
                                        type="text"
                                        className="food-search-input"
                                        placeholder="음식 검색..."
                                        value={card.searchQuery}
                                        onFocus={(e) => handleSearchFocus(e, card.id)}
                                        onChange={(e) => handleSearchChange(card.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    {/* The Figma design's plus icon is part of the search input area to add a food item */}
                                    {/* Wrapping Component in a button to handle clicks for adding food. */}

                                </div>
                            </div>
                            <div className="meal-card-footer">
                                <span>총: <span className="meal-card-total-calories" data-node-id="771:2385">{Math.round(card.foods.reduce((acc, food) => acc + (food.calories || 0) * (food.qty || 1), 0))}</span> kcal</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Diet;
