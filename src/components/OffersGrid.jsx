import React from "react";
import ProductCard from "./ProductCard";

const OffersGrid = ({ offers, favorites, onToggleFavorite, variant }) => {
  if (!offers || offers.length === 0) {
    return (
      <p className="offer-empty">
        No encontramos productos con estos filtros. Prueba cambiando la comuna
        o la categoría.
      </p>
    );
  }

  return (
    <div
      className={
        variant === "highlight" ? "offers-grid offers-grid-highlight" : "offers-grid"
      }
    >
      {offers.map((offer) => (
        <ProductCard
          key={offer.id}
          offer={offer}
          isFavorite={favorites.includes(offer.id)}
          onToggleFavorite={() => onToggleFavorite(offer.id)}
        />
      ))}
    </div>
  );
};

export default OffersGrid;
