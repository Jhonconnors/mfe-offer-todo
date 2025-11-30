import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductCard({
  offer,
  isFavorite,
  onToggleFavorite,
  isAuthenticated,
}) {
  const navigate = useNavigate();
  const goToDetail = () => navigate(`/producto/${offer.id}`);

  const tagColor =
    offer.companyType === "Farmacia"
      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
      : "bg-blue-100 text-blue-700 border-blue-300";

  return (
    <article
      onClick={goToDetail}
      className="
        bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-200 
        hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer
        flex flex-col animate-fadeIn
      "
    >
      {/* Imagen */}
      <div className="relative w-full h-40 bg-slate-100 flex items-center justify-center">
        <img
          src={
            offer.image ||
            "https://via.placeholder.com/300x200?text=Producto"
          }
          alt={offer.name}
          className="w-full h-full object-cover"
        />

        {/* Badge de descuento */}
        <span
          className="
            absolute top-3 right-3 bg-orange-500 text-white px-3 py-1
            text-[11px] rounded-full font-semibold shadow-md
            animate-pop
          "
        >
          🔥 -{offer.discountPercentage}%
        </span>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col gap-3">
        {/* Empresa y Tipo */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            {offer.companyName}
          </span>
          <span
            className={`px-2 py-1 rounded-full border text-[10px] ${tagColor}`}
          >
            ⭐ {offer.companyType}
          </span>
        </div>

        {/* Nombre */}
        <h3 className="text-sm font-bold text-slate-900 leading-tight">
          {offer.name}
        </h3>

        {/* Categoria */}
        <p className="text-[11px] text-slate-500">{offer.category}</p>

        {/* Precio */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-emerald-600 flex items-center gap-1">
              ${offer.price.toLocaleString("es-CL")}
              <span className="text-lg animate-bounce-slow">🛒</span>
            </p>
            <p className="text-[11px] text-slate-400 line-through">
              ${offer.originalPrice.toLocaleString("es-CL")}
            </p>
          </div>
        </div>

        {/* Línea separadora */}
        <div className="w-full h-[1px] bg-slate-200"></div>

        {/* Información detalle */}
        <div className="space-y-1 text-xs text-slate-600">
          <p>
            <span className="font-medium">Comuna:</span> {offer.commune}
          </p>
          <p>
            <span className="font-medium">Stock:</span>{" "}
            <span
              className={`${
                offer.stock === "Stock limitado"
                  ? "text-rose-600 font-semibold"
                  : ""
              }`}
            >
              {offer.stock || "No informado"}
            </span>
          </p>
          <p className="text-[10px] text-slate-400">
            Actualizado: {offer.lastUpdate}
          </p>
        </div>

        {/* Botones → evitar navegación */}
        <div
          className="flex gap-2 mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ⭐ Favorito (solo si está autenticado) */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                alert("Debes iniciar sesión para agregar favoritos.");
                return;
              }
              onToggleFavorite();
            }}
            className={`
              btn
              flex-1 px-3 py-1.5 rounded-full text-[11px] border 
              transition-all duration-300 flex items-center justify-center gap-1
              ${
                isFavorite
                  ? "bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200 animate-heartbeat"
                  : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
              }
            `}
          >
            ⭐ {isFavorite ? "Quitar" : "Favorito"}
          </button>

          {/* Ir a tienda */}
          <a
            href={offer.url}
            target="_blank"
            rel="noreferrer"
            className="
              btn btn-strong-hover
              flex-1 text-center px-3 py-1.5 rounded-full
              bg-orange-500 text-white text-[11px]
              hover:bg-orange-600 hover:-translate-y-1
              transition-all duration-300 shadow-sm flex items-center justify-center gap-1
            "
          >
            Ir a tienda 🚀
          </a>
        </div>
      </div>
    </article>
  );
}
