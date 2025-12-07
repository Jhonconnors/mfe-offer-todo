import React from "react";
// IMPORTANTE: Cambiamos la importación para usar el archivo NUEVO
import TarjetaNueva from "./TarjetaNueva";

const OffersGrid = ({ offers, favorites, onToggleFavorite, isAuthenticated }) => {
  if (!offers || offers.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        <h3>No encontramos productos 🔍</h3>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      {/* Grilla de 4 columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {offers.map((offer) => (
          // Usamos el componente NUEVO
          <TarjetaNueva
            key={offer.id}
            offer={offer}
            isFavorite={favorites.includes(offer.id)}
            onToggleFavorite={() => onToggleFavorite(offer.id)}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </div>
  );
};

export default OffersGrid;