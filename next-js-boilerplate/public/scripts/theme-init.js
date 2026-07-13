(function () {
  var THEMES = ["light", "dark", "ocean", "violet"];
  var STYLES = ["default", "shiny", "glass", "neon", "gradient"];
  var match = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/);
  var theme = match && THEMES.indexOf(match[1]) !== -1 ? match[1] : null;
  if (!theme) {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  var root = document.documentElement;
  root.classList.add("theme-" + theme);
  if (theme === "dark" || theme === "violet") {
    root.classList.add("dark");
  }

  var styleMatch = document.cookie.match(/(?:^|;\s*)componentStyle=([^;]*)/);
  var style = styleMatch && STYLES.indexOf(styleMatch[1]) !== -1 ? styleMatch[1] : "default";
  root.classList.add("style-" + style);
})();
