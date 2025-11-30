import React, { useState, useMemo } from "react";
import FiltersBar from "../components/FiltersBar";
import OffersGrid from "../components/OffersGrid";
import CookiesBanner from "../components/CookiesBanner";
import GeoBanner from "../components/GeoBanner";

// Datos mock
const mockOffers = [
  // aquí irían tus productos reales; por ahora está vacío con comentario
];

const OffersHome = ({ isAuthenticated }) => {
  const [search, setSearch] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("Santiago Centro");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedCompanyType, setSelectedCompanyType] = useState("Todas");
  const [favorites, setFavorites] = useState([]);
  const [cookiesChoice, setCookiesChoice] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle");

  // fondo dinámico según login
  const mainBgClass = isAuthenticated
    ? "offer-main offer-main-auth"
    : "offer-main";

  // valores únicos y filtrado
  const communes = useMemo(
    () => ["Santiago Centro", ...new Set(mockOffers.map((o) => o.commune))],
    []
  );

  const categories = useMemo(
    () => ["Todas", ...new Set(mockOffers.map((o) => o.category))],
    []
  );

  const companyTypes = ["Todas", "Supermercado", "Farmacia"];

  const filteredOffers = useMemo(() => {
    return mockOffers.filter((offer) => {
      const text = `${offer.name} ${offer.companyName}`.toLowerCase();
      const q = search.toLowerCase().trim();

      const matchesSearch = q.length === 0 || text.includes(q);
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
    <div className="offer-app">
      <GeoBanner status={geoStatus} onUseGeolocation={handleUseGeolocation} />
      <CookiesBanner choice={cookiesChoice} setChoice={setCookiesChoice} />

      <main className={mainBgClass}>
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

        <section className="offer-layout">
          <section className="offer-highlight">
            <h2>Ofertas destacadas cerca de ti</h2>
            <p className="offer-highlight-subtitle">
              Mostrando productos con mejor descuento por supermercado y
              farmacia.
            </p>

            <OffersGrid
              offers={filteredOffers.slice(0, 8)}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              variant="highlight"
              isAuthenticated={isAuthenticated}
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
              isAuthenticated={isAuthenticated}
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
                        <span className="offer-fav-store">
                          {o.companyName}
                        </span>
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
