(function () {
  var THEMES = ["light", "dark", "ocean", "active"];
  var match = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/);
  var theme = match && THEMES.indexOf(match[1]) !== -1 ? match[1] : null;
  if (!theme) {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  var root = document.documentElement;
  if (theme === "active") {
    root.classList.add("active-theme");
  } else {
    root.classList.add("theme-" + theme);
  }
  if (theme === "dark" || theme === "active") {
    root.classList.add("dark");
  }
})();
