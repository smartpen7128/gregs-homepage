document.addEventListener('DOMContentLoaded', () => {
    const columnsContainer = document.getElementById('columns-container');
    const addColumnBtn = document.getElementById('add-column-btn');

    let data = JSON.parse(localStorage.getItem('bookmarkData')) || { columns: [] };

    function saveData() {
        localStorage.setItem('bookmarkData', JSON.stringify(data));
    }

    function render() {
        columnsContainer.innerHTML = '';
        data.columns.forEach((column, columnIndex) => {
            const columnEl = document.createElement('div');
            columnEl.className = 'column';
            columnEl.innerHTML = `
                <div class="column-header">
                    <span class="column-title" contenteditable="true">${column.title}</span>
                    <fluent-button appearance="lightweight" class="delete-column-btn">Delete</fluent-button>
                </div>
                <div class="cards-container" data-column="${columnIndex}">
                    ${column.cards.map((card, cardIndex) => `
                        <div class="card" data-card="${cardIndex}">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div class="card-title" contenteditable="true">${card.title}</div>
                                <fluent-button appearance="lightweight" class="delete-card-btn">X</fluent-button>
                            </div>
                            <a class="card-link" href="${card.url}" target="_blank">${card.url}</a>
                        </div>
                    `).join('')}
                </div>
                <fluent-button appearance="secondary" class="add-card-btn">Add Card</fluent-button>
            `;
            columnsContainer.appendChild(columnEl);

            // Event listeners
            columnEl.querySelector('.column-title').addEventListener('blur', (e) => {
                data.columns[columnIndex].title = e.target.textContent;
                saveData();
            });

            columnEl.querySelector('.delete-column-btn').addEventListener('click', () => {
                data.columns.splice(columnIndex, 1);
                saveData();
                render();
            });

            columnEl.querySelector('.add-card-btn').addEventListener('click', () => {
                const title = prompt('Card title:');
                const url = prompt('Card URL:');
                if (title && url) {
                    data.columns[columnIndex].cards.push({ title, url });
                    saveData();
                    render();
                }
            });

            // Sortable for drag and drop
            const cardsContainer = columnEl.querySelector('.cards-container');
            Sortable.create(cardsContainer, {
                group: 'cards',
                animation: 150,
                onEnd: function(evt) {
                    const fromColumn = parseInt(evt.from.dataset.column);
                    const toColumn = parseInt(evt.to.dataset.column);
                    const fromIndex = evt.oldIndex;
                    const toIndex = evt.newIndex;
                    if (fromColumn !== toColumn || fromIndex !== toIndex) {
                        const card = data.columns[fromColumn].cards.splice(fromIndex, 1)[0];
                        data.columns[toColumn].cards.splice(toIndex, 0, card);
                        saveData();
                        render();
                    }
                }
            });

            columnEl.querySelectorAll('.card').forEach((cardEl, cardIndex) => {
                cardEl.querySelector('.card-title').addEventListener('blur', (e) => {
                    data.columns[columnIndex].cards[cardIndex].title = e.target.textContent;
                    saveData();
                });

                cardEl.querySelector('.delete-card-btn').addEventListener('click', () => {
                    data.columns[columnIndex].cards.splice(cardIndex, 1);
                    saveData();
                    render();
                });

                cardEl.addEventListener('dblclick', () => {
                    const newUrl = prompt('New URL:', data.columns[columnIndex].cards[cardIndex].url);
                    if (newUrl) {
                        data.columns[columnIndex].cards[cardIndex].url = newUrl;
                        saveData();
                        render();
                    }
                });
            });
        });
    }

    addColumnBtn.addEventListener('click', () => {
        const title = prompt('Column title:');
        if (title) {
            data.columns.push({ title, cards: [] });
            saveData();
            render();
        }
    });

    render();
});