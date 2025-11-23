import React from "react";
import "../../styles/navbar.css";

export default function Navbar({ onLoginClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">

        {/* Logo / título */}
        <div className="navbar-logo">
          <span className="navbar-logo-icon">🛍️</span>

          <div>
            <div className="navbar-title">OfferTodo</div>
            <div className="navbar-subtitle">Donde encuentras los mejores precios</div>
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
