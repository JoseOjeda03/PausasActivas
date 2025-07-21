const express = require("express");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuarios");

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "clave_secreta";

// Registro
router.post("/registro", async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: "Usuario registrado correctamente" });
  } catch (err) {
    res.status(400).json({ error: "Error al registrar", detalles: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { correo, contraseña } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    const esValida = await usuario.compararContraseña(contraseña);
    if (!esValida) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: usuario._id }, SECRET, { expiresIn: "2h" });

    res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre } });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;
