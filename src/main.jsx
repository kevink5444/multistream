
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./index.css";

// =====================================
// INITIALIZE THEME BEFORE REACT RENDER
// =====================================

const savedTheme =
  localStorage.getItem("multistream-theme") || "dark";

let initialTheme = savedTheme;

if (savedTheme === "system") {
  initialTheme = window.matchMedia(
    "(prefers-color-scheme: light)"
  ).matches
    ? "light"
    : "dark";
}

// Apply theme immediately before React renders
document.documentElement.setAttribute(
  "data-theme",
  initialTheme
);

document.documentElement.style.colorScheme =
  initialTheme;

// =====================================
// RENDER APPLICATION
// =====================================

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
