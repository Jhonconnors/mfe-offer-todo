import React from "react";
import "../../styles/ProductCard.css";

const ProductCard = ({ offer, isFavorite, onToggleFavorite }) => {
  // Extraemos SOLO los datos que existen en el contrato Swagger y el mapeo de OffersHome
  const {
    id,
    name,          // Viene de 'nombre'
    description,   // Viene de 'descripcion'
    companyName,   // Asignado en el Frontend (Farmacia/Supermercado)
    commune,       // Asignado en el Frontend
    price,         // Viene de 'precioUnitario.valor'
    image,         // Viene de 'imagen'
    url,           // Viene de 'farmaciaUrl' o 'supermercadoUrl'
  } = offer;

  // Formateador seguro para pesos chilenos
  const formattedPrice = (value) => {
    if (value === undefined || value === null) return "$0";
    return value.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  };

  return (
    <article className="product-card">
      
      {/* 1. Imagen (URL Real del Backend) */}
      <div className="product-card-image">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "contain" }} 
            onError={(e) => { e.target.style.display = 'none'; }} // Ocultar si falla
          />
        ) : (
          <div className="image-placeholder" />
        )}
      </div>

      {/* 2. Información del Producto */}
      <div className="product-card-info">
        
        {/* Nombre de la tienda (Farmacia o Supermercado) */}
        <p className="product-company">{companyName}</p>
        
        {/* Nombre del Producto */}
        <h4 className="product-name" title={name}>{name}</h4>
        
        {/* Descripción (Opcional, solo si el backend la envía) */}
        {description && (
          <p className="product-description" style={{ fontSize: "0.85rem", color: "#666", margin: "5px 0" }}>
            {description.length > 60 ? description.substring(0, 60) + "..." : description}
          </p>
        )}

        {/* Precio Único (El backend no envía precio oferta vs original, solo uno) */}
        <div className="product-price-block">
          <span className="product-price">
            {formattedPrice(price)}
          </span>
        </div>

        {/* Ubicación */}
        <p className="product-commune">Comuna: {commune}</p>

        {/* 3. Botones de Acción */}
        <div className="product-card-buttons">
          <button
            type="button"
            onClick={() => onToggleFavorite(id)}
            className={`btn-fav ${isFavorite ? "active" : ""}`}
          >
            {isFavorite ? "Quitar" : "Favorito"}
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