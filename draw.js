export function drawDropZones(ctx, state, COLORS, TITLE_HEIGHT) {
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

export function drawCards(ctx, state, COLORS) {
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

export function draw(ctx, canvas, state, COLORS, TITLE_HEIGHT) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawDropZones(ctx, state, COLORS, TITLE_HEIGHT);
    drawCards(ctx, state, COLORS);
}