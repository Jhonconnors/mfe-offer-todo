// src/components/offers/ProductCard.jsx
import React from "react";
import "../../styles/ProductCard.css";

const ProductCard = ({ offer, isFavorite, onToggleFavorite }) => {
  const {
    name,
    category,
    companyName,
    companyType,
    commune,
    price,
    originalPrice,
    discountPercentage,
    stock,
    lastUpdate,
    url,
  } = offer;

  return (
    <article className="product-card">
      {/* Cuadro de imagen (placeholder por ahora) */}
      <div className="product-card-image">
        {/* Cuando tengas la URL real, reemplazas el div por <img src={offer.imageUrl} .../> */}
        <div className="image-placeholder" />
      </div>

      {/* Información principal */}
      <div className="product-card-info">
        {discountPercentage && (
          <span className="product-badge-discount">-{discountPercentage}%</span>
        )}

        <p className="product-company">{companyName}</p>
        <h4 className="product-name">{name}</h4>
        <p className="product-category">{category}</p>

        <div className="product-price-block">
          <span className="product-price">
            ${price.toLocaleString("es-CL")}
          </span>
          <span className="product-price-old">
            ${originalPrice.toLocaleString("es-CL")}
          </span>
        </div>

        <p className="product-commune">Comuna: {commune}</p>
        <p className="product-stock">{stock || "Stock no informado"}</p>
        <p className="product-update">Actualizado: {lastUpdate}</p>

        {/* Botones tipo MediMarket */}
        <div className="product-card-buttons">
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`btn-fav ${isFavorite ? "active" : ""}`}
          >
            {isFavorite ? "Quitar favorito" : "Agregar a favoritos"}
          </button>

          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="btn-shop"
          >
            Ir a la tienda
          </a>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
