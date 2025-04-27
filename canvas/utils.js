export function isPointInsideRectangle(point, rect) {
    const { x, y } = point;
    const { x: rectX, y: rectY, width, height } = rect;

    return x >= rectX && x <= rectX + width &&
        y >= rectY && y <= rectY + height;
}


// Get mouse position relative to canvas
export function getMousePos(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
