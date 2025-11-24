document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('stopwatch-card-container');

    function getStopwatchRecords() {
        const records = localStorage.getItem('stopwatchRecords');
        return records ? JSON.parse(records) : {};
    }

    function renderAllCards() {
        const recordsByDate = getStopwatchRecords();
        cardContainer.innerHTML = '';

        const dates = Object.keys(recordsByDate).sort((a, b) => new Date(b) - new Date(a));

        if (dates.length === 0) {
            cardContainer.innerHTML = '<p>저장된 스톱워치 기록이 없습니다.</p>';
            return;
        }

        dates.forEach(date => {
            const card = createStopwatchCard(date, recordsByDate[date]);
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

    renderAllCards();
});
