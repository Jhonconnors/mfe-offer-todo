import React from "react";
import "../../styles/geoBanner.css";

const GeoBanner = ({ status, onUseGeolocation }) => {
  return (
    <div className="geo-banner">

      <div>
        <p className="geo-banner-title">
          ¿Quieres ver ofertas cerca de tu comuna?
        </p>

        <p>
          Podemos usar tu ubicación aproximada para filtrar supermercados y
          farmacias cercanas. Si no aceptas, usaremos Santiago Centro como
          comuna por defecto.
        </p>

        {status === "denied" && (
          <p className="geo-banner-msg geo-banner-error">
            No pudimos usar tu ubicación. Revisa los permisos del navegador o
            sigue navegando con la comuna por defecto.
          </p>
        )}

        {status === "error" && (
          <p className="geo-banner-msg geo-banner-error">
            Tu navegador no soporta geolocalización o se produjo un error.
          </p>
        )}

        {status === "ok" && (
          <p className="geo-banner-msg geo-banner-success">
            ¡Ubicación detectada! Ajustamos las ofertas a tu comuna.
          </p>
        )}
      </div>

      <button className="geo-banner-button" onClick={onUseGeolocation}>
        Usar mi ubicación
      </button>
    </div>
  );
};

export default GeoBanner;
