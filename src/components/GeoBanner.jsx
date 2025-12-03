import React from "react";

const GeoBanner = ({ status, onUseGeolocation }) => {
  return (
    <div className="bg-blue-50 text-blue-900 rounded-2xl px-4 py-3 text-xs flex flex-col sm:flex-row gap-3 justify-between">
      <div>
        <p className="font-semibold text-[13px]">
          ¿Quieres ver ofertas cerca de tu comuna?
        </p>
        <p className="mt-0.5">
          Podemos usar tu ubicación aproximada para filtrar supermercados y
          farmacias cercanas. Si no aceptas, usaremos Santiago Centro como
          comuna por defecto.
        </p>

        {status === "denied" && (
          <p className="mt-1 text-[11px] text-red-700">
            No pudimos usar tu ubicación. Revisa los permisos del navegador o
            sigue navegando con la comuna por defecto.
          </p>
        )}
        {status === "error" && (
          <p className="mt-1 text-[11px] text-red-700">
            Tu navegador no soporta geolocalización o se produjo un error.
          </p>
        )}
        {status === "ok" && (
          <p className="mt-1 text-[11px] text-emerald-700">
            ¡Ubicación detectada! Ajustamos las ofertas a tu comuna.
          </p>
        )}
      </div>

      <button
        className="self-start sm:self-center rounded-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium"
        onClick={onUseGeolocation}
      >
        Usar mi ubicación
      </button>
    </div>
  );
};

export default GeoBanner;
