// src/components/common/FiltersBar.jsx

import React from "react";

const FiltersBar = ({
  search,
  setSearch,
  selectedCommune,
  setSelectedCommune,
  communes,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedCompanyType,
  setSelectedCompanyType,
  companyTypes,
}) => {
  return (
    <section className="filters-bar">

      {/* Input de búsqueda */}
      <div className="filters-block">
        <label className="filters-label">Buscar</label>
        <input
          type="text"
          className="filters-input"
          placeholder="Buscar productos o tiendas…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filtro comuna */}
      <div className="filters-block">
        <label className="filters-label">Comuna</label>
        <select
          className="filters-select"
          value={selectedCommune}
          onChange={(e) => setSelectedCommune(e.target.value)}
        >
          {communes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro categoría */}
      <div className="filters-block">
        <label className="filters-label">Categoría</label>
        <select
          className="filters-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro tipo comercio */}
      <div className="filters-block">
        <label className="filters-label">Tipo de comercio</label>
        <select
          className="filters-select"
          value={selectedCompanyType}
          onChange={(e) => setSelectedCompanyType(e.target.value)}
        >
          {companyTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};

export default FiltersBar;
