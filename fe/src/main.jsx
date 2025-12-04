import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./index.css";
import TopBar from "./UI/TopBar.jsx";
import LedController from "./UI/LedController.jsx";
import MainApp from "./MainApp.jsx";
import EnvDashBoard from "./UI/EnvDashBoard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <TopBar />
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/led-controller" element={<LedController />} />
        <Route path="/env-dashboard" element={<EnvDashBoard/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
