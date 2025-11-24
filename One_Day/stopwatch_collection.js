document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('stopwatch-card-container');
    const periodTabs = document.querySelectorAll('.period-tab');
    const categoryChartCanvas = document.getElementById('categoryChart');
    let categoryChart; // To hold the Chart.js instance

    // Define a color palette for categories
    const categoryColors = {
        '공부': '#FF7581', // Primary color
        '운동': '#87CEEB', // Light Sky Blue
        '취미': '#90EE90', // Light Green
        '알바': '#DDA0DD', // Plum
        '기타': '#FFD700', // Gold
        // Add more colors for other categories if needed
        'default': '#CCCCCC' // Grey for unknown categories
    };

    // --- Date Utility Functions ---
    function getStartOfDay(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function getEndOfDay(date) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay(); // Sunday - Saturday : 0 - 6
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function getEndOfWeek(date) {
        const d = new Date(getStartOfWeek(date));
        d.setDate(d.getDate() + 6);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    function getStartOfMonth(date) {
        const d = new Date(date);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function getEndOfMonth(date) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + 1, 0); // Set to last day of current month
        d.setHours(23, 59, 59, 999);
        return d;
    }

    function getStartOfYear(date) {
        const d = new Date(date);
        d.setMonth(0, 1); // January 1st
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function getEndOfYear(date) {
        const d = new Date(date);
        d.setMonth(11, 31); // December 31st
        d.setHours(23, 59, 59, 999);
        return d;
    }

    // --- Data Loading and Filtering ---
    function getStopwatchRecords() {
        const records = localStorage.getItem('stopwatchRecords');
        return records ? JSON.parse(records) : {};
    }

    function filterRecordsByPeriod(records, period) {
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case 'day':
                startDate = getStartOfDay(now);
                endDate = getEndOfDay(now);
                break;
            case 'week':
                startDate = getStartOfWeek(now);
                endDate = getEndOfWeek(now);
                break;
            case 'month':
                startDate = getStartOfMonth(now);
                endDate = getEndOfMonth(now);
                break;
            case 'year':
                startDate = getStartOfYear(now);
                endDate = getEndOfYear(now);
                break;
            default:
                return records; // No filtering
        }

        const filteredRecords = {};
        for (const dateStr in records) {
            const recordDate = new Date(dateStr);
            if (recordDate >= startDate && recordDate <= endDate) {
                filteredRecords[dateStr] = records[dateStr];
            }
        }
        return filteredRecords;
    }

    function aggregateRecordsByCategory(records) {
        const categoryTotals = {}; // { 'category': totalMilliseconds }

        for (const dateStr in records) {
            records[dateStr].forEach(record => {
                const category = record.label;
                const timeParts = record.time.split(':').map(Number);
                const durationMs = (timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]) * 1000;

                if (categoryTotals[category]) {
                    categoryTotals[category] += durationMs;
                } else {
                    categoryTotals[category] = durationMs;
                }
            });
        }
        return categoryTotals;
    }

    function formatMillisecondsToHMS(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}시간 ${minutes}분 ${seconds}초`;
    }

    // --- Chart.js Initialization and Update ---
    function initializeChart(data) {
        const labels = Object.keys(data);
        const values = Object.values(data);
        const backgroundColors = labels.map(label => categoryColors[label] || categoryColors['default']);

        categoryChart = new Chart(categoryChartCanvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: '카테고리별 누적 시간'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                if (label) {
                                    let sum = 0;
                                    let dataArr = context.dataset.data;
                                    dataArr.map(data => {
                                        sum += data;
                                    });
                                    let percentage = (context.parsed * 100 / sum).toFixed(2) + '%';
                                    return label + ': ' + formatMillisecondsToHMS(context.parsed) + ' (' + percentage + ')';
                                }
                                return '';
                            }
                        }
                    }
                }
            }
        });
    }

    function updateChart(data) {
        if (categoryChart) {
            categoryChart.data.labels = Object.keys(data);
            categoryChart.data.datasets[0].data = Object.values(data);
            categoryChart.data.datasets[0].backgroundColor = Object.keys(data).map(label => categoryColors[label] || categoryColors['default']);
            categoryChart.update();
        } else {
            initializeChart(data);
        }
    }

    // --- UI Rendering ---
    function renderAllCards(filteredRecords) {
        cardContainer.innerHTML = '';

        const dates = Object.keys(filteredRecords).sort((a, b) => new Date(b) - new Date(a));

        if (dates.length === 0) {
            cardContainer.innerHTML = '<p>선택된 기간에 스톱워치 기록이 없습니다.</p>';
            return;
        }

        dates.forEach(date => {
            const card = createStopwatchCard(date, filteredRecords[date]);
            cardContainer.appendChild(card);
        });
    }

    function createStopwatchCard(date, records) {
        const card = document.createElement('div');
        card.className = 'stopwatch-card';

        const dateDiv = document.createElement('div');
        dateDiv.className = 'date';
        dateDiv.innerText = date;
        card.appendChild(dateDiv);

        records.forEach(record => {
            const recordItem = document.createElement('div');
            recordItem.className = 'record-item';

            const labelSpan = document.createElement('span');
            labelSpan.className = 'label';
            labelSpan.innerText = record.label;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'time';
            timeSpan.innerText = record.time;

            recordItem.appendChild(labelSpan);
            recordItem.appendChild(timeSpan);
            card.appendChild(recordItem);
        });

        return card;
    }

    // --- Event Listeners ---
    periodTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            periodTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const period = tab.dataset.period;
            updateView(period);
        });
    });

    function updateView(period) {
        const allRecords = getStopwatchRecords();
        const filteredRecords = filterRecordsByPeriod(allRecords, period);
        const aggregatedData = aggregateRecordsByCategory(filteredRecords);

        updateChart(aggregatedData);
        renderAllCards(filteredRecords);
    }

    // Initial load
    updateView('day'); // Default to 'Day' view
});