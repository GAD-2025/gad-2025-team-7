// One_Day/healthcare.js

document.addEventListener('DOMContentLoaded', () => {
    // --- All Element Selectors ---
    const editCycleBtn = document.getElementById('edit-cycle-btn');
    const cycleEditModal = document.getElementById('cycle-edit-modal');
    const closeCycleModalBtn = document.getElementById('close-cycle-modal-btn');
    const saveCycleRecordBtn = document.getElementById('save-cycle-record-btn');
    const cycleStartDateInput = document.getElementById('cycle-start-date');
    const cycleEndDateInput = document.getElementById('cycle-end-date');
    const pastCyclesList = document.getElementById('past-cycles-list');
    const dDayDisplay = document.querySelector('.d-day-display');
    const predictedStartDateSpan = document.getElementById('predicted-start-date');
    const predictedEndDateSpan = document.getElementById('predicted-end-date');

    const stepCountDisplay = document.getElementById('step-count');
    const pedometerControls = document.querySelector('.pedometer-controls');
    const addStepsBtn = document.getElementById('add-steps-btn');
    const resetStepsBtn = document.getElementById('reset-steps-btn');
    const graphProgress = document.getElementById('graph-progress');
    const kcalRemainingSpan = document.getElementById('kcal-remaining');
    const graphPathLength = graphProgress ? graphProgress.getTotalLength() : 0;
    const graphTextLabel = document.querySelector('#graph-text');

    const mealCardsContainer = document.getElementById('meal-cards-container');
    const mealCardTemplate = document.getElementById('meal-card-template');
    const globalCategoryMenu = document.getElementById('global-meal-category-menu');
    
    const totalIntakeDisplay = document.getElementById('total-intake-display');
    const carbBar = document.getElementById('carb-bar');
    const proteinBar = document.getElementById('protein-bar');
    const fatBar = document.getElementById('fat-bar');
    const carbAmountSpan = document.getElementById('carb-amount');
    const proteinAmountSpan = document.getElementById('protein-amount');
    const fatAmountSpan = document.getElementById('fat-amount');

    // --- Expanded Mock Food Database with Macros ---
    const foodDatabase = [
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

    // --- Client-Side Data & State ---
    let cycleHistory = [];
    let currentSteps = 0;
    const recommendedCalories = 2000;
    const recommendedCarbs = 275; // Based on 2000kcal, 55%
    const recommendedProtein = 100;  // Based on 2000kcal, 20% (4kcal/g)
    const recommendedFat = 65;    // Based on 2000kcal, 25% (9kcal/g)
    let activeMealTitle = null;

    let totalMacros = {
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0
    };

    // --- Menstrual Cycle Logic ---
    const renderCycleHistory = () => { if (!pastCyclesList) return; pastCyclesList.innerHTML = ''; if (cycleHistory.length > 0) { const list = document.createElement('ul'); const sortedHistory = [...cycleHistory].sort((a, b) => new Date(b.start_date) - new Date(a.start_date)); sortedHistory.forEach(record => { const listItem = document.createElement('li'); listItem.textContent = `${record.start_date} ~ ${record.end_date}`; list.appendChild(listItem); }); pastCyclesList.appendChild(list); } else { pastCyclesList.innerHTML = '<p>기록이 없습니다.</p>'; } };
    const calculateAndShowPrediction = () => { if (!dDayDisplay || !predictedStartDateSpan || !predictedEndDateSpan) return; if (cycleHistory.length < 2) { dDayDisplay.textContent = 'D-?'; predictedStartDateSpan.textContent = '----.--.--'; predictedEndDateSpan.textContent = '----.--.--'; return; } const sortedHistory = [...cycleHistory].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)); let cycleLengths = []; for (let i = 1; i < sortedHistory.length; i++) { cycleLengths.push(Math.ceil(Math.abs(new Date(sortedHistory[i].start_date) - new Date(sortedHistory[i - 1].start_date)) / (1000 * 60 * 60 * 24))); } const avgCycleLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length; let durations = []; sortedHistory.forEach(cycle => { durations.push(Math.ceil(Math.abs(new Date(cycle.end_date) - new Date(cycle.start_date)) / (1000 * 60 * 60 * 24)) + 1); }); const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length; const lastStartDate = new Date(sortedHistory[sortedHistory.length - 1].start_date); const predictedStartDate = new Date(new Date(lastStartDate).setDate(lastStartDate.getDate() + Math.round(avgCycleLength))); const predictedEndDate = new Date(new Date(predictedStartDate).setDate(predictedStartDate.getDate() + Math.round(avgDuration - 1))); const today = new Date(); today.setHours(0, 0, 0, 0); const dDay = Math.ceil((predictedStartDate - today) / (1000 * 60 * 60 * 24)); const formatDate = (date) => date.toISOString().split('T')[0]; dDayDisplay.textContent = dDay >= 0 ? `D-${dDay}` : `D+${Math.abs(dDay)}`; predictedStartDateSpan.textContent = formatDate(predictedStartDate); predictedEndDateSpan.textContent = formatDate(predictedEndDate); };
    if (editCycleBtn) { editCycleBtn.addEventListener('click', () => { if(cycleEditModal) cycleEditModal.style.display = 'flex'; renderCycleHistory(); }); }
    if (closeCycleModalBtn) { closeCycleModalBtn.addEventListener('click', () => { if(cycleEditModal) cycleEditModal.style.display = 'none'; }); }
    if (cycleEditModal) { cycleEditModal.addEventListener('click', (e) => { if (e.target === cycleEditModal) cycleEditModal.style.display = 'none'; }); }
    if (saveCycleRecordBtn) { saveCycleRecordBtn.addEventListener('click', () => { const startDate = cycleStartDateInput.value; const endDate = cycleEndDateInput.value; if (!startDate || !endDate) { alert('시작일과 종료일을 모두 선택해주세요.'); return; } if (new Date(startDate) > new Date(endDate)) { alert('종료일은 시작일보다 빠를 수 없습니다.'); return; } cycleHistory.push({ start_date: startDate, end_date: endDate }); alert('기록이 추가되었습니다.'); cycleStartDateInput.value = ''; cycleEndDateInput.value = ''; renderCycleHistory(); calculateAndShowPrediction(); }); }

    // --- Today's Health Logic ---
    const updateCalorieGraph = () => { if (!graphTextLabel) return; const caloriesBurned = currentSteps * 0.04; const initialExcess = totalMacros.calories - recommendedCalories; const kcalToBurn = Math.max(0, initialExcess - caloriesBurned); graphTextLabel.innerHTML = '오늘의 건강까지<br><span id="kcal-remaining">0</span>kcal'; const newKcalSpan = document.getElementById('kcal-remaining'); if(newKcalSpan) newKcalSpan.textContent = Math.round(kcalToBurn); const totalExcessToBurn = Math.max(0, initialExcess); let progressPercent = 0; if (totalExcessToBurn > 0) { const burnedAmount = totalExcessToBurn - kcalToBurn; progressPercent = Math.min(100, (burnedAmount / totalExcessToBurn) * 100); } else { progressPercent = 100; } if (graphProgress) { const offset = graphPathLength * (1 - progressPercent / 100); graphProgress.style.strokeDashoffset = offset; } };
    const updateStepCount = (newSteps) => { if(!stepCountDisplay) return; currentSteps = newSteps; stepCountDisplay.textContent = currentSteps; updateCalorieGraph(); };
    if (addStepsBtn) { addStepsBtn.addEventListener('click', () => { currentSteps += 100; updateStepCount(currentSteps); }); }
    if (resetStepsBtn) { resetStepsBtn.addEventListener('click', () => { currentSteps = 0; updateStepCount(currentSteps); }); }
    
    // --- Macronutrient Logic ---
    const updateMacroBars = () => {
        if (!totalIntakeDisplay || !carbBar || !proteinBar || !fatBar) return;
        totalIntakeDisplay.textContent = Math.round(totalMacros.calories);
        carbAmountSpan.textContent = `${Math.round(totalMacros.carbs)}g`;
        proteinAmountSpan.textContent = `${Math.round(totalMacros.protein)}g`;
        fatAmountSpan.textContent = `${Math.round(totalMacros.fat)}g`;

        const carbPercent = Math.min(100, (totalMacros.carbs / recommendedCarbs) * 100);
        const proteinPercent = Math.min(100, (totalMacros.protein / recommendedProtein) * 100);
        const fatPercent = Math.min(100, (totalMacros.fat / recommendedFat) * 100);

        carbBar.style.width = `${carbPercent}%`;
        proteinBar.style.width = `${proteinPercent}%`;
        fatBar.style.width = `${fatPercent}%`;
    };

    // --- Central Calculation Logic ---
    const calculateAllMacros = () => {
        let calories = 0, carbs = 0, protein = 0, fat = 0;
        document.querySelectorAll('.meal-card').forEach(card => {
            card.querySelectorAll('.food-list li').forEach(item => {
                const qty = parseFloat(item.querySelector('.food-qty').value) || 0;
                // Read macro data from dataset
                calories += (parseFloat(item.dataset.calories) || 0) * qty;
                carbs += (parseFloat(item.dataset.carbs) || 0) * qty;
                protein += (parseFloat(item.dataset.protein) || 0) * qty;
                fat += (parseFloat(item.dataset.fat) || 0) * qty;
            });
            const totalDisplay = card.querySelector('.meal-card-total-calories');
            if (totalDisplay) totalDisplay.textContent = Math.round(calories); 
        });
        totalMacros = { calories, carbs, protein, fat };
        updateCalorieGraph();
        updateMacroBars();
    };

    // --- Diet Calories Event Listeners (Refactored for robustness) ---
    // Function to initialize event listeners for a single meal card
    const initializeMealCard = (cardElement) => {
        const searchInput = cardElement.querySelector('.food-search-input');
        const resultsContainer = cardElement.querySelector('.autocomplete-results');
        const mealCardTitle = cardElement.querySelector('.meal-card-title');
        const addSiblingBtn = cardElement.querySelector('.add-sibling-btn');
        const deleteBtn = cardElement.querySelector('.delete-meal-card-btn');
        const foodList = cardElement.querySelector('.food-list');

        // Autocomplete search input
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                resultsContainer.innerHTML = ''; // Clear previous results
                if (query.length > 0) {
                    const matches = foodDatabase.filter(food => food.name.toLowerCase().includes(query));
                    matches.forEach(food => {
                        const div = document.createElement('div');
                        div.textContent = `${food.name} (${food.calories}kcal)`;
                        // Store all food data in dataset for easy retrieval
                        div.dataset.name = food.name;
                        div.dataset.calories = food.calories;
                        div.dataset.carbs = food.carbs;
                        div.dataset.protein = food.protein;
                        div.dataset.fat = food.fat;
                        resultsContainer.appendChild(div);
                    });
                    resultsContainer.style.display = matches.length > 0 ? 'block' : 'none';
                } else {
                    resultsContainer.style.display = 'none';
                }
            });
            // Hide results when input loses focus (with a slight delay to allow click on results)
            searchInput.addEventListener('blur', () => {
                setTimeout(() => resultsContainer.style.display = 'none', 100);
            });
            searchInput.addEventListener('focus', () => {
                // Re-show results if there's content in input
                if (searchInput.value.length > 0 && resultsContainer.children.length > 0) {
                    resultsContainer.style.display = 'block';
                }
            });
        }

        // Click on autocomplete result
        if (resultsContainer) {
            resultsContainer.addEventListener('click', (e) => {
                const target = e.target;
                if (target.tagName === 'DIV' && target.dataset.name) { // Clicked on a food item
                    const li = document.createElement('li');
                    // Read all data from the clicked div's dataset
                    li.dataset.name = target.dataset.name;
                    li.dataset.calories = target.dataset.calories;
                    li.dataset.carbs = target.dataset.carbs;
                    li.dataset.protein = target.dataset.protein;
                    li.dataset.fat = target.dataset.fat;
                    
                    li.innerHTML = `
                        <span class="food-name">${target.dataset.name}</span>
                        <input class="food-qty" type="number" value="1" min="0.1" step="0.1">
                        <span class="food-cal">${target.dataset.calories} kcal</span>
                        <button class="remove-food-btn">x</button>
                    `;
                    foodList.appendChild(li);

                    searchInput.value = '';
                    resultsContainer.innerHTML = '';
                    resultsContainer.style.display = 'none';
                    calculateAllMacros();
                }
            });
        }

        // Quantity input change
        if (foodList) {
            foodList.addEventListener('input', (e) => {
                if (e.target.classList.contains('food-qty')) {
                    calculateAllMacros();
                }
            });
            // Remove food button
            foodList.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-food-btn')) {
                    e.target.closest('li').remove();
                    calculateAllMacros();
                }
            });
        }
        
        // Meal card title click (category menu)
        if (mealCardTitle) {
            mealCardTitle.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent document click from closing it immediately
                activeMealTitle = mealCardTitle;
                const titleRect = mealCardTitle.getBoundingClientRect();
                globalCategoryMenu.style.left = `${titleRect.left}px`;
                globalCategoryMenu.style.top = `${titleRect.bottom + 5}px`;
                globalCategoryMenu.style.display = 'flex';
            });
        }

        // Add sibling card button
        if (addSiblingBtn) {
            addSiblingBtn.addEventListener('click', () => {
                const newCardNode = mealCardTemplate.content.cloneNode(true);
                const newCardElement = newCardNode.firstElementChild;
                cardElement.insertAdjacentElement('afterend', newCardElement);
                initializeMealCard(newCardElement); // Initialize new card's listeners
                newCardElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                calculateAllMacros(); // Recalculate if a card is added/removed
            });
        }

        // Delete card button
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (mealCardsContainer.querySelectorAll('.meal-card').length > 1) {
                    cardElement.remove();
                    calculateAllMacros(); // Recalculate if a card is added/removed
                } else {
                    alert('마지막 식단 칸은 삭제할 수 없습니다.');
                }
            });
        }

        // Click on card body/header (but not buttons/inputs) to center it
        cardElement.addEventListener('click', (e) => {
            const target = e.target;
            // Only scroll if clicked directly on the card or header, not inside input/button
            if (!target.closest('button') && !target.closest('input') && !target.closest('.meal-category-menu')) {
                cardElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        });

        calculateAllMacros(); // Initial calculation for this card
    };

    // --- Initialize all default meal cards ---
    if (mealCardsContainer) {
        mealCardsContainer.querySelectorAll('.meal-card').forEach(initializeMealCard);
        
        // Center the initial card after a small delay to ensure layout is stable
        const centerInitialCard = () => {
            const firstCard = mealCardsContainer.querySelector('.meal-card');
            if (firstCard) {
                firstCard.scrollIntoView({ inline: 'center', block: 'nearest' });
            }
        };
        setTimeout(centerInitialCard, 50);
    }


    // --- Global Category Menu Logic ---
    if (globalCategoryMenu) {
        globalCategoryMenu.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'BUTTON' && activeMealTitle) {
                activeMealTitle.textContent = target.dataset.category;
                activeMealTitle.dataset.category = target.dataset.category;
                globalCategoryMenu.style.display = 'none';
                activeMealTitle = null;
            }
        });
    }
    // Global click listener to hide the menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        // Hide if menu is open and click is not on a meal-card-title or inside the menu itself
        if (globalCategoryMenu && globalCategoryMenu.style.display === 'flex' && 
            !e.target.closest('.meal-card-title') && !e.target.closest('#global-meal-category-menu')) {
            globalCategoryMenu.style.display = 'none';
            activeMealTitle = null;
        }
    });

    // --- Initial Global Load Calls ---
    calculateAndShowPrediction();
    updateStepCount(currentSteps);
    // Initial macro calculation is done within initializeMealCard for each card
    // Call calculateAllMacros once more to ensure global totals are updated after all cards are initialized
    calculateAllMacros(); 
});
