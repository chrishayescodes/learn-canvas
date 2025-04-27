import { canvasBoard } from "./canvasBoard.js";

let board;

// Fetch themes and initialize the board
fetch("./themes.json")
  .then(response => response.json())
  .then(themes => {
    const themeSelector = document.getElementById("theme-selector");

    // Initialize the board with the default theme
    const selectedTheme = themes["default"];
    board = canvasBoard("board", "canvas-container", selectedTheme);

    // Fetch and set the state
    return fetch("./state.json").then(response => response.json()).then(data => {
      board.setState(data);

      // Add event listener for theme changes
      themeSelector.addEventListener("change", event => {
        const newTheme = themes[event.target.value];
        if (newTheme) {
          board.setTheme(newTheme); // Dynamically update the theme
        }
      });
    });
  })
  .catch(error => console.error("Error loading themes or state:", error));
