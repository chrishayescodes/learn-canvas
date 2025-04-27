import { canvasBoard } from "./canvasBoard.js";

let board;

// Fetch the theme from the JSON file
fetch("./theme.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load theme.json: ${response.statusText}`);
        }
        return response.json();
    })
    .then(theme => {
        // Initialize the canvas board with the fetched theme
        board = canvasBoard("board", "canvas-container", theme);

        // Fetch the state from the JSON file
        return fetch("./state.json");
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load state.json: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // Set the state for the board
        board.setState(data);
    })
    .catch(error => {
        console.error("Error loading data:", error);
    });
