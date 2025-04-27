export const state = {
    cards: [],
    dzs: [],
};

export function resizeCanvas(canvas, containerId, positionDropZones, updateCardSizes) {
    const container = document.getElementById(containerId);
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    positionDropZones();
    updateCardSizes();
}

export function positionDropZones(canvas, state, TITLE_HEIGHT) {
    const { width, height } = canvas;
    const columnWidth = width / state.dzs.length;
    const dropZoneHeight = height - TITLE_HEIGHT - 20;

    state.dzs.forEach((dz, i) => {
        dz.x = i * columnWidth;
        dz.y = TITLE_HEIGHT;
        dz.width = columnWidth - 10;
        dz.height = dropZoneHeight;
    });
}

export function updateCardSizes(canvas, state, TITLE_HEIGHT) {
    const { width, height } = canvas;
    const columns = state.dzs.length;
    const cardsPerRow = 3;
    const cardSize = {
        width: (width / columns / cardsPerRow) * 0.8,
        height: ((height - TITLE_HEIGHT) / (cardsPerRow * 2)) * 0.8,
    };

    const cardsByColumn = Array.from({ length: columns }, () => []);
    state.cards.forEach(card => cardsByColumn[card.column].push(card));

    cardsByColumn.forEach((columnCards, columnIndex) => {
        columnCards.sort((a, b) => a.position - b.position);
        columnCards.forEach((card, cardIndex) => {
            const rowIndex = Math.floor(cardIndex / cardsPerRow);
            const colIndex = cardIndex % cardsPerRow;

            card.width = cardSize.width;
            card.height = cardSize.height;
            card.x = columnIndex * (width / columns) + colIndex * (card.width + 10);
            card.y = TITLE_HEIGHT + rowIndex * (card.height + 10);
        });
    });
}