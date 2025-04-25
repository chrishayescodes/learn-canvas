export function isPointInsideRectangle(point, rect) {
    const { x, y } = point;
    const { x: rectX, y: rectY, width, height } = rect;

    return x >= rectX && x <= rectX + width &&
        y >= rectY && y <= rectY + height;
}