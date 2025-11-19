import React from "react";

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
    lastUpdate,
    stock,
    url,
  } = offer;

  const tagColor =
    companyType === "Farmacia"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-blue-50 text-blue-700";

  return (
    <article className="bg-slate-50 border border-transparent hover:border-orange-400 rounded-xl px-3 py-3 flex flex-col gap-1.5 shadow-xs hover:shadow-md transition">
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="font-semibold text-slate-900">{companyName}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tagColor}`}
        >
          {companyType}
        </span>
      </div>

      <h4 className="text-sm font-semibold text-slate-900 leading-snug">
        {name}
      </h4>
      <p className="text-[11px] text-slate-500">{category}</p>

      <div className="flex items-center justify-between mt-1">
        <div className="flex flex-col">
          <span className="text-base font-bold text-emerald-600">
            ${price.toLocaleString("es-CL")}
          </span>
          <span className="text-[11px] text-slate-400 line-through">
            ${originalPrice.toLocaleString("es-CL")}
          </span>
        </div>
        <span className="text-xs font-bold bg-orange-500 text-white rounded-full px-2 py-0.5">
          -{discountPercentage}%
        </span>
      </div>

      <p className="text-[11px] text-slate-500 mt-1">
        Comuna: <span className="font-medium text-slate-700">{commune}</span>
      </p>
      <p className="text-[11px] text-slate-500">
        {stock || "Stock no informado"}
      </p>
      <p className="text-[11px] text-slate-400">
        Actualizado:{" "}
        <span className="font-medium text-slate-500">{lastUpdate}</span>
      </p>

      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`flex-1 rounded-full px-2 py-1 text-[11px] font-medium border transition ${
            isFavorite
              ? "bg-rose-100 text-rose-700 border-rose-200"
              : "bg-slate-200 text-slate-800 border-slate-300"
          }`}
        >
          {isFavorite ? "Quitar favorito" : "Agregar a favoritos"}
        </button>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-full px-2 py-1 text-[11px] font-medium bg-orange-500 hover:bg-orange-600 text-white text-center"
        >
          Ir a la tienda
        </a>
      </div>
    </article>
  );
};

export default ProductCard;
