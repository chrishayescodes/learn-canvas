export const state = {
    cards: [],
    dzs: [],
};

export function resizeCanvas(canvas, containerId) {
    const container = document.getElementById(containerId);
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    positionDropZones(canvas, 30); // Assuming TITLE_HEIGHT is 30
    updateCardSizes(canvas, 30); // Assuming TITLE_HEIGHT is 30
}

function positionDropZones(canvas, TITLE_HEIGHT) {
    const { width, height } = canvas;
    const columnWidth = width / state.dzs.length;
    const dropZoneHeight = height - TITLE_HEIGHT - 20;

    state.dzs.forEach((dz, i) => {
        dz.x = i * columnWidth;
        dz.y = TITLE_HEIGHT;
        dz.width = columnWidth - 10;
        dz.height = dropZoneHeight;
        // dzcards[dz.id] = {title: 'ghost', position:9999, type:'ghost', dzId: dz.id, isghost:true, hide:()=>!dz.over};
        // state.cards.push(dzcards[dz.id]);
    });
}

function updateCardSizes(canvas, TITLE_HEIGHT) {
    const { width, height } = canvas;
    const columns = state.dzs.length;
    const cardsPerRow = 3;
    const cardSize = {
        width: (width / columns / cardsPerRow) * 0.8,
        height: ((height - TITLE_HEIGHT) / (cardsPerRow * 2)) * 0.8,
    };

    // Group cards by their dzId
    const cardsByDzId = state.dzs.reduce((acc, dz) => {
        acc[dz.id] = [...state.cards.filter(card => card.dzId === dz.id)];
        return acc;
    }, {});

    // Position cards within their respective drop zones
    state.dzs.forEach((dz, columnIndex) => {
        const columnCards = cardsByDzId[dz.id];
        columnCards.sort((a, b) => a.position - b.position);

        columnCards.forEach((card, cardIndex) => {
            positionCard(cardIndex, cardsPerRow, card, cardSize, dz);
        });
    });
}

function positionCard(cardIndex, cardsPerRow, card, cardSize, dz) {
    const rowIndex = Math.floor(cardIndex / cardsPerRow);
    const colIndex = cardIndex % cardsPerRow;

    card.width = cardSize.width;
    card.height = cardSize.height;
    card.x = dz.x + colIndex * (card.width + 10);
    card.y = dz.y + rowIndex * (card.height + 10);
}
