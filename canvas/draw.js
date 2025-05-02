export function getDrawHandler(canvas, ctx, COLORS, TITLE_HEIGHT) {

    function drawGhostCard(card) {
        ctx.strokeStyle = COLORS.CARD_SELECTED_BORDER; // Use the selected border color
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Dashed outline
        ctx.strokeRect(
            card.originalX,
            card.originalY,
            card.width,
            card.height
        );
        ctx.setLineDash([]); // Reset line dash
    }

    function drawRegularCard(card) {
        // Get the color based on the card type, fallback to CARD_DEFAULT
        const cardColor = COLORS.CARD_TYPE_COLORS[card.type] || COLORS.CARD_DEFAULT;

        // Draw the card background
        ctx.fillStyle = cardColor;
        ctx.fillRect(card.x, card.y, card.width, card.height);

        // Draw the border if the card is selected
        if (card.selected) { drawSelectedBoarder(card); }

        // Draw the card title with text color from the theme
        drawCardTitle(card);
    }

    function drawSelectedBoarder(card) {
        ctx.strokeStyle = COLORS.CARD_SELECTED_BORDER;
        ctx.lineWidth = 2;
        ctx.strokeRect(card.x, card.y, card.width, card.height);
    }

    function drawCardTitle(card) {
        ctx.fillStyle = COLORS.CARD_TEXT_COLOR;
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(card.title, card.x + card.width / 2, card.y + card.height / 2);
    }

    function drawCard(state, card) {
        if (card.isghost) {
            const overdz = state.dzs.find(dz => dz.over);
            const selectedCard = state.cards.find(c => c.selected);
            const isOverSelectedCardDz =
                selectedCard && overdz && overdz.id === selectedCard.dzId;
            if (!isOverSelectedCardDz && !card.hide()) { drawGhostCard(ctx, card, COLORS); }
        }
        else {
            drawRegularCard(card);
        }
    }

    function drawDropZones(state) {
        state.dzs.forEach(dz => {
            // Draw the drop zone background
            ctx.fillStyle = dz.over ? COLORS.DROPZONE_HOVER : COLORS.DROPZONE_DEFAULT;
            ctx.fillRect(dz.x, dz.y, dz.width, dz.height);

            // Draw the drop zone title with text color from the theme
            ctx.fillStyle = COLORS.DROPZONE_TEXT_COLOR;
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(dz.name, dz.x + dz.width / 2, dz.y - TITLE_HEIGHT / 2);
        });
    }

    function drawCards(state) {
        state.cards.forEach(card => {
            drawCard(state, card); // Use the new drawCard function
        });
    }

    function draw(state) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = COLORS.BACKGROUND;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawDropZones(state);
        if (state.isOverOriginalDropZone && state.selectedCard) {
            drawGhostCard(state.selectedCard);
        }
        drawCards(state);
    }

    return { draw };
}