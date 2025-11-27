// src/pages/OffersHome.jsx
import React, { useState, useMemo } from "react";
import FiltersBar from "../components/common/FiltersBar";
import OffersGrid from "../components/offers/OffersGrid";
import CookiesBanner from "../components/common/CookiesBanner";
import GeoBanner from "../components/common/GeoBanner";
import { mockOffers } from "../components/offers/mock/mockOffers"; // Fallback por si la API falla

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

  const [products, setProducts] = useState([]); // Datos de la API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [favorites, setFavorites] = useState([]);
  const [cookiesChoice, setCookiesChoice] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle");

  // --- Datos estáticos para los filtros ---
  const communes = useMemo(() => ["Santiago Centro", "Providencia", "Las Condes"], []);
  const categories = useMemo(() => ["Todas", "Medicamentos", "Despensa"], []);
  const companyTypes = ["Farmacia", "Supermercado", "Todas"];

  // --- LÓGICA PRINCIPAL: SWITCH DE APIS ---
  const handleSearch = async (term) => {
    // 1. Actualizamos el estado search con lo que vino del FiltersBar
    setSearch(term);

    if (!term || term.trim().length === 0) {
      alert("Por favor escribe un producto para buscar");
      return;
    }

    setLoading(true);
    setError(null);
    setProducts([]); // Limpiar la grilla visualmente

    // Usamos process.env para acceder a lo que definimos en el archivo .env
    const FARMACY_BASE_URL = process.env.REACT_APP_FARMACY_API_URL;
    const SUPERMARKET_BASE_URL = process.env.REACT_APP_SUPERMARKET_API_URL;

    let url = "";

    // 3. DECISIÓN DE API SEGÚN TIPO DE COMERCIO
    if (selectedCompanyType === "Farmacia") {
      // Llama al Controller de Farmacia
      url = `${FARMACY_BASE_URL}/v1/farmacy/medicament/product?q=${term}&comuna=${selectedCommune}`;
    
    } else if (selectedCompanyType === "Supermercado") {
      // Llama al Controller de Supermercado
      url = `${SUPERMARKET_BASE_URL}/v1/supermarkets/product?q=${term}&comuna=${selectedCommune}`;
    
    } else {
      alert("Para buscar en la API, por favor selecciona 'Farmacia' o 'Supermercado' en el filtro.");
      setLoading(false);
      return;
    }

    try {
      console.log(`Buscando en: ${selectedCompanyType} -> URL: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor (Backend no disponible o error 500)");
      }

      const data = await response.json();
      console.log("Datos recibidos:", data);

      // 4. Transformar los datos del Backend al formato del Frontend
      // Basado en el contrato Swagger:
      // - items: array
      // - nombre, descripcion, imagen
      // - precioUnitario: { valor, moneda }
      // - farmaciaUrl O supermercadoUrl
      
      if (data.items && Array.isArray(data.items)) {
        
        const mappedProducts = data.items.map((item, index) => ({
          // Generamos un ID único ya que el contrato no devuelve ID
          id: `api-${index}-${Date.now()}`,
          
          name: item.nombre, 
          description: item.descripcion, // Agregamos descripción por si la usas en el futuro
          
          // Acceso seguro al precio unitario según contrato
          price: item.precioUnitario ? item.precioUnitario.valor : 0,
          currency: item.precioUnitario ? item.precioUnitario.moneda : "CLP",
          
          image: item.imagen || "https://via.placeholder.com/150", 
          
          companyType: selectedCompanyType,
          companyName: selectedCompanyType === "Farmacia" ? "Farmacia" : "Supermercado",
          
          // La URL cambia de nombre según si es farmacia o super (según contrato)
          url: item.farmaciaUrl || item.supermercadoUrl || "#", 
          
          commune: selectedCommune
        }));

        setProducts(mappedProducts);
      } else {
        setProducts([]); // Lista vacía si no hay items
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("No se pudo conectar con el servidor. Verifica que el Backend Java esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  // --- Manejo de favoritos ---
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // --- Geolocalización ---
  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setSelectedCommune("Santiago Centro"); 
        setGeoStatus("ok");
      },
      () => {
        setGeoStatus("denied");
        setSelectedCommune("Santiago Centro");
      }
    );
  };

  return (
    <div className="offers-container">
      <GeoBanner status={geoStatus} onUseGeolocation={handleUseGeolocation} />
      <CookiesBanner choice={cookiesChoice} setChoice={setCookiesChoice} />

      <div className="offers-layout">
        
        {/* SIDEBAR CON FILTROS */}
        <aside className="offers-sidebar">
          <h3>Filtros</h3>
          <FiltersBar
            // No pasamos 'search' ni 'setSearch' para no actualizar en cada tecla
            // Solo pasamos los valores necesarios para los selects
            selectedCommune={selectedCommune}
            setSelectedCommune={setSelectedCommune}
            communes={communes}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            selectedCompanyType={selectedCompanyType}
            setSelectedCompanyType={setSelectedCompanyType}
            companyTypes={companyTypes}
            onSearch={handleSearch} /* <--- Aquí conectamos el botón con la función */
          />
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="offers-content">
          <div className="offers-header">
            <h2>Resultados</h2>
            <span>
              {loading ? "Cargando..." : `${products.length} productos encontrados`}
            </span>
          </div>

          {/* Mensajes de error o carga */}
          {loading && <div className="loading-msg">Buscando productos...</div>}
          {error && <div className="error-msg" style={{color: 'red', margin: '1rem 0'}}>{error}</div>}
          
          {/* Si no hay búsqueda ni datos, mostramos mensaje inicial */}
          {!loading && !error && products.length === 0 && search === "" && (
             <div className="info-msg">Usa los filtros y presiona Buscar.</div>
          )}

          {/* GRID DE PRODUCTOS */}
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
        <p className="offer-footer-copy">
          Offer Todo · Proyecto académico
        </p>
      </footer>
    </div>
  );
};

export default OffersHome;