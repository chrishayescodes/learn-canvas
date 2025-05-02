import { isPointInsideRectangle } from './utils.js';

export const state = {
    cards: [],
    dzs: [],
    selectedCard: null,
    isOverOriginalDropZone: false,
};

export function resizeCanvas(canvas, container) {
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

function setSelectedCard(card) {
    card.selected = true;
    state.selectedCard = card; // Store the selected card in the state

    // Record the original coordinates of the selected card
    state.selectedCard.originalX = card.x;
    state.selectedCard.originalY = card.y;

    // Move the selected card to the end for z-index
    const cardIndex = state.cards.indexOf(card);
    state.cards.splice(cardIndex, 1);
    state.cards.push(card);
}

export function setCardSelectedIfOver(mousePos) {

    // Find the first card that the mouse is over
    const card = state.cards.find(card => !card.isghost && isPointInsideRectangle(mousePos, card));

    if (card) {
        console.log('Card selected:', card);
        setSelectedCard(card);
    }
}

export function dropCard() {
    if (state.selectedCard) {
        let droppedInZone = false;

        state.dzs.forEach((dz, i) => {
            if (isPointInsideRectangle({ x: state.selectedCard.x + state.selectedCard.width / 2, y: state.selectedCard.y + state.selectedCard.height / 2 }, dz)) {
                droppedInZone = true;
                if (state.selectedCard.dzId !== dz.id) {
                    state.selectedCard.dzId = dz.id;
                    state.selectedCard.position = state.cards.filter(c => c.dzId === dz.id).length;
                }
            }
        });

        if (!droppedInZone) {
            const dz = state.dzs.find(dz => dz.id === state.selectedCard.dzId);
            state.selectedCard.x = dz.x + (dz.width - state.selectedCard.width) / 2;
            state.selectedCard.y = dz.y + (dz.height - state.selectedCard.height) / 2;
        }

        state.selectedCard.selected = false;
        state.selectedCard = null; // Clear the selected card
    }

    state.dzs.forEach(dz => (dz.over = false));
}

export function setMouseMove(mousePos, canvasWidth, canvasHeight) {
    state.selectedCard.x = Math.max(0, Math.min(canvasWidth - state.selectedCard.width, mousePos.x - state.selectedCard.width / 2));
    state.selectedCard.y = Math.max(0, Math.min(canvasHeight - state.selectedCard.height, mousePos.y - state.selectedCard.height / 2));

    // Mark drop zones as hovered if applicable
    state.dzs.forEach(dz => {
        dz.over = isPointInsideRectangle(mousePos, dz);
    });
}

export function setOverOriginalDropZone() {
    if (state.selectedCard) {
        const originalDropZone = state.dzs.find(dz => dz.id === state.selectedCard.dzId);
        state.isOverOriginalDropZone = isPointInsideRectangle(
            { x: state.selectedCard.x + state.selectedCard.width / 2, y: state.selectedCard.y + state.selectedCard.height / 2 },
            originalDropZone
        );
    }
}
