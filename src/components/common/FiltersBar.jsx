import React, { useState } from "react";

const FiltersBar = ({
  // Ya no recibimos 'search' ni 'setSearch' del padre para controlar el input
  selectedCommune,
  setSelectedCommune,
  communes,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedCompanyType,
  setSelectedCompanyType,
  companyTypes,
  onSearch, // Función que ejecutará la búsqueda final
}) => {
  
  // 1. ESTADO LOCAL: Solo vive aquí mientras escribes.
  // El padre (OffersHome) no se entera de esto todavía.
  const [localInput, setLocalInput] = useState("");

  // 2. Manejador del click en "Buscar"
  const handleSearchClick = () => {
    // Aquí enviamos el texto final al padre
    onSearch(localInput); 
  };

  // 3. Manejador para la tecla Enter (opcional, por comodidad)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  return (
    <section className="filters-bar">
      
      {/* Input de búsqueda */}
      <div className="filters-block">
        <label className="filters-label">Buscar</label>
        <input
          type="text"
          className="filters-input"
          placeholder="Buscar productos o tiendas…"
          
          /* Usamos el estado LOCAL */
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Filtro comuna (Estos sí pueden actualizarse directo porque son selectores) */}
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

      {/* Botón de Búsqueda */}
      <div className="filters-block" style={{ display: 'flex', alignItems: 'flex-end' }}>
        <button 
          className="filters-btn" 
          onClick={handleSearchClick}
          style={{
            height: '40px',
            padding: '0 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Buscar
        </button>
      </div>

    </section>
  );
};

export default FiltersBar;