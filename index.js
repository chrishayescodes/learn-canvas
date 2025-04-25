import { isPointInsideRectangle } from "./utils.js";

const COLORS = {
    CARD_DEFAULT: "green",
    CARD_SELECTED_BORDER: "blue",
    DROPZONE_DEFAULT: "silver",
    DROPZONE_HOVER: "red",
    BACKGROUND: "white",
};

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let state = {
    cards: [
        { x: 20, y: 20, height: 20, width: 20, color: COLORS.CARD_DEFAULT, selected: false },
    ],
    dzs: [{ x: 100, y: 20, width: 100, height: 100, over: false }],
};

function drawDropZones() {
    for (const dz of state.dzs) {
        ctx.fillStyle = dz.over ? COLORS.DROPZONE_HOVER : COLORS.DROPZONE_DEFAULT;
        ctx.fillRect(dz.x, dz.y, dz.width, dz.height);
    }
}

function drawCards() {
    for (const card of state.cards) {
        // Draw card
        ctx.fillStyle = card.color || COLORS.CARD_DEFAULT;
        ctx.fillRect(card.x, card.y, card.width, card.height);

        // Add border if selected
        if (card.selected) {
            ctx.strokeStyle = COLORS.CARD_SELECTED_BORDER;
            ctx.lineWidth = 2;
            ctx.strokeRect(card.x, card.y, card.width, card.height);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawDropZones();
    drawCards();
}

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
    };
}

let isover = false;
let isdown = false;

canvas.addEventListener("mouseover", function (event) {
    isover = true;
});

canvas.addEventListener("mouseleave", function (event) {
    isover = false;
});

canvas.addEventListener("mousedown", function (event) {
    isdown = true;
    const canevent = getMousePos(event);
    for (const card of state.cards) {
        card.selected = isPointInsideRectangle(canevent, card);
    }
    draw();
});

canvas.addEventListener("mouseup", function (event) {
    isdown = false;

    for (const card of state.cards) {
        if (card.selected) {
            // Check if the card is inside any drop zone
            for (const dz of state.dzs) {
                if (isPointInsideRectangle({ x: card.x + card.width / 2, y: card.y + card.height / 2 }, dz)) {
                    // Snap the card to the center of the drop zone
                    card.x = dz.x + (dz.width - card.width) / 2;
                    card.y = dz.y + (dz.height - card.height) / 2;
                }
            }
        }
        card.selected = false;
    }

    for (const dz of state.dzs) {
        dz.over = false;
    }

    draw();
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
        let needsRedraw = false;

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

        // Redraw only if necessary
        if (needsRedraw) {
            draw();
        }
    }
});

draw();
