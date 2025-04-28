import { isPointInsideRectangle, getMousePos } from "./utils.js";
import { draw } from "./draw.js";
import { state, resizeCanvas, positionDropZones, updateCardSizes } from "./state.js";
import { defaultTheme } from "./theme.js";

export function canvasBoard(canvasid, canvascontainerid, theme = defaultTheme) {
    const COLORS = { ...defaultTheme, ...theme }; // Merge default theme with custom theme

    const TITLE_HEIGHT = 30;
    const canvas = document.getElementById(canvasid);
    const ctx = canvas.getContext("2d");

    let isMouseDown = false;
    let needsRedraw = false;

    // Add a selectedCard property to the state
    state.selectedCard = null;

    function handleMouseDown(event) {
        isMouseDown = true;
        const mousePos = getMousePos(event, canvas);

        state.cards.forEach((card, index) => {
            if (!card.isghost && isPointInsideRectangle(mousePos, card)) {
                card.selected = true;
                state.selectedCard = card; // Store the selected card in the state

                // Record the original coordinates of the selected card
                state.selectedCard.originalX = card.x;
                state.selectedCard.originalY = card.y;

                state.cards.splice(index, 1);
                state.cards.push(card); // Move the selected card to the end for z-index
                needsRedraw = true;
            }
        });
    }

    function handleMouseUp(event) {
        isMouseDown = false;

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
        updateCardSizes(canvas, state, TITLE_HEIGHT);
        needsRedraw = true;
    }

    function handleMouseMove(event) {
        if (!isMouseDown || !state.selectedCard) return;

        const mousePos = getMousePos(event, canvas);

        // Update the position of the selected card
        state.selectedCard.x = Math.max(0, Math.min(canvas.width - state.selectedCard.width, mousePos.x - state.selectedCard.width / 2));
        state.selectedCard.y = Math.max(0, Math.min(canvas.height - state.selectedCard.height, mousePos.y - state.selectedCard.height / 2));
        needsRedraw = true;

        // Mark drop zones as hovered if applicable
        state.dzs.forEach(dz => {
            dz.over = isPointInsideRectangle(mousePos, dz);
        });
    }

    function animationLoop() {
        if (needsRedraw) {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Redraw the entire board
            draw(ctx, canvas, state, COLORS, TITLE_HEIGHT);

            // Draw a dashed outline at the original position of the selected card
            if (state.selectedCard) {
                const originalDropZone = state.dzs.find(dz => dz.id === state.selectedCard.dzId);
                const isOverOriginalDropZone = isPointInsideRectangle(
                    { x: state.selectedCard.x + state.selectedCard.width / 2, y: state.selectedCard.y + state.selectedCard.height / 2 },
                    originalDropZone
                );

                if (isOverOriginalDropZone) {
                    ctx.strokeStyle = COLORS.CARD_SELECTED_BORDER; // Use the selected border color
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]); // Dashed outline
                    ctx.strokeRect(
                        state.selectedCard.originalX,
                        state.selectedCard.originalY,
                        state.selectedCard.width,
                        state.selectedCard.height
                    );
                    ctx.setLineDash([]); // Reset line dash
                }
            }

            needsRedraw = false;
        }
        requestAnimationFrame(animationLoop);
    }

    function resize() {
        resizeCanvas(canvas, canvascontainerid, () => positionDropZones(canvas, state, TITLE_HEIGHT), () =>
            updateCardSizes(canvas, state, TITLE_HEIGHT)
        );
        needsRedraw = true;
    }
    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    animationLoop();

    return {
        setState(newState) {
            state.cards = newState.cards;
            state.dzs = newState.dzs;
            positionDropZones(canvas, state, TITLE_HEIGHT);
            updateCardSizes(canvas, state, TITLE_HEIGHT);
            needsRedraw = true;
        },
        setTheme(newTheme) {
            Object.assign(COLORS, newTheme); // Update the theme dynamically
            needsRedraw = true;
        },
    };
}
