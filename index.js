const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let state = {
    cards: [
        { x: 20, y: 20, height: 20, width: 20, color: "green", selected: false },
    ],
    dzs: [{ x: 100, y: 20, width: 100, height: 100, over: false }],
};

function isPointInsideRectangle(point, rect) {
    const { x, y } = point;
    const { x: rectX, y: rectY, width, height } = rect;

    return x >= rectX && x <= rectX + width &&
        y >= rectY && y <= rectY + height;
}

function drawDropZones() {
    for (const dz of state.dzs) {
        ctx.fillStyle = dz.over ? "red" : "silver";
        ctx.fillRect(dz.x, dz.y, dz.width, dz.height);
    }
}

function drawCards() {
    for (const card of state.cards) {
        ctx.fillStyle = card.selected ? "blue" : card.color;
        ctx.fillRect(card.x, card.y, card.width, card.height);
    }
}

function draw() {
    const statejson = document.getElementById("state");
    statejson.innerText = JSON.stringify(state, null, 2);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
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
