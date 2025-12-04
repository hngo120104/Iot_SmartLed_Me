import React from "react";
import "./Switch.css";

export default function Switch({ checked, onChange, label }) {
  return (
    
    <label className="switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="slider" />
      {label && <span className="switch-label">{label}</span>}
    </label>
  );
}

