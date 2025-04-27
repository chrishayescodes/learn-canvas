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

    function handleMouseDown(event) {
        isMouseDown = true;
        const mousePos = getMousePos(event, canvas);

        state.cards.forEach((card, index) => {
            if (isPointInsideRectangle(mousePos, card)) {
                card.selected = true;
                state.cards.splice(index, 1);
                state.cards.push(card);
                needsRedraw = true;
            }
        });
    }

    function handleMouseUp(event) {
        isMouseDown = false;

        state.cards.forEach(card => {
            if (card.selected) {
                let droppedInZone = false;

                state.dzs.forEach((dz, i) => {
                    if (isPointInsideRectangle({ x: card.x + card.width / 2, y: card.y + card.height / 2 }, dz)) {
                        droppedInZone = true;
                        if (card.column !== i) {
                            card.column = i;
                            card.position = state.cards.filter(c => c.column === i).length;
                        }
                    }
                });

                if (!droppedInZone) {
                    const dz = state.dzs[card.column];
                    card.x = dz.x + (dz.width - card.width) / 2;
                    card.y = dz.y + (dz.height - card.height) / 2;
                }

                card.selected = false;
            }
        });

        state.dzs.forEach(dz => (dz.over = false));
        updateCardSizes(canvas, state, TITLE_HEIGHT);
        needsRedraw = true;
    }

    function handleMouseMove(event) {
        if (!isMouseDown) return;

        const mousePos = getMousePos(event, canvas);
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

    function animationLoop() {
        if (needsRedraw) {
            draw(ctx, canvas, state, COLORS, TITLE_HEIGHT);
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
