import React, { useState } from "react";
import axios from "axios";

const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contraseña, setcontraseña] = useState("");
  const [error, setError] = useState("");

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
       console.log(correo);
      const res = await axios.post("http://localhost:5000/api/usuarios/login", {
        correo,
        contraseña,
      });

      const { usuario, token } = res.data;
     
      onLogin(usuario, token);
    } catch (err) {
      setError("Credenciales inválidas. Intenta nuevamente.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Iniciar Sesión
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">
            {error}
          </div>
        )}
        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Contraseña</label>
            <input
              type="password"
              value={contraseña}
              onChange={(e) => setcontraseña(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
