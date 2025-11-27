// src/pages/OffersHome.jsx
import React, { useState, useMemo } from "react";
import FiltersBar from "../components/common/FiltersBar";
import OffersGrid from "../components/offers/OffersGrid";
import CookiesBanner from "../components/common/CookiesBanner";
import GeoBanner from "../components/common/GeoBanner";
import { mockOffers } from "../components/offers/mock/mockOffers";

import "../styles/offersHome.css";
import "../styles/filtersBar.css";
import "../styles/cookiesBanner.css";

const OffersHome = () => {
  const [search, setSearch] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("Santiago Centro");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedCompanyType, setSelectedCompanyType] = useState("Todas");
  const [favorites, setFavorites] = useState([]);
  const [cookiesChoice, setCookiesChoice] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle");

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
    <div className="offers-container">

      {/* Banners */}
      <GeoBanner status={geoStatus} onUseGeolocation={handleUseGeolocation} />
      <CookiesBanner choice={cookiesChoice} setChoice={setCookiesChoice} />

      {/* Layout general */}
      <div className="offers-layout">

        {/* === SIDEBAR === */}
        <aside className="offers-sidebar">
          <h3>Filtros</h3>

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
        </aside>

        {/* === CONTENIDO PRINCIPAL === */}
        <main className="offers-content">

          {/* Encabezado */}
          <div className="offers-header">
            <h2>Resultados</h2>
            <span>{filteredOffers.length} productos encontrados</span>
          </div>

          {/* Grid */}
          <OffersGrid
            offers={filteredOffers}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </main>
      </div>

      {/* Footer */}
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
