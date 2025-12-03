import React, { useState, useEffect } from 'react';

const Diet = ({ setTotalCalories }) => {
    const [mealCards, setMealCards] = useState([{ id: 1, category: '아침', foods: [] }]);
    const [foodDatabase, setFoodDatabase] = useState([]);

    useEffect(() => {
        // Mock food database
        const db = [
            { name: '흰 쌀밥 (한 공기)', calories: 313, carbs: 68.7, protein: 5.9, fat: 0.5 },
            { name: '김치찌개 (1인분)', calories: 463, carbs: 9.3, protein: 20.1, fat: 34.6 },
            { name: '닭가슴살 (100g)', calories: 165, carbs: 0, protein: 31, fat: 3.6 },
        ];
        setFoodDatabase(db);
    }, []);

    useEffect(() => {
        let total = 0;
        mealCards.forEach(card => {
            card.foods.forEach(food => {
                total += food.calories * food.qty;
            });
        });
        setTotalCalories(total);
    }, [mealCards, setTotalCalories]);

    const addMealCard = () => {
        setMealCards([...mealCards, { id: Date.now(), category: '점심', foods: [] }]);
    };

    const deleteMealCard = (cardId) => {
        if (mealCards.length > 1) {
            setMealCards(mealCards.filter(card => card.id !== cardId));
        } else {
            alert('마지막 식단 칸은 삭제할 수 없습니다.');
        }
    };

    const addFoodToCard = (cardId, food) => {
        setMealCards(mealCards.map(card => {
            if (card.id === cardId) {
                return { ...card, foods: [...card.foods, { ...food, qty: 1 }] };
            }
            return card;
        }));
    };

    const removeFoodFromCard = (cardId, foodName) => {
        setMealCards(mealCards.map(card => {
            if (card.id === cardId) {
                return { ...card, foods: card.foods.filter(food => food.name !== foodName) };
            }
            return card;
        }));
    };

    const updateFoodQty = (cardId, foodName, qty) => {
        setMealCards(mealCards.map(card => {
            if (card.id === cardId) {
                return {
                    ...card,
                    foods: card.foods.map(food => {
                        if (food.name === foodName) {
                            return { ...food, qty };
                        }
                        return food;
                    })
                };
            }
            return card;
        }));
    };

    return (
        <div className="dashboard-section">
            <div className="section-header">
                <h3>식단 칼로리</h3>
            </div>
            <div id="meal-cards-container" className="section-content horizontal-scroll">
                {mealCards.map(card => (
                    <div key={card.id} className="meal-card">
                        <div className="meal-card-header">
                            <h4 className="meal-card-title" data-category={card.category}>{card.category}</h4>
                            <div className="meal-card-actions">
                                <button className="add-sibling-btn" onClick={addMealCard}>+</button>
                                <button className="delete-meal-card-btn" onClick={() => deleteMealCard(card.id)}>X</button>
                            </div>
                        </div>
                        <div className="meal-card-body">
                            <ul className="food-list">
                                {card.foods.map(food => (
                                    <li key={food.name}>
                                        <span className="food-name">{food.name}</span>
                                        <input 
                                            className="food-qty" 
                                            type="number" 
                                            value={food.qty} 
                                            min="0.1" 
                                            step="0.1" 
                                            onChange={(e) => updateFoodQty(card.id, food.name, parseFloat(e.target.value))}
                                        />
                                        <span className="food-cal">{food.calories * food.qty} kcal</span>
                                        <button className="remove-food-btn" onClick={() => removeFoodFromCard(card.id, food.name)}>x</button>
                                    </li>
                                ))}
                            </ul>
                            <div className="food-search-wrapper">
                                <input 
                                    type="text" 
                                    className="food-search-input" 
                                    placeholder="음식 검색..." 
                                    onInput={(e) => {
                                        const query = e.target.value.toLowerCase();
                                        const resultsContainer = e.target.nextElementSibling;
                                        resultsContainer.innerHTML = '';
                                        if (query.length > 0) {
                                            const matches = foodDatabase.filter(food => food.name.toLowerCase().includes(query));
                                            matches.forEach(food => {
                                                const div = document.createElement('div');
                                                div.textContent = `${food.name} (${food.calories}kcal)`;
                                                div.onclick = () => {
                                                    addFoodToCard(card.id, food);
                                                    e.target.value = '';
                                                    resultsContainer.innerHTML = '';
                                                };
                                                resultsContainer.appendChild(div);
                                            });
                                        }
                                    }}
                                />
                                <div className="autocomplete-results"></div>
                            </div>
                        </div>
                        <div className="meal-card-footer">
                            <span>총 칼로리: <span className="meal-card-total-calories">{card.foods.reduce((acc, food) => acc + food.calories * food.qty, 0)}</span> kcal</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Diet;
