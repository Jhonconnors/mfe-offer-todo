import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ offer, isFavorite, onToggleFavorite, isAuthenticated }) {
  const navigate = useNavigate();

  // --- DIAGNÓSTICO ---
  // Esto escribirá en la consola (F12) cada vez que se dibuje una tarjeta
  // Si sale "undefined", el puente está roto. Si sale false, está funcionando.
  // console.log(`Producto: ${offer.name} | Logueado:`, isAuthenticated);

  return (
    <article
      onClick={() => navigate(`/producto/${offer.id}`)}
      className="bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer p-4 flex flex-col items-center text-center h-full relative"
    >
      {/* 1. IMAGEN */}
      <div className="w-full h-40 flex items-center justify-center mb-4 bg-white rounded-lg relative">
        <img
          src={offer.image || "https://via.placeholder.com/150"}
          alt={offer.name}
          className="max-h-full max-w-full object-contain mx-auto"
        />
        {offer.discountPercentage > 0 && (
           <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">
             -{offer.discountPercentage}%
           </span>
        )}
      </div>

      {/* 2. DATOS */}
      <div className="w-full flex-1 flex flex-col items-center">
        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-1">
          {offer.companyName}
        </span>

        <h3 className="text-sm font-bold text-slate-800 mb-2 leading-tight w-full line-clamp-2 min-h-[40px]">
          {offer.name}
        </h3>

        <div className="mb-4 w-full">
          {offer.originalPrice > offer.price && (
            <p className="text-xs text-slate-400 line-through m-0">
              ${Number(offer.originalPrice).toLocaleString("es-CL")}
            </p>
          )}
          <p className="text-xl font-extrabold text-emerald-600 m-0">
            ${Number(offer.price).toLocaleString("es-CL")}
          </p>
        </div>

        <div className="text-[11px] text-slate-500 mb-4 flex items-center justify-center gap-1">
          <span>📍</span> {offer.commune}
        </div>

        {/* 3. BOTONES - LA PRUEBA FINAL */}
        <div className="w-full flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>

            {/* Si isAuthenticated es TRUE, mostramos el botón. Si es FALSE, SE OCULTA. */}
            {isAuthenticated === true && (
                <button
                    onClick={onToggleFavorite}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-colors ${isFavorite ? "bg-rose-50 text-rose-500 border-rose-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                >
                    {/* CAMBIO VISUAL: Si ves estos iconos, el código se actualizó */}
                    {isFavorite ? "❤️" : "🤍"}
                </button>
            )}

            <a
                href={offer.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                // Si no hay botón de favorito, este botón se estira (w-full)
                className={`
                   ${isAuthenticated ? "flex-[2]" : "w-full"}
                   py-2 rounded-lg bg-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-sm hover:bg-orange-600 transition-colors
                `}
            >
                Ver oferta
            </a>
        </div>
      </div>
    </article>
  );
}