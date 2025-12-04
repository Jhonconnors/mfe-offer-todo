import React from "react";
import ProductCard from "./ProductCard";

<<<<<<< Updated upstream:src/components/OffersGrid.jsx
<<<<<<< Updated upstream:src/components/OffersGrid.jsx
const OffersGrid = ({
  offers,
  favorites,
  onToggleFavorite,
  variant,
  isAuthenticated,
}) => {
=======
const OffersGrid = ({ offers, favorites, onToggleFavorite, variant, isAuthenticated }) => {
>>>>>>> Stashed changes:src/components/offers/OffersGrid.jsx
=======
const OffersGrid = ({ offers, favorites, onToggleFavorite, variant, isAuthenticated }) => {
>>>>>>> Stashed changes:src/components/offers/OffersGrid.jsx
  if (!offers || offers.length === 0) {
    return (
      <p className="offer-empty">
        No encontramos productos con estos filtros. Prueba cambiando la comuna
        o la categoría.
      </p>
    );
  }

  const gridClass =
    variant === "highlight"
      ? "offers-grid offers-grid-highlight"
      : "offers-grid";

  return (
    <div className={gridClass}>
      {offers.map((offer) => (
        <ProductCard
          key={offer.id}
          offer={offer}
          isFavorite={favorites.includes(offer.id)}
          onToggleFavorite={() => onToggleFavorite(offer.id)}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
};

export default OffersGrid;
