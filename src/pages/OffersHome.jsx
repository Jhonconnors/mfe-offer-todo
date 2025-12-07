import React, { useState, useMemo, useEffect } from "react";
// Eliminamos imports innecesarios para evitar errores
import FiltersBar from "../components/common/FiltersBar";
import CookiesBanner from "../components/common/CookiesBanner";
import GeoBanner from "../components/common/GeoBanner";
import { getOrRefreshJwt } from "../utils/authClient";

import "../styles/offersHome.css";
import "../styles/filtersBar.css";
import "../styles/cookiesBanner.css";

// -----------------------------------------------------------------------------
// TARJETA DE PRODUCTO INTERNA
// -----------------------------------------------------------------------------
const InternalProductCard = ({ offer, isFavorite, onToggleFavorite, isAuthenticated }) => {
  const handleClick = () => {
    window.location.href = `/producto/${offer.id}`;
  };

  return (
    <article
      onClick={handleClick}
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
        position: "relative",
        height: "100%",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        transition: "transform 0.2s, box-shadow 0.2s"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
      }}
    >
      {/* 1. IMAGEN */}
      <div style={{ width: "100%", height: "150px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "10px" }}>
        <img
          src={offer.image || "https://via.placeholder.com/150"}
          alt={offer.name}
          style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
        />
        {offer.discountPercentage > 0 && (
           <span style={{ position: "absolute", top: "10px", right: "10px", background: "#ef4444", color: "white", fontSize: "10px", padding: "2px 6px", borderRadius: "10px", fontWeight: "bold" }}>
             -{offer.discountPercentage}%
           </span>
        )}
      </div>

      {/* 2. TEXTO */}
      <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontSize: "10px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "bold", marginBottom: "5px" }}>
          {offer.companyName}
        </span>

        <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#334155", margin: "0 0 10px 0", lineHeight: "1.3" }}>
          {offer.name}
        </h3>

        <div style={{ marginBottom: "15px" }}>
          {offer.originalPrice > offer.price && (
            <p style={{ fontSize: "11px", textDecoration: "line-through", color: "#cbd5e1", margin: 0 }}>
              ${Number(offer.originalPrice).toLocaleString("es-CL")}
            </p>
          )}
          <p style={{ fontSize: "18px", fontWeight: "800", color: "#059669", margin: 0 }}>
            ${Number(offer.price).toLocaleString("es-CL")}
          </p>
        </div>
      </div>

      {/* 3. BOTONES */}
      <div style={{ width: "100%", display: "flex", gap: "8px", marginTop: "auto" }} onClick={(e) => e.stopPropagation()}>
        {isAuthenticated === true && (
          <button
            onClick={onToggleFavorite}
            style={{
              flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0",
              background: isFavorite ? "#fff1f2" : "white",
              color: isFavorite ? "#e11d48" : "#64748b",
              fontWeight: "bold", cursor: "pointer", fontSize: "14px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        )}
        <button
          onClick={handleClick}
          style={{
            flex: isAuthenticated ? 2 : 1,
            padding: "8px", borderRadius: "6px",
            background: "#f97316", color: "white",
            border: "none",
            fontSize: "12px", fontWeight: "bold",
            cursor: "pointer",
            display: "flex", justifyContent: "center", alignItems: "center"
          }}
        >
          Ver oferta
        </button>
      </div>
    </article>
  );
};

// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------------------------------

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  return (
    <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-1 flex items-center gap-2 font-mono font-bold text-sm">
      <span>🕒</span><span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  );
};

const OffersHome = ({ isAuthenticated }) => {
  const [search, setSearch] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("Santiago Centro");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedCompanyType, setSelectedCompanyType] = useState("Farmacia");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [cookiesChoice, setCookiesChoice] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle");

  const communes = useMemo(() => ["Santiago Centro", "Providencia", "Las Condes"], []);
  const categories = useMemo(() => ["Todas", "Medicamentos", "Despensa"], []);
  const companyTypes = ["Farmacia", "Supermercado"];

  const handleSearch = async (term) => {
    // BLOQUEO LÓGICO EXTRA (Por seguridad)
    if (cookiesChoice === null) {
        alert("Debes aceptar o rechazar las cookies para realizar búsquedas.");
        return;
    }

    setSearch(term);
    if (!term || term.trim().length === 0) { alert("Por favor escribe un producto para buscar"); return; }
    setLoading(true); setError(null); setProducts([]); setShowFavorites(false);

    const BFF_BASE_URL = process.env.REACT_APP_BFF_API_URL;
    let url = selectedCompanyType === "Farmacia"
      ? `${BFF_BASE_URL}/v1/farmacy/medicament/product?q=${term}&comuna=${selectedCommune}`
      : `${BFF_BASE_URL}/v1/supermarkets/product?q=${term}&comuna=${selectedCommune}`;

    try {
      const token = await getOrRefreshJwt(cookiesChoice, BFF_BASE_URL);
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      const data = await response.json();
      if (data.items && Array.isArray(data.items)) {
        setProducts(data.items.map((item, index) => ({
          id: `api-${index}-${Date.now()}`,
          name: item.nombre, description: item.descripcion, price: item.precioUnitario ? item.precioUnitario.valor : 0, currency: item.precioUnitario ? item.precioUnitario.moneda : "CLP", image: item.imagen || "https://via.placeholder.com/150", companyType: selectedCompanyType, companyName: selectedCompanyType === "Farmacia" ? "Farmacia" : "Supermercado", url: item.farmaciaUrl || item.supermercadoUrl || "#", commune: selectedCommune
        })));
      } else { setProducts([]); }
    } catch (err) { console.error(err); setError("No se pudo conectar con el servidor."); } finally { setLoading(false); }
  };

  const toggleFavorite = (id) => { setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]); };
  const handleUseGeolocation = () => {
    if (cookiesChoice === null) return; // Bloquear geolocalización también
    if (!navigator.geolocation) { setGeoStatus("error"); return; }
    navigator.geolocation.getCurrentPosition(() => { setSelectedCommune("Santiago Centro"); setGeoStatus("ok"); }, () => { setGeoStatus("denied"); setSelectedCommune("Santiago Centro"); });
  };

  const displayedProducts = showFavorites ? products.filter(p => favorites.includes(p.id)) : products;

  return (
    <div className={`min-h-screen ${isAuthenticated ? 'bg-slate-50' : 'bg-white'}`} style={{ position: 'relative' }}>

      {/* ==================================================================== */}
      {/* 1. EL TELÓN DE FONDO (BLOQUEO) */}
      {/* Si no ha elegido cookies (es null), mostramos este div negro */}
      {/* ==================================================================== */}
      {cookiesChoice === null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo oscuro semitransparente
            zIndex: 9998, // Muy alto, pero menor que el banner de cookies (9999)
            backdropFilter: 'blur(4px)', // Efecto borroso profesional
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
           {/* Texto opcional para guiar al usuario */}
           <div style={{ paddingBottom: '100px' }}>
              🔒 Por favor, configura las cookies para continuar.
           </div>
        </div>
      )}

      {/* 2. EL BANNER DE COOKIES */}
      {/* Asegúrate de que tu CookiesBanner tenga un z-index alto (ej: 9999) */}
      <div style={{ position: 'relative', zIndex: 9999 }}>
        <CookiesBanner choice={cookiesChoice} setChoice={setCookiesChoice} />
      </div>

      <GeoBanner status={geoStatus} onUseGeolocation={handleUseGeolocation} />

      <div className="flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">
        <aside className="w-full md:w-64 flex-shrink-0 border-r border-slate-200 bg-white min-h-screen">
          <div className="p-4 border-b border-slate-100"><h3 className="text-slate-700 font-bold text-lg">Filtros</h3></div>
          <div className="p-2">
            <FiltersBar selectedCommune={selectedCommune} setSelectedCommune={setSelectedCommune} communes={communes} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} categories={categories} selectedCompanyType={selectedCompanyType} setSelectedCompanyType={setSelectedCompanyType} companyTypes={companyTypes} onSearch={handleSearch} />
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-slate-200 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">{showFavorites ? "Mis Favoritos ❤️" : "Resultados"}</h2>
              <p className="text-slate-500 mt-1">{loading ? "Buscando..." : showFavorites ? `${displayedProducts.length} guardados` : `${products.length} productos disponibles`}</p>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <button onClick={() => setShowFavorites(!showFavorites)} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border ${showFavorites ? "bg-rose-500 text-white border-rose-600 shadow-md" : "bg-white text-rose-500 border-rose-200 hover:bg-rose-50"}`}>
                  {showFavorites ? "Ver Todos" : "❤️ Ver Favoritos"}
                </button>
              )}
              {isAuthenticated && <DigitalClock />}
            </div>
          </div>

          {loading && <div className="flex justify-center items-center py-20 text-slate-400">Cargando...</div>}
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-bold">{error}</div>}

          {/* GRILLA INTEGRADA */}
          {displayedProducts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', width: '100%' }}>
              {displayedProducts.map((offer) => (
                <InternalProductCard
                  key={offer.id}
                  offer={offer}
                  isFavorite={favorites.includes(offer.id)}
                  onToggleFavorite={() => toggleFavorite(offer.id)}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          ) : (
             !loading && !error && (
                <div className="p-10 text-center text-slate-500">
                  <h3 className="text-xl font-bold">No encontramos productos 🔍</h3>
                  <p>Intenta cambiando los filtros.</p>
                </div>
             )
          )}
        </main>
      </div>
    </div>
  );
};

export default OffersHome;