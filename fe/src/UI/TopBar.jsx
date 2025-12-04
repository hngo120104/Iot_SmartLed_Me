import { NavLink } from "react-router-dom";
import "./TopBar.css";

export default function TopBar() {
  return (
    <nav className="top-bar">
      <NavLink to="/" className="nav-link">
        Home
      </NavLink>

      <NavLink to="/led-controller" className="nav-link">
        LED Controller
      </NavLink>
      <NavLink to="/env-dashboard" className="nav-link">
        Dash Board
      </NavLink>
    </nav>
  );
}
