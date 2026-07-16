(function () {
  var THEMES = ["light", "dark", "shiny", "glass", "neon", "gradient"];
  var STYLES = ["default", "shiny", "glass", "neon", "gradient"];
  var match = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/);
  var theme = match && THEMES.indexOf(match[1]) !== -1 ? match[1] : null;
  if (!theme) {
    // Migrate legacy componentStyle cookie
    var styleMatch = document.cookie.match(/(?:^|;\s*)componentStyle=([^;]*)/);
    if (styleMatch && STYLES.indexOf(styleMatch[1]) !== -1 && styleMatch[1] !== "default") {
      theme = styleMatch[1];
    }
  }
  if (!theme) {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  var root = document.documentElement;

  root.classList.add("style-" + theme);
  if (theme !== "light") {
    root.classList.add("dark");
  }
})();
