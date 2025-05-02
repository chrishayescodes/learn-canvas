import { getCanvasMousePos } from "./utils.js";
import { draw } from "./draw.js";
import { state, resizeCanvas, setCardSelectedIfOver, dropCard, setMouseMove, setOverOriginalDropZone } from "./state.js";
import { defaultTheme } from "./theme.js";

export function canvasBoard(canvasid, canvascontainerid, theme = defaultTheme) {
    
    const COLORS = { ...defaultTheme, ...theme }; // Merge default theme with custom theme

    const TITLE_HEIGHT = 30;
    const container = document.getElementById(canvascontainerid);
    const canvas = document.getElementById(canvasid);
    const ctx = canvas.getContext("2d");

    let isMouseDown = false;
    let needsRedraw = false;

    // Add a selectedCard property to the state

    
    function handleMouseDown(event) {
        isMouseDown = true;
        const mousePos = getCanvasMousePos(event, canvas);
        setCardSelectedIfOver(mousePos);
    }

    function handleMouseUp(event) {
        isMouseDown = false;
        dropCard();
        
        resizeCanvas(canvas, container);
        needsRedraw = true;
    }

    function handleMouseMove(event) {
        if (!isMouseDown || !state.selectedCard) return;

        const mousePos = getCanvasMousePos(event, canvas);
        setMouseMove(mousePos, canvas.width, canvas.height);
        needsRedraw = true;
    }

    function animationLoop() {
        if (needsRedraw) {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw a dashed outline at the original position of the selected card
            setOverOriginalDropZone();

            // Redraw the entire board
            draw(ctx, canvas, state, COLORS, TITLE_HEIGHT);

            needsRedraw = false;
        }
        requestAnimationFrame(animationLoop);
    }

    function resize() {
        resizeCanvas(canvas, container);
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
            resizeCanvas(canvas, container);
            needsRedraw = true;
        },
        setTheme(newTheme) {
            Object.assign(COLORS, newTheme); // Update the theme dynamically
            needsRedraw = true;
        },
    };
}
