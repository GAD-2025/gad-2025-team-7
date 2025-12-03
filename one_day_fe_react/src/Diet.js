import React, { useState, useEffect, useRef } from 'react';

const Diet = ({ setDietTotals, userId, selectedDate }) => {
    const [mealCards, setMealCards] = useState([]); // Initialize as empty, will be loaded from backend
    const [foodDatabase, setFoodDatabase] = useState([]);

    const saveMeals = async (currentMealCards) => {
        if (!userId || !selectedDate) return;
        try {
            const res = await fetch('http://localhost:3000/api/meals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, date: selectedDate, mealCards: currentMealCards }),
            });
            if (!res.ok) {
                console.error('Failed to save meals to backend');
            }
        } catch (error) {
            console.error('Error saving meals:', error);
        }
    };

    useEffect(() => {
        // Initialize food database
        const db = [
            // 한식 (Korean Food) - 주식류
            { name: '흰 쌀밥 (한 공기)', calories: 313, carbs: 68.7, protein: 5.9, fat: 0.5 },
            { name: '현미밥 (한 공기)', calories: 321, carbs: 71.0, protein: 6.5, fat: 1.0 },
            { name: '보리밥 (한 공기)', calories: 290, carbs: 64.0, protein: 6.0, fat: 0.8 },
            { name: '잡곡밥 (한 공기)', calories: 300, carbs: 65.0, protein: 6.5, fat: 1.2 },
            { name: '김치볶음밥 (1인분)', calories: 600, carbs: 70.0, protein: 15.0, fat: 30.0 },
            { name: '비빔밥 (1인분)', calories: 599, carbs: 90.0, protein: 25.0, fat: 18.0 },
            { name: '죽 (쌀죽, 1인분)', calories: 150, carbs: 30.0, protein: 3.0, fat: 1.0 },
            // 한식 (Korean Food) - 국/찌개류
            { name: '김치찌개 (1인분)', calories: 463, carbs: 9.3, protein: 20.1, fat: 34.6 },
            { name: '된장찌개 (1인분)', calories: 202, carbs: 12.0, protein: 14.5, fat: 9.2 },
            { name: '순두부찌개 (1인분)', calories: 250, carbs: 8.0, protein: 18.0, fat: 15.0 },
            { name: '미역국 (1인분)', calories: 93, carbs: 7.0, protein: 5.0, fat: 5.0 },
            { name: '갈비탕 (1인분)', calories: 550, carbs: 10.0, protein: 40.0, fat: 38.0 },
            { name: '설렁탕 (1인분)', calories: 400, carbs: 5.0, protein: 35.0, fat: 25.0 },
            { name: '삼계탕 (1인분)', calories: 900, carbs: 15.0, protein: 60.0, fat: 65.0 },
            // 한식 (Korean Food) - 반찬류
            { name: '불고기 (1인분)', calories: 471, carbs: 20.0, protein: 35.0, fat: 28.0 },
            { name: '제육볶음 (1인분)', calories: 550, carbs: 25.0, protein: 40.0, fat: 35.0 },
            { name: '갈비찜 (1인분)', calories: 580, carbs: 30.0, protein: 45.0, fat: 30.0 },
            { name: '삼겹살 (1인분, 200g)', calories: 660, carbs: 0, protein: 34.0, fat: 58.0 },
            { name: '닭갈비 (1인분)', calories: 600, carbs: 40.0, protein: 50.0, fat: 25.0 },
            { name: '잡채 (1접시)', calories: 291, carbs: 35.0, protein: 8.0, fat: 12.0 },
            { name: '계란찜 (1인분)', calories: 120, carbs: 3.0, protein: 10.0, fat: 8.0 },
            { name: '배추김치 (100g)', calories: 29, carbs: 4.0, protein: 2.0, fat: 0.5 },
            { name: '깍두기 (100g)', calories: 30, carbs: 5.0, protein: 1.5, fat: 0.3 },
            { name: '콩나물무침 (100g)', calories: 50, carbs: 5.0, protein: 4.0, fat: 2.0 },
            // 한식 (Korean Food) - 간식/분식
            { name: '떡볶이 (1인분)', calories: 300, carbs: 50.0, protein: 10.0, fat: 8.0 },
            { name: '김밥 (1줄)', calories: 480, carbs: 60.0, protein: 15.0, fat: 20.0 },
            { name: '튀김 (3개)', calories: 350, carbs: 30.0, protein: 10.0, fat: 20.0 },
            { name: '순대 (1인분)', calories: 400, carbs: 40.0, protein: 20.0, fat: 18.0 },
            
            // 양식 (Western Food)
            { name: '토마토 스파게티', calories: 650, carbs: 80.0, protein: 25.0, fat: 25.0 },
            { name: '크림 파스타', calories: 800, carbs: 70.0, protein: 20.0, fat: 45.0 },
            { name: '피자 (1조각)', calories: 285, carbs: 36.0, protein: 12.0, fat: 10.0 },
            { name: '치즈버거', calories: 303, carbs: 28.0, protein: 15.0, fat: 15.0 },
            { name: '감자튀김 (M)', calories: 380, carbs: 48.0, protein: 4.0, fat: 20.0 },
            { name: '시저 샐러드', calories: 481, carbs: 15.0, protein: 20.0, fat: 40.0 },
            { name: '스테이크 (200g)', calories: 500, carbs: 0, protein: 50.0, fat: 35.0 },
            { name: '돈까스', calories: 576, carbs: 40.0, protein: 25.0, fat: 35.0 },
            { name: '샌드위치 (클럽)', calories: 500, carbs: 40.0, protein: 30.0, fat: 25.0 },

            // 중식 (Chinese Food)
            { name: '짜장면', calories: 797, carbs: 136.0, protein: 23.0, fat: 17.0 },
            { name: '짬뽕', calories: 788, carbs: 95.0, protein: 36.0, fat: 30.0 },
            { name: '탕수육 (1인분)', calories: 481, carbs: 45.0, protein: 25.0, fat: 20.0 },
            { name: '마파두부', calories: 230, carbs: 15.0, protein: 18.0, fat: 12.0 },
            { name: '볶음밥', calories: 650, carbs: 80.0, protein: 20.0, fat: 30.0 },

            // 일식 (Japanese Food)
            { name: '초밥 (1개, 평균)', calories: 50, carbs: 8.0, protein: 3.0, fat: 1.0 },
            { name: '회 (1점, 평균)', calories: 20, carbs: 0, protein: 4.0, fat: 0.5 },
            { name: '우동', calories: 569, carbs: 90.0, protein: 15.0, fat: 15.0 },
            { name: '라멘', calories: 436, carbs: 50.0, protein: 20.0, fat: 18.0 },
            { name: '돈부리', calories: 700, carbs: 90.0, protein: 35.0, fat: 25.0 },

            // 닭고기 (Chicken)
            { name: '닭가슴살 (100g)', calories: 165, carbs: 0, protein: 31, fat: 3.6 },
            { name: '후라이드 치킨 (1조각)', calories: 290, carbs: 12, protein: 20, fat: 17 },
            { name: '양념 치킨 (1조각)', calories: 350, carbs: 20, protein: 22, fat: 20 },
            { name: '구운 닭다리', calories: 215, carbs: 0, protein: 28, fat: 12 },
            
            // 과일 (Fruits)
            { name: '사과 (1개)', calories: 95, carbs: 25, protein: 0.5, fat: 0.3 },
            { name: '바나나 (1개)', calories: 105, carbs: 27, protein: 1.3, fat: 0.4 },
            { name: '오렌지 (1개)', calories: 62, carbs: 15, protein: 1.2, fat: 0.2 },
            { name: '딸기 (100g)', calories: 32, carbs: 7.7, protein: 0.7, fat: 0.3 },
            { name: '포도 (100g)', calories: 69, carbs: 18.1, protein: 0.6, fat: 0.2 },
            { name: '수박 (100g)', calories: 30, carbs: 7.6, protein: 0.6, fat: 0.2 },
            { name: '토마토 (1개)', calories: 22, carbs: 4.8, protein: 1.1, fat: 0.2 },
            { name: '배 (1개)', calories: 100, carbs: 26.0, protein: 0.6, fat: 0.2 },

            // 채소 (Vegetables)
            { name: '오이 (1개)', calories: 45, carbs: 10.0, protein: 2.0, fat: 0.5 },
            { name: '당근 (1개)', calories: 41, carbs: 9.6, protein: 0.9, fat: 0.2 },
            { name: '양상추 (100g)', calories: 15, carbs: 2.9, protein: 1.4, fat: 0.2 },
            { name: '파프리카 (1개)', calories: 31, carbs: 6.0, protein: 1.0, fat: 0.3 },
            { name: '브로콜리 (100g)', calories: 55, carbs: 11.2, protein: 3.7, fat: 0.6 },
            { name: '양파 (1개)', calories: 40, carbs: 9.3, protein: 1.1, fat: 0.1 },
            { name: '시금치 (100g)', calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4 },

            // 음료 (Beverages)
            { name: '물', calories: 0, carbs: 0, protein: 0, fat: 0 },
            { name: '아메리카노', calories: 5, carbs: 0, protein: 0.5, fat: 0 },
            { name: '카페 라떼', calories: 180, carbs: 15.0, protein: 10.0, fat: 9.0 },
            { name: '콜라 (1캔)', calories: 140, carbs: 38.0, protein: 0, fat: 0 },
            { name: '오렌지 주스 (1잔)', calories: 112, carbs: 26.0, protein: 1.7, fat: 0.3 },
            { name: '녹차', calories: 0, carbs: 0, protein: 0, fat: 0 },

            // 간식 (Snacks)
            { name: '감자칩 (1봉지)', calories: 536, carbs: 50.0, protein: 6.0, fat: 35.0 },
            { name: '초콜릿 (100g)', calories: 546, carbs: 60.0, protein: 5.0, fat: 30.0 },
            { name: '아이스크림 (1컵)', calories: 207, carbs: 25.0, protein: 3.0, fat: 10.0 },
            { name: '프로틴바', calories: 200, carbs: 20.0, protein: 20.0, fat: 8.0 },
            { name: '도넛 (1개)', calories: 250, carbs: 30.0, protein: 3.0, fat: 13.0 },
            { name: '쿠키 (1개)', calories: 80, carbs: 10.0, protein: 1.0, fat: 4.0 },
            { name: '팝콘 (M)', calories: 350, carbs: 40.0, protein: 5.0, fat: 20.0 }
        ];
        setFoodDatabase(db);

        const fetchMeals = async () => {
            if (!userId || !selectedDate) return;
            try {
                const res = await fetch(`http://localhost:3000/api/meals/${userId}/${selectedDate}`);
                const data = await res.json();
                if (data && data.length > 0) {
                    setMealCards(data);
                } else {
                    setMealCards([{ id: 1, category: '아침', foods: [], searchQuery: '', searchResults: [] }]);
                }
            } catch (error) {
                console.error("Error fetching meals:", error);
                setMealCards([{ id: 1, category: '아침', foods: [], searchQuery: '', searchResults: [] }]);
            }
        };

        fetchMeals();
    }, [userId, selectedDate]);

    // Save meals whenever mealCards changes (after initial load)
    const isMounted = useRef(false);
    useEffect(() => {
        if (isMounted.current) {
            saveMeals(mealCards);
        } else {
            isMounted.current = true;
        }
    }, [mealCards, saveMeals]);

    useEffect(() => {
        const totals = { calories: 0, carbs: 0, protein: 0, fat: 0 };
        mealCards.forEach(card => {
            card.foods.forEach(food => {
                totals.calories += food.calories * food.qty;
                totals.carbs += food.carbs * food.qty;
                totals.protein += food.protein * food.qty;
                totals.fat += food.fat * food.qty;
            });
        });
        setDietTotals(totals);
    }, [mealCards, setDietTotals]);

    const addMealCard = () => {
        setMealCards([...mealCards, { id: Date.now(), category: '점심', foods: [], searchQuery: '', searchResults: [] }]);
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
                const newCard = { ...card, foods: [...card.foods, { ...food, qty: 1 }], searchQuery: '', searchResults: [] };
                return newCard;
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

    const handleSearchChange = (cardId, query) => {
        setMealCards(mealCards.map(card => {
            if (card.id === cardId) {
                if (query.length > 0) {
                    const matches = foodDatabase.filter(food => food.name.toLowerCase().includes(query.toLowerCase()));
                    return { ...card, searchQuery: query, searchResults: matches };
                } else {
                    return { ...card, searchQuery: query, searchResults: [] };
                }
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
                                    value={card.searchQuery}
                                    onChange={(e) => handleSearchChange(card.id, e.target.value)}
                                />
                                {card.searchResults.length > 0 && (
                                    <div className="autocomplete-results">
                                        {card.searchResults.map(food => (
                                            <div 
                                                key={food.name} 
                                                onClick={() => addFoodToCard(card.id, food)}
                                            >
                                                {food.name} ({food.calories}kcal)
                                            </div>
                                        ))}
                                    </div>
                                )}
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
