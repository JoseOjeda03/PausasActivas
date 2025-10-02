// src/components/EventosTabla.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import FiltroUsuario from "./FiltroUsuario";
import FiltroFechas from "./FiltroFechas";

const EventosTabla = () => {
  const [eventos, setEventos] = useState([]);
  const [usuarioFiltro, setUsuarioFiltro] = useState("");
  const [fechasFiltro, setFechasFiltro] = useState({ desde: "", hasta: "" });
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarEventos = async () => {
    setCargando(true);
    try {
      const res = await axios.get("http://localhost:5000/api/postura");
      setEventos(res.data);
    } catch (err) {
      console.error("Error al cargar eventos:", err);
    } finally {
      setCargando(false);
    }
  };

  const filtrarPorUsuario = async (usuarioId) => {
    if (!usuarioId) return cargarEventos();
    setCargando(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/postura/usuario/${usuarioId}`
      );
      setEventos(res.data);
      setUsuarioFiltro(usuarioId);
    } catch (err) {
      console.error("Error al filtrar:", err);
    } finally {
      setCargando(false);
    }
  };

  const filtrarPorFechas = async (desde, hasta) => {
    if (!desde || !hasta) return;
    setCargando(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/postura/fechas?desde=${desde}&hasta=${hasta}`
      );
      setEventos(res.data);
      setFechasFiltro({ desde, hasta });
    } catch (err) {
      console.error("Error al filtrar:", err);
    } finally {
      setCargando(false);
    }
  };

  const eliminarEvento = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este evento?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/postura/${id}`);
      cargarEventos();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Eventos de Postura</h2>

      <div className="row mb-3">
        <div className="col-md-6">
          <FiltroUsuario onFiltrar={filtrarPorUsuario} />
        </div>
        <div className="col-md-6">
          <FiltroFechas onFiltrar={filtrarPorFechas} />
        </div>
      </div>

      {cargando ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status"></div>
          <p>Cargando eventos...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Usuario</th>
                <th>Postura</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Duración (seg)</th>
                <th>Alerta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No hay registros.
                  </td>
                </tr>
              ) : (
                eventos.map((evento) => (
                  <tr key={evento._id}>
                    <td>{evento.usuarioId}</td>
                    <td>{evento.postura}</td>
                    <td>{new Date(evento.horaInicio).toLocaleString()}</td>
                    <td>{new Date(evento.horaFin).toLocaleString()}</td>
                    <td>{evento.duracionSegundos}</td>
                    <td>{evento.alertaActivada ? "Sí" : "No"}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => setEventoSeleccionado(evento)}
                      >
                        Ver
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminarEvento(evento._id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {eventoSeleccionado && (
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Detalles del Evento</h5>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setEventoSeleccionado(null)}
            >
              Cerrar
            </button>
          </div>
          <div className="card-body">
            <p><strong>Usuario:</strong> {eventoSeleccionado.usuarioId}</p>
            <p><strong>Postura:</strong> {eventoSeleccionado.postura}</p>
            <p><strong>Inicio:</strong> {new Date(eventoSeleccionado.horaInicio).toLocaleString()}</p>
            <p><strong>Fin:</strong> {new Date(eventoSeleccionado.horaFin).toLocaleString()}</p>
            <p><strong>Duración:</strong> {eventoSeleccionado.duracionSegundos} seg</p>
            <p><strong>Alerta:</strong> {eventoSeleccionado.alertaActivada ? "Sí" : "No"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventosTabla;
