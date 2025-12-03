import React, { useEffect, useState } from "react";

export default function Navbar({ onLoginClick, isAuthenticated }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const baseClasses = "navbar transition-colors duration-300";
  const loggedClasses = "bg-emerald-600 text-white shadow-md";
  const guestClasses = "bg-blue-700 text-white shadow-md";

  const navClasses = `${baseClasses} ${
    isAuthenticated ? loggedClasses : guestClasses
  }`;

  return (
    <nav className={navClasses}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / título */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-lg">
            {isAuthenticated ? "🛒" : "🔐"}
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm">
              {isAuthenticated
                ? "Offer Todo · Sesión activa"
                : "Encrypted Login"}
            </span>
            <span className="text-[11px] text-blue-100">
              {isAuthenticated
                ? "Vista personalizada del comparador"
                : "React + RSA Encryption"}
            </span>
          </div>
        </div>

        {/* Lado derecho: hora + botón */}
        <div className="flex items-center gap-3 text-xs">
          {isAuthenticated && (
            <span className="hidden sm:inline-flex items-center gap-1 text-blue-50">
              ⏰{" "}
              {time.toLocaleTimeString("es-CL", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}

          {!isAuthenticated && (
            <button
              type="button"
              onClick={onLoginClick}
              className="btn-strong-hover text-xs font-medium px-3 py-1.5 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white"
            >
              Ingresar
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
