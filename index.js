import { canvasBoard } from "./canvas/canvasBoard.js";

async function initializeBoard() {
  try {
    // Fetch themes and state data
    const [themes, state] = await Promise.all([
      fetch("./themes.json").then(res => res.json()),
      fetch("./state.json").then(res => res.json())
    ]);

    // Initialize the board with the default theme
    const themeSelector = document.getElementById("theme-selector");
    const selectedTheme = themes["default"];
    const board = canvasBoard("board", "canvas-container", selectedTheme);

    // Set the initial state
    board.setState(state);

    // Add event listener for theme changes
    themeSelector.addEventListener("change", event => {
      const newTheme = themes[event.target.value];
      if (newTheme) {
        board.setTheme(newTheme); // Dynamically update the theme
      }
    });
  } catch (error) {
    console.error("Error loading themes or state:", error);
  }
}

initializeBoard();
