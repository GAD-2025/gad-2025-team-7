document.addEventListener('DOMContentLoaded', () => {
    const recordMenu = document.querySelector('.record-menu');
    if (recordMenu) {
        const recordMenuBtns = recordMenu.querySelectorAll('.record-menu-btn');
        const recordContents = document.querySelectorAll('.record-content');

        recordMenu.addEventListener('click', (e) => {
            const target = e.target.closest('.record-menu-btn');
            if (!target) return;

            const targetContentId = target.dataset.target;

            recordMenuBtns.forEach(btn => {
                btn.classList.remove('active');
            });
            target.classList.add('active');

            recordContents.forEach(content => {
                if (content.id === targetContentId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    }
});