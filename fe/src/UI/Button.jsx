import React from 'react';
import './Button.css';

export default function Button({onClick, variant, children, disabled, color }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}
      style={ color ? { backgroundColor: color } : {} }>
      {children}
    </button>
  );
}