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
      <div className="filters-bar-top">
        <div className="filters-logo">
          <span className="logo-dot">O</span>
          <span className="logo-text">ffer Todo</span>
        </div>

        <div className="filters-search">
          <input
            type="text"
            placeholder="Buscar por producto, tienda o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-summary">
          <span className="filters-summary-label">Comuna:</span>
          <span className="filters-summary-value">
            {selectedCommune || "Santiago Centro"}
          </span>
        </div>
      </div>

      <div className="filters-bar-bottom">
        <div className="filters-item">
          <label>Comuna</label>
          <select
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

        <div className="filters-item">
          <label>Categoría</label>
          <select
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

        <div className="filters-item">
          <label>Tipo de comercio</label>
          <select
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
      </div>
    </section>
  );
};

export default FiltersBar;
