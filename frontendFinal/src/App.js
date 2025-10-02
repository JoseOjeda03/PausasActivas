import React, { useEffect, useState } from "react";
import axios from "axios";
import EventosTabla from "./components/EventosTabla";
import Layout from "./components/Layout";
import Login from "./components/Login";

function App() {
  const [eventos, setEventos] = useState([]);
  const [usuario, setUsuario] = useState(null);

  // Verificar si hay token guardado y recuperar sesión
  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");
    if (token && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
      cargarEventos(token);
    }
  }, []);

  // Cargar eventos con token
  const cargarEventos = async (token) => {
    try {
      const res = await axios.get("http://localhost:5000/api/postura", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEventos(res.data);
    } catch (err) {
      console.error("Error al cargar eventos:", err);
    }
  };

  // Función al iniciar sesión correctamente
  const manejarLogin = (usuario, token) => {
    setUsuario(usuario);
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    cargarEventos(token);
  };

  const manejarLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    setEventos([]);
  };

  if (!usuario) return <Login onLogin={manejarLogin} />;

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Bienvenido, {usuario.nombre}</h2>
        <button onClick={manejarLogout}>Cerrar sesión</button>
      </div>
      <EventosTabla eventos={eventos} />
    </Layout>
  );
}

export default App;
