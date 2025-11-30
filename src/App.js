import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import OffersHome from "./pages/OffersHome";
import ProductDetail from "./pages/ProductDetail";
import EncryptedLogin from "./components/EncryptedLogin";

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  return (
    <>
      <Navbar onLoginClick={openLogin} isAuthenticated={isAuthenticated} />

      {showLogin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 relative">
            <button
              type="button"
              onClick={closeLogin}
              className="absolute top-2 right-3 text-slate-500 text-xl hover:text-slate-700"
            >
              ×
            </button>
            <EncryptedLogin onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={<OffersHome isAuthenticated={isAuthenticated} />}
        />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route
          path="*"
          element={<OffersHome isAuthenticated={isAuthenticated} />}
        />
      </Routes>
    </>
  );
}
