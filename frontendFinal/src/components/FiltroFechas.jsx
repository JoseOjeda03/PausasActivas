// src/components/FiltroFechas.jsx
import React, { useState } from "react";

const FiltroFechas = ({ onFiltrar }) => {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const manejarSubmit = (e) => {
    e.preventDefault();
    onFiltrar(desde, hasta);
  };

  return (
    <form onSubmit={manejarSubmit}>
      <label>
        Desde:
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
      </label>
      <label>
        Hasta:
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
      </label>
      <button type="submit">Filtrar Fechas</button>
    </form>
  );
};

export default FiltroFechas;
