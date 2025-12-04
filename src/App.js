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
    const onLogin = (e) => {
      const received = e?.detail ?? localStorage.getItem("token");
      setToken(received);
      // cerrar modal si recibimos token válido
      if (received) setShowLogin(false);
    };

    const onLogout = () => {
      setToken(null);
      localStorage.removeItem("token");
      // opcional: cerrar modal si está abierto
      setShowLogin(false);
    };

    const onStorage = (ev) => {
      if (ev.key === "token") setToken(ev.newValue);
    };

    window.addEventListener("app:login", onLogin);
    window.addEventListener("app:logout", onLogout);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("app:login", onLogin);
      window.removeEventListener("app:logout", onLogout);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <>
      <Navbar onLoginClick={openLogin} token={token} />

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

      <OffersHome />
    </>
  );
}
