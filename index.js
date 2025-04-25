import { isPointInsideRectangle } from "./utils.js";

const COLORS = {
    CARD_DEFAULT: "green",
    CARD_SELECTED_BORDER: "blue",
    DROPZONE_DEFAULT: "silver",
    DROPZONE_HOVER: "red",
    BACKGROUND: "white",
};

const TITLE_HEIGHT = 30; // Height of the column titles

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let state = {
    cards: [
        { title: "card 1", color: "green", selected: false, column: 0, position: 0 },
        { title: "card 2", color: "blue", selected: false, column: 1, position: 0 },
        { title: "card 3", color: "red", selected: false, column: 2, position: 0 },
        { title: "card 4", color: "yellow", selected: false, column: 3, position: 0 },
        { title: "card 5", color: "purple", selected: false, column: 0, position: 1 },
        { title: "card 6", color: "orange", selected: false, column: 1, position: 1 },
        { title: "card 7", color: "green", selected: false, column: 2, position: 1 },
        { title: "card 8", color: "blue", selected: false, column: 3, position: 1 },
        { title: "card 9", color: "red", selected: false, column: 0, position: 2 },
        { title: "card 10", color: "yellow", selected: false, column: 1, position: 2 },
        { title: "card 11", color: "purple", selected: false, column: 2, position: 2 },
        { title: "card 12", color: "orange", selected: false, column: 3, position: 2 },
        { title: "card 13", color: "green", selected: false, column: 0, position: 3 },
        { title: "card 14", color: "blue", selected: false, column: 1, position: 3 },
        { title: "card 15", color: "red", selected: false, column: 2, position: 3 },
        { title: "card 16", color: "yellow", selected: false, column: 3, position: 3 },
        { title: "card 17", color: "purple", selected: false, column: 0, position: 4 },
        { title: "card 18", color: "orange", selected: false, column: 1, position: 4 },
        { title: "card 19", color: "green", selected: false, column: 2, position: 4 },
        { title: "card 20", color: "blue", selected: false, column: 3, position: 4 },
        { title: "card 21", color: "red", selected: false, column: 0, position: 5 },
        { title: "card 22", color: "yellow", selected: false, column: 1, position: 5 },
        { title: "card 23", color: "purple", selected: false, column: 2, position: 5 },
        { title: "card 24", color: "orange", selected: false, column: 3, position: 5 },
        { title: "card 25", color: "green", selected: false, column: 0, position: 6 },
        { title: "card 26", color: "blue", selected: false, column: 1, position: 6 },
        { title: "card 27", color: "red", selected: false, column: 2, position: 6 },
        { title: "card 28", color: "yellow", selected: false, column: 3, position: 6 },
        { title: "card 29", color: "purple", selected: false, column: 0, position: 7 },
        { title: "card 30", color: "orange", selected: false, column: 1, position: 7 },
        { title: "card 31", color: "green", selected: false, column: 2, position: 7 },
        { title: "card 32", color: "blue", selected: false, column: 3, position: 7 },
        { title: "card 33", color: "red", selected: false, column: 0, position: 8 },
        { title: "card 34", color: "yellow", selected: false, column: 1, position: 8 },
        { title: "card 35", color: "purple", selected: false, column: 2, position: 8 },
        { title: "card 36", color: "orange", selected: false, column: 3, position: 8 },
        { title: "card 37", color: "green", selected: false, column: 0, position: 9 },
        { title: "card 38", color: "blue", selected: false, column: 1, position: 9 },
        { title: "card 39", color: "red", selected: false, column: 2, position: 9 },
        { title: "card 40", color: "yellow", selected: false, column: 3, position: 9 },
        { title: "card 41", color: "purple", selected: false, column: 0, position: 10 },
        { title: "card 42", color: "orange", selected: false, column: 1, position: 10 },
        { title: "card 43", color: "green", selected: false, column: 2, position: 10 },
        { title: "card 44", color: "blue", selected: false, column: 3, position: 10 },
        { title: "card 45", color: "red", selected: false, column: 0, position: 11 },
        { title: "card 46", color: "yellow", selected: false, column: 1, position: 11 },
        { title: "card 47", color: "purple", selected: false, column: 2, position: 11 },
        { title: "card 48", color: "orange", selected: false, column: 3, position: 11 },
        { title: "card 49", color: "green", selected: false, column: 0, position: 12 },
        { title: "card 50", color: "blue", selected: false, column: 1, position: 12 },
    ],
    dzs: [
        { name: "To Do", over: false },
        { name: "In Progress", over: false },
        { name: "Review", over: false },
        { name: "Done", over: false },
    ],
};

function positionDropZones(canvasWidth, canvasHeight) {
    const dropZones = state.dzs;
    const columnWidth = canvasWidth / dropZones.length; // Divide canvas width by the number of drop zones
    const dropZoneHeight = canvasHeight - TITLE_HEIGHT - 20; // Leave space for titles and padding

    for (let i = 0; i < dropZones.length; i++) {
        dropZones[i].x = i * columnWidth; // Position each drop zone in its column
        dropZones[i].y = TITLE_HEIGHT; // Start below the title area
        dropZones[i].width = columnWidth - 10; // Leave some padding between columns
        dropZones[i].height = dropZoneHeight;
    }
}

// Position drop zones initially
positionDropZones(canvas.width, canvas.height);

function calculateCardSize(canvasWidth, canvasHeight, columns, cardsPerRow) {
    const columnWidth = canvasWidth / columns; // Width of each column
    const rowHeight = canvasHeight / (cardsPerRow * 2); // Height of each row (adjusted for wrapping)

    return {
        width: columnWidth / cardsPerRow * 0.8, // Cards take 80% of the available width in a row
        height: rowHeight * 0.8, // Cards take 80% of the row height
    };
}

function updateCardSizes() {
    const columns = state.dzs.length; // Number of drop zones (columns)
    const cardsPerRow = 3; // Maximum number of cards per row
    const cardSize = calculateCardSize(canvas.width, canvas.height - TITLE_HEIGHT, columns, cardsPerRow);

    // Group cards by column
    const cardsByColumn = Array.from({ length: columns }, () => []);

    for (const card of state.cards) {
        cardsByColumn[card.column].push(card);
    }

    // Sort cards within each column by their position
    for (const columnCards of cardsByColumn) {
        columnCards.sort((a, b) => a.position - b.position);
    }

    // Position cards within their respective columns
    for (let columnIndex = 0; columnIndex < cardsByColumn.length; columnIndex++) {
        const columnCards = cardsByColumn[columnIndex];
        const columnWidth = canvas.width / columns;
        const rowHeight = cardSize.height + 10; // Add spacing between rows

        for (let cardIndex = 0; cardIndex < columnCards.length; cardIndex++) {
            const card = columnCards[cardIndex];
            const rowIndex = Math.floor(cardIndex / cardsPerRow); // Determine the row
            const colIndex = cardIndex % cardsPerRow; // Determine the position in the row

            card.width = cardSize.width;
            card.height = cardSize.height;
            card.x = columnIndex * columnWidth + colIndex * (card.width + 10); // Add spacing between cards
            card.y = TITLE_HEIGHT + rowIndex * rowHeight; // Add spacing between rows
        }
    }
}

// Call this function after resizing or initializing
updateCardSizes();

function drawDropZones() {
    for (const dz of state.dzs) {
        // Draw the drop zone background
        ctx.fillStyle = dz.over ? COLORS.DROPZONE_HOVER : COLORS.DROPZONE_DEFAULT;
        ctx.fillRect(dz.x, dz.y, dz.width, dz.height);

        // Draw the title above the drop zone
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            dz.name,
            dz.x + dz.width / 2, // Center horizontally
            dz.y - TITLE_HEIGHT / 2 // Position vertically in the title area
        );
    }
}

function drawCards() {
    for (const card of state.cards) {
        // Draw card background
        ctx.fillStyle = card.color || COLORS.CARD_DEFAULT;
        ctx.fillRect(card.x, card.y, card.width, card.height);

        // Add border if selected
        if (card.selected) {
            ctx.strokeStyle = COLORS.CARD_SELECTED_BORDER;
            ctx.lineWidth = 2;
            ctx.strokeRect(card.x, card.y, card.width, card.height);
        }

        // Draw card title
        ctx.fillStyle = "black"; // Text color
        ctx.font = "14px Arial"; // Font size and style
        ctx.textAlign = "center"; // Center the text horizontally
        ctx.textBaseline = "middle"; // Center the text vertically
        ctx.fillText(
            card.title,
            card.x + card.width / 2, // Center horizontally within the card
            card.y + card.height / 2 // Center vertically within the card
        );
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawDropZones();
    drawCards();
}

// Draw the initial state
draw();

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
    };
}

let isover = false;
let isdown = false;
let needsRedraw = false;

canvas.addEventListener("mouseover", function (event) {
    isover = true;
});

canvas.addEventListener("mouseleave", function (event) {
    isover = false;
    for (const dz of state.dzs) {
        dz.over = false;
    }
    needsRedraw = true;
});

canvas.addEventListener("mousedown", function (event) {
    isdown = true;
    const canevent = getMousePos(event);

    for (const card of state.cards) {
        card.selected = false; // Deselect all cards
    }

    for (const card of state.cards) {
        if (isPointInsideRectangle(canevent, card)) {
            card.selected = true;
            break; // Stop after selecting one card
        }
    }

    needsRedraw = true;
});

canvas.addEventListener("mouseup", function (event) {
    isdown = false;

    for (const card of state.cards) {
        if (card.selected) {
            // Check if the card is inside any drop zone
            for (let i = 0; i < state.dzs.length; i++) {
                const dz = state.dzs[i];
                if (isPointInsideRectangle({ x: card.x + card.width / 2, y: card.y + card.height / 2 }, dz)) {
                    // Update the card's column
                    if (card.column !== i) {
                        card.column = i;

                        // Assign the next available position in the new column
                        const cardsInColumn = state.cards.filter(c => c.column === i);
                        card.position = cardsInColumn.length;
                    }
                    updateCardSizes(); // Recalculate card positions
                    break;
                }
            }
        }
        card.selected = false;
    }

    for (const dz of state.dzs) {
        dz.over = false;
    }

    needsRedraw = true;
});

canvas.addEventListener("mousemove", function (event) {
    if (!isover) return;

    const mousePos = getMousePos(event);

    // Update mouse position display
    const x = document.getElementById("x");
    const y = document.getElementById("y");
    x.innerText = `(x:${mousePos.x})`;
    y.innerText = `(y:${mousePos.y})`;

    if (isdown) {
        // Move selected card
        for (const card of state.cards) {
            if (card.selected) {
                // Clamp card position within canvas boundaries
                card.x = Math.max(0, Math.min(canvas.width - card.width, Math.floor(mousePos.x - card.width / 2)));
                card.y = Math.max(0, Math.min(canvas.height - card.height, Math.floor(mousePos.y - card.height / 2)));
                needsRedraw = true;
                break;
            }
        }

        // Update drop zone hover state
        for (const dz of state.dzs) {
            const isOver = isPointInsideRectangle(mousePos, dz);
            if (dz.over !== isOver) {
                dz.over = isOver;
                needsRedraw = true;
            }
        }
    }
});

function resizeCanvas() {
    const container = document.getElementById("canvas-container");
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Recalculate drop zone positions
    positionDropZones(canvas.width, canvas.height);

    // Recalculate card sizes
    updateCardSizes();

    draw(); // Redraw the canvas after resizing
}

// Set the initial size
resizeCanvas();

// Update the canvas size on window resize
window.addEventListener("resize", resizeCanvas);

function animationLoop() {
    if (needsRedraw) {
        draw();
        needsRedraw = false; // Reset the flag after redrawing
    }
    requestAnimationFrame(animationLoop); // Schedule the next frame
}

// Start the animation loop
animationLoop();
