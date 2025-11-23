import React from "react";
import "../../styles/navbar.css";

export default function Navbar({ onLoginClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">

        {/* Logo / título */}
        <div className="navbar-logo">
          <span className="navbar-logo-icon">🔐</span>

          <div>
            <div className="navbar-title">Encrypted Login</div>
            <div className="navbar-subtitle">React + RSA Encryption</div>
          </div>
        </div>

        {/* Botón Ingresar */}
        <button
          type="button"
          onClick={onLoginClick}
          className="navbar-button"
        >
          Ingresar
        </button>

      </div>
    </nav>
  );
}
