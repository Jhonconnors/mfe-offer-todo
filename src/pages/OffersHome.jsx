// src/pages/OffersHome.jsx
import React, { useState, useMemo } from "react";
import FiltersBar from "../components/common/FiltersBar";
import OffersGrid from "../components/offers/OffersGrid";
import CookiesBanner from "../components/common/CookiesBanner";
import GeoBanner from "../components/common/GeoBanner";

import "../styles/offersHome.css";
import "../styles/filtersBar.css";
import "../styles/cookiesBanner.css";

const OffersHome = () => {
  // --- Estados ---
  const [search, setSearch] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("Santiago Centro");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  
  // IMPORTANTE: Este estado decide a qué API llamar
  const [selectedCompanyType, setSelectedCompanyType] = useState("Farmacia"); 

  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [favorites, setFavorites] = useState([]);
  const [cookiesChoice, setCookiesChoice] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle");

  // --- Datos estáticos ---
  const communes = useMemo(() => ["Santiago Centro", "Providencia", "Las Condes"], []);
  const categories = useMemo(() => ["Todas", "Medicamentos", "Despensa"], []);
  const companyTypes = ["Farmacia", "Supermercado", "Todas"];

  // --- LÓGICA PRINCIPAL ---
  const handleSearch = async (term) => {
    setSearch(term);

    if (!term || term.trim().length === 0) {
      alert("Por favor escribe un producto para buscar");
      return;
    }

    setLoading(true);
    setError(null);
    setProducts([]); 

    const FARMACY_BASE_URL = process.env.REACT_APP_FARMACY_API_URL;
    const SUPERMARKET_BASE_URL = process.env.REACT_APP_SUPERMARKET_API_URL;

    try {
      // ============================================================
      // CASO 1: SUPERMERCADO (Tu nuevo Backend Java)
      // ============================================================
      if (selectedCompanyType === "Supermercado") {
        const url = `${SUPERMARKET_BASE_URL}/v1/supermarkets/product?q=${term}&comuna=${selectedCommune}`;
        console.log("🚀 [Frontend] Llamando a Supermercado:", url);

        const response = await fetch(url);
        
        if (!response.ok) {
           throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        console.log("📦 [Frontend] Respuesta Supermercado RAW:", data);

        // Mapeo específico para tu Backend de Supermercados
        if (data.items && Array.isArray(data.items)) {
          const mappedProducts = data.items.map((item, index) => ({
            id: `super-${index}-${Date.now()}`,
            name: item.nombre, // Backend dice 'nombre'
            description: item.descripcion || "Producto de Supermercado",
            // Usamos ?. para evitar crash si precioUnitario viene null
            price: item.precioUnitario?.valor || 0, 
            currency: item.precioUnitario?.moneda || "CLP",
            image: item.imagen || "https://via.placeholder.com/150",
            companyType: "Supermercado",
            // Detectamos si es Lider o Santa Isabel por la URL
            companyName: item.supermercadoUrl?.includes("lider") ? "Lider" : "Santa Isabel",
            url: item.supermercadoUrl || "#",
            commune: selectedCommune
          }));
          
          setProducts(mappedProducts);
        } else {
          setProducts([]);
        }

      // ============================================================
      // CASO 2: FARMACIA (Tu backend original)
      // ============================================================
      } else if (selectedCompanyType === "Farmacia") {
        const url = `${FARMACY_BASE_URL}/v1/farmacy/medicament/product?q=${term}&comuna=${selectedCommune}`;
        console.log("💊 [Frontend] Llamando a Farmacia:", url);

        const response = await fetch(url);
        if (!response.ok) throw new Error("Error en API Farmacia");
        
        const data = await response.json();

        // Asumiendo que Farmacia devuelve la misma estructura 'items'
        // Si tu API de farmacia es diferente, ajusta este mapeo
        if (data.items && Array.isArray(data.items)) {
             const mappedProducts = data.items.map((item, index) => ({
                id: `farm-${index}-${Date.now()}`,
                name: item.nombre,
                description: item.descripcion,
                price: item.precioUnitario?.valor || 0,
                currency: "CLP",
                image: item.imagen,
                companyType: "Farmacia",
                companyName: "Farmacia",
                url: item.farmaciaUrl,
                commune: selectedCommune
             }));
             setProducts(mappedProducts);
        } else {
            setProducts([]);
        }

      } else {
        alert("Selecciona Farmacia o Supermercado");
        setLoading(false);
      }

    } catch (err) {
      console.error("❌ Error en handleSearch:", err);
      setError("No se pudo obtener la información. Revisa la consola (F12) para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => { setSelectedCommune("Santiago Centro"); setGeoStatus("ok"); },
      () => { setGeoStatus("denied"); setSelectedCommune("Santiago Centro"); }
    );
  };

  return (
    <div className="offers-container">
      <GeoBanner status={geoStatus} onUseGeolocation={handleUseGeolocation} />
      <CookiesBanner choice={cookiesChoice} setChoice={setCookiesChoice} />

      <div className="offers-layout">
        <aside className="offers-sidebar">
          <h3>Filtros</h3>
          <FiltersBar
            selectedCommune={selectedCommune}
            setSelectedCommune={setSelectedCommune}
            communes={communes}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            selectedCompanyType={selectedCompanyType}
            setSelectedCompanyType={setSelectedCompanyType}
            companyTypes={companyTypes}
            onSearch={handleSearch}
          />
        </aside>

        <main className="offers-content">
          <div className="offers-header">
            <h2>Resultados</h2>
            <span>{loading ? "Cargando..." : `${products.length} productos encontrados`}</span>
          </div>

          {loading && <div className="loading-msg">⏳ Buscando ofertas...</div>}
          {error && <div className="error-msg" style={{color: 'red', margin: '1rem 0'}}>{error}</div>}
          
          {!loading && !error && products.length === 0 && search === "" && (
             <div className="info-msg">Usa los filtros y presiona Buscar.</div>
          )}

          <OffersGrid
            offers={products}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </main>
      </div>

      <footer className="offer-footer">
        <div className="offer-footer-links">
          <a href="#terminos">Términos y Condiciones</a>
          <a href="#privacidad">Política de Privacidad</a>
          <a href="#cookies">Aviso de Cookies</a>
        </div>
        <p className="offer-footer-copy">Offer Todo · Proyecto académico</p>
      </footer>
    </div>
  );
};

export default OffersHome;