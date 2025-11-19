import { useState } from "react";
import Navbar from "./components/Navbar";
import OffersHome from "./pages/OffersHome";
import EncryptedLogin from "./components/EncryptedLogin";

export default function App() {
  const [showLogin, setShowLogin] = useState(false);

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  return (
    <>
      {/* Barra superior siempre visible */}
      <Navbar onLoginClick={openLogin} />

      {/* Modal de login (solo si showLogin === true) */}
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

            {/* Contenido del login */}
            <EncryptedLogin />
          </div>
        </div>
      )}

      {/* Página de ofertas siempre visible */}
      <OffersHome />
    </>
  );
}
