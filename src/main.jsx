import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import HaikuGenerator from "./PoemWidget";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HaikuGenerator />
  </StrictMode>
);
