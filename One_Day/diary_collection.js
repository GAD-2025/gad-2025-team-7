document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('diary-card-container');
    let diaries = localStorage.getItem('diaries') ? JSON.parse(localStorage.getItem('diaries')) : [];

    function deleteDiary(diaryId) {
        diaries = diaries.filter(diary => diary.id !== diaryId);
        localStorage.setItem('diaries', JSON.stringify(diaries));
        renderAllCards();
    }

    function createDiaryCard(diary) {
        const card = document.createElement('div');
        card.className = 'diary-card';

        const canvasImg = document.createElement('img');
        canvasImg.className = 'diary-card-canvas';
        if (diary.canvasData) {
            canvasImg.src = diary.canvasData;
        }

        const content = document.createElement('div');
        content.className = 'diary-card-content';
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'date';
        dateDiv.innerText = diary.date;

        const titleDiv = document.createElement('h4'); // Using h4 for title
        titleDiv.innerText = diary.title || '이름 없는 다이어리';

        const textP = document.createElement('p');
        textP.className = 'text';
        textP.innerText = diary.text ? diary.text.substring(0, 150) + '...' : '(내용 없음)';
        
        content.appendChild(dateDiv);
        content.appendChild(titleDiv);
        content.appendChild(textP);

        const actions = document.createElement('div');
        actions.className = 'diary-card-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-card-btn';
        editBtn.innerText = '수정';
        editBtn.addEventListener('click', () => {
            window.location.href = `home.html?date=${diary.date}&tab=records`;
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-card-btn';
        deleteBtn.innerText = '삭제';
        deleteBtn.addEventListener('click', () => {
            if (confirm(`'${diary.title || '이름 없는 다이어리'}' 일기를 삭제하시겠습니까?`)) {
                deleteDiary(diary.id);
            }
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        card.appendChild(canvasImg);
        card.appendChild(content);
        card.appendChild(actions);

        return card;
    }

    function renderAllCards() {
        cardContainer.innerHTML = '';
        if (diaries.length === 0) {
            cardContainer.innerHTML = '<p>저장된 다이어리가 없습니다.</p>';
            return;
        }

        diaries.sort((a, b) => new Date(b.date) - new Date(a.date));

        diaries.forEach(diary => {
            const card = createDiaryCard(diary);
            cardContainer.appendChild(card);
        });
    }

    renderAllCards();
});