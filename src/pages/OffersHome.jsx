// src/pages/OffersHome.jsx
import React, { useState, useMemo } from "react";
import FiltersBar from "../components/FiltersBar";
import OffersGrid from "../components/OffersGrid";
import CookiesBanner from "../components/CookiesBanner";
import GeoBanner from "../components/GeoBanner";

//  Datos mock para el front (luego se cambian por APIs reales)
const mockOffers = [
  {
    id: 1,
    name: "Leche Entera 1L",
    category: "Lácteos",
    companyType: "Supermercado",
    companyName: "Jumbo",
    commune: "Santiago Centro",
    price: 990,
    originalPrice: 1490,
    discountPercentage: 34,
    lastUpdate: "2025-11-15",
    stock: "Disponible",
    imageUrl: "",
    url: "#",
  },
  {
    id: 2,
    name: "Arroz 1kg",
    category: "Abarrotes",
    companyType: "Supermercado",
    companyName: "Lider",
    commune: "Ñuñoa",
    price: 1190,
    originalPrice: 1590,
    discountPercentage: 25,
    lastUpdate: "2025-11-16",
    stock: "Disponible",
    imageUrl: "",
    url: "#",
  },
  {
    id: 3,
    name: "Paracetamol 500mg 16 comp.",
    category: "Medicamentos",
    companyType: "Farmacia",
    companyName: "Cruz Verde",
    commune: "Santiago Centro",
    price: 1590,
    originalPrice: 1990,
    discountPercentage: 20,
    lastUpdate: "2025-11-16",
    stock: "Stock limitado",
    imageUrl: "",
    url: "#",
  },
  {
    id: 4,
    name: "Vitamina C 1g 10 comp.",
    category: "Suplementos",
    companyType: "Farmacia",
    companyName: "Salcobrand",
    commune: "Providencia",
    price: 2490,
    originalPrice: 3490,
    discountPercentage: 29,
    lastUpdate: "2025-11-14",
    stock: "Disponible",
    imageUrl: "",
    url: "#",
  },
  {
    id: 5,
    name: "Pan de molde 500g",
    category: "Panadería",
    companyType: "Supermercado",
    companyName: "Lider",
    commune: "Santiago Centro",
    price: 1290,
    originalPrice: 1590,
    discountPercentage: 19,
    lastUpdate: "2025-11-16",
    stock: "Disponible",
    imageUrl: "",
    url: "#",
  },
];

const OffersHome = () => {
  const [search, setSearch] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("Santiago Centro");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedCompanyType, setSelectedCompanyType] = useState("Todas");
  const [favorites, setFavorites] = useState([]);
  const [cookiesChoice, setCookiesChoice] = useState(null); // null | "accepted" | "rejected"
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | ok | denied | error

  // 🔍 valores únicos para filtros
  const communes = useMemo(
    () => ["Santiago Centro", ...new Set(mockOffers.map((o) => o.commune))],
    []
  );
  const categories = useMemo(
    () => ["Todas", ...new Set(mockOffers.map((o) => o.category))],
    []
  );
  const companyTypes = ["Todas", "Supermercado", "Farmacia"];

  //  filtrado según requisitos (buscar, comuna, categoría, tipo)
  const filteredOffers = useMemo(() => {
    return mockOffers.filter((offer) => {
      const matchesSearch =
        search.trim().length === 0 ||
        offer.name.toLowerCase().includes(search.toLowerCase()) ||
        offer.companyName.toLowerCase().includes(search.toLowerCase());

      const matchesCommune =
        !selectedCommune ||
        selectedCommune === "Todas" ||
        offer.commune === selectedCommune;

      const matchesCategory =
        selectedCategory === "Todas" || offer.category === selectedCategory;

      const matchesType =
        selectedCompanyType === "Todas" ||
        offer.companyType === selectedCompanyType;

      return matchesSearch && matchesCommune && matchesCategory && matchesType;
    });
  }, [search, selectedCommune, selectedCategory, selectedCompanyType]);

  //  gestión de favoritos solo en front
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  //  geolocalización (solo front – luego se conecta al backend/BFF)
  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        // Aquí idealmente el BFF traduce lat/long a comuna.
        // Por ahora solo simulamos que la comuna detectada es "Santiago Centro".
        setSelectedCommune("Santiago Centro");
        setGeoStatus("ok");
      },
      () => {
        setGeoStatus("denied");
        setSelectedCommune("Santiago Centro"); // comportamiento por defecto
      }
    );
  };

  return (
    <div className="offer-app">
      {/* Banner de geolocalización automática (CU04) */}
      <GeoBanner
        status={geoStatus}
        onUseGeolocation={handleUseGeolocation}
      />

      {/* Banner de cookies / privacidad (CU10, RNF18, RNF19) */}
      <CookiesBanner choice={cookiesChoice} setChoice={setCookiesChoice} />

      <main className="offer-main">
        {/* Barra de filtros tipo Knasta (buscar, comuna, categoría, tipo) */}
        <FiltersBar
          search={search}
          setSearch={setSearch}
          selectedCommune={selectedCommune}
          setSelectedCommune={setSelectedCommune}
          communes={communes}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          selectedCompanyType={selectedCompanyType}
          setSelectedCompanyType={setSelectedCompanyType}
          companyTypes={companyTypes}
        />

        {/* Contenedor tipo Knasta: destacados + listado */}
        <section className="offer-layout">
          <section className="offer-highlight">
            <h2>Ofertas destacadas cerca de ti</h2>
            <p className="offer-highlight-subtitle">
              Mostrando productos con mejor descuento por supermercado y
              farmacia. Máx. 5 por empresa.
            </p>
            {/* Para simplificar, usamos las mismas ofertas filtradas */}
            <OffersGrid
              offers={filteredOffers.slice(0, 8)}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              variant="highlight"
            />
          </section>

          <section className="offer-list-section">
            <div className="offer-list-header">
              <h3>Resultados</h3>
              <span>{filteredOffers.length} productos encontrados</span>
            </div>

            <OffersGrid
              offers={filteredOffers}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </section>

          <aside className="offer-sidebar">
            <div className="offer-sidebar-block">
              <h4>Favoritos ❤️</h4>
              {favorites.length === 0 ? (
                <p className="offer-sidebar-empty">
                  Aún no tienes productos marcados como favorito.
                </p>
              ) : (
                <ul className="offer-favorites-list">
                  {filteredOffers
                    .filter((o) => favorites.includes(o.id))
                    .map((o) => (
                      <li key={o.id}>
                        <span className="offer-fav-name">{o.name}</span>
                        <span className="offer-fav-store">{o.companyName}</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="offer-sidebar-block ads-block">
              <h4>Publicidad</h4>
              <div className="ad-placeholder">
                <span>Espacio para banner 300x250</span>
              </div>
              <p className="ad-note">
                La publicidad se adaptará a tu perfil si aceptas cookies.
              </p>
            </div>
          </aside>
        </section>
      </main>

      <footer className="offer-footer">
        <div className="offer-footer-links">
          <a href="#terminos">Términos y Condiciones</a>
          <a href="#privacidad">Política de Privacidad</a>
          <a href="#cookies">Aviso de Cookies</a>
        </div>
        <p className="offer-footer-copy">
          Offer Todo · Proyecto académico · No se realizan compras directas.
        </p>
      </footer>
    </div>
  );
};

export default OffersHome;
