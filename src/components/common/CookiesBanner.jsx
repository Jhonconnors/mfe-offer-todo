import React from "react";

const CookiesBanner = ({ choice, setChoice }) => {
  if (choice !== null) return null;

  return (
    <div className="cookies-banner" id="cookies">
      <p>
        Usamos cookies para personalizar tu experiencia, medir métricas y
        mostrar publicidad relevante. Puedes aceptar o configurar tus
        preferencias en cualquier momento.
      </p>
      <div className="cookies-actions">
        <button onClick={() => setChoice("rejected")}>Solo necesarias</button>
        <button
          className="cookies-accept"
          onClick={() => setChoice("accepted")}
        >
          Aceptar todas
        </button>
      </div>
    </div>
  );
};

export default CookiesBanner;
