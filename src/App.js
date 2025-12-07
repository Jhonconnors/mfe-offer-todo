// src/App.jsx
import { useState, useEffect } from "react";
import Navbar from "./components/common/Navbar";
import OffersHome from "./pages/OffersHome";
import EncryptedLogin from "./components/EncryptedLogin";

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  useEffect(() => {
    // Cuando EncryptedLogin hace window.dispatchEvent(new CustomEvent("app:login", { detail: token }))
    const handleAppLogin = (e) => {
      const received = e?.detail ?? localStorage.getItem("token");
      setToken(received);
      // Cerrar modal si el token es válido
      if (received) setShowLogin(false);
    };

    const handleAppLogout = () => {
      setToken(null);
      localStorage.removeItem("token");
      // opcional: cerrar modal si está abierto
      setShowLogin(false);
    };

    // Si otro tab actualiza localStorage
    const handleStorage = (ev) => {
      if (ev.key === "token") {
        setToken(ev.newValue);
      }
    };

    window.addEventListener("app:login", handleAppLogin);
    window.addEventListener("app:logout", handleAppLogout);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("app:login", handleAppLogin);
      window.removeEventListener("app:logout", handleAppLogout);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);
  return (
    <>
      {/* Navbar recibe onLoginClick e isAuthenticated */}
      <Navbar onLoginClick={openLogin} isAuthenticated={!!token} />

      {/* Modal de login */}
      {showLogin && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 relative">
            <button
              type="button"
              onClick={closeLogin}
              className="absolute top-2 right-3 text-slate-400 hover:text-slate-600 text-xl leading-none"
            >
              ×
            </button>
            <EncryptedLogin />
          </div>
        </div>
      )}

      {/* CAMBIO AQUÍ: Pasamos la propiedad isAuthenticated a OffersHome */}
      <OffersHome isAuthenticated={!!token} />
    </>
  );
}
