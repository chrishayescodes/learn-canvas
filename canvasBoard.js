import { isPointInsideRectangle } from "./utils.js";

export function canvasBoard(canvasid, canvascontainerid) {
    const COLORS = {
        CARD_DEFAULT: "green",
        CARD_SELECTED_BORDER: "blue",
        DROPZONE_DEFAULT: "silver",
        DROPZONE_HOVER: "gray",
        BACKGROUND: "white",
    };

    const TITLE_HEIGHT = 30;
    const canvas = document.getElementById(canvasid);
    const ctx = canvas.getContext("2d");

    const state = {
        cards: [],
        dzs: [],
    };

    let isMouseDown = false;
    let needsRedraw = false;

    // Utility: Resize canvas and recalculate positions
    function resizeCanvas() {
        const container = document.getElementById(canvascontainerid);
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        positionDropZones();
        updateCardSizes();
        needsRedraw = true;
    }

    // Position drop zones
    function positionDropZones() {
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

    // Update card sizes and positions
    function updateCardSizes() {
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

    // Draw drop zones
    function drawDropZones() {
        state.dzs.forEach(dz => {
            ctx.fillStyle = dz.over ? COLORS.DROPZONE_HOVER : COLORS.DROPZONE_DEFAULT;
            ctx.fillRect(dz.x, dz.y, dz.width, dz.height);

            ctx.fillStyle = "black";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(dz.name, dz.x + dz.width / 2, dz.y - TITLE_HEIGHT / 2);
        });
    }

    // Draw cards
    function drawCards() {
        state.cards.forEach(card => {
            ctx.fillStyle = card.color || COLORS.CARD_DEFAULT;
            ctx.fillRect(card.x, card.y, card.width, card.height);

            if (card.selected) {
                ctx.strokeStyle = COLORS.CARD_SELECTED_BORDER;
                ctx.lineWidth = 2;
                ctx.strokeRect(card.x, card.y, card.width, card.height);
            }

            ctx.fillStyle = "black";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(card.title, card.x + card.width / 2, card.y + card.height / 2);
        });
    }

    // Main draw function
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = COLORS.BACKGROUND;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawDropZones();
        drawCards();
    }

    // Handle mouse events
    function handleMouseDown(event) {
        isMouseDown = true;
        const mousePos = getMousePos(event);

        state.cards.forEach(card => (card.selected = isPointInsideRectangle(mousePos, card)));
        needsRedraw = true;
    }

    function handleMouseUp(event) {
        isMouseDown = false;

        state.cards.forEach(card => {
            if (card.selected) {
                let droppedInZone = false;

                // Check if the card is dropped inside any drop zone
                state.dzs.forEach((dz, i) => {
                    if (isPointInsideRectangle({ x: card.x + card.width / 2, y: card.y + card.height / 2 }, dz)) {
                        droppedInZone = true;

                        if (card.column !== i) {
                            // If dropped in a new drop zone, update column and position
                            card.column = i;
                            card.position = state.cards.filter(c => c.column === i).length;
                        }
                    }
                });

                // If not dropped in any zone, reset to original position
                if (!droppedInZone) {
                    const originalDropZone = state.dzs[card.column];
                    card.x = originalDropZone.x + (originalDropZone.width - card.width) / 2;
                    card.y = originalDropZone.y + (originalDropZone.height - card.height) / 2;
                }

                card.selected = false;
            }
        });

        // Reset hover state for all drop zones
        state.dzs.forEach(dz => (dz.over = false));

        updateCardSizes();
        needsRedraw = true;
    }

    function handleMouseMove(event) {
        if (!isMouseDown) return;

        const mousePos = getMousePos(event);
        state.cards.forEach(card => {
            if (card.selected) {
                card.x = Math.max(0, Math.min(canvas.width - card.width, mousePos.x - card.width / 2));
                card.y = Math.max(0, Math.min(canvas.height - card.height, mousePos.y - card.height / 2));
                needsRedraw = true;
            }
        });

        state.dzs.forEach(dz => {
            dz.over = isPointInsideRectangle(mousePos, dz);
        });
    }

    // Get mouse position relative to canvas
    function getMousePos(event) {
        const rect = canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    // Animation loop
    function animationLoop() {
        if (needsRedraw) {
            draw();
            needsRedraw = false;
        }
        requestAnimationFrame(animationLoop);
    }

    // Initialize
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    animationLoop();

    // Public API
    return {
        setState(newState) {
            state.cards = newState.cards;
            state.dzs = newState.dzs;
            positionDropZones();
            updateCardSizes();
            needsRedraw = true;
        },
    };
}
