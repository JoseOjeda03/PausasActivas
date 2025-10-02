// src/components/FiltroUsuario.jsx
import React, { useState } from "react";

const FiltroUsuario = ({ onFiltrar }) => {
  const [usuarioId, setUsuarioId] = useState("");

  const manejarSubmit = (e) => {
    e.preventDefault();
    onFiltrar(usuarioId);
  };

  return (
    <form onSubmit={manejarSubmit}>
      <label>
        Filtrar por Usuario:
        <input
          type="text"
          value={usuarioId}
          onChange={(e) => setUsuarioId(e.target.value)}
          placeholder="Ingrese ID de usuario"
        />
      </label>
      <button type="submit">Buscar</button>
      <button type="button" onClick={() => onFiltrar("")}>
        Limpiar
      </button>
    </form>
  );
};

export default FiltroUsuario;
