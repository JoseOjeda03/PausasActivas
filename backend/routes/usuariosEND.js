const express = require('express');
const router = express.Router();
const UsuarioEND = require('../models/UsuarioEND');

// Registrar un nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, embedding } = req.body;

    if (!nombre || !embedding) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    if (!Array.isArray(embedding) || embedding.length !== 512) {
      return res.status(400).json({ error: 'El embedding debe tener exactamente 512 números.' });
    }

    const nuevoUsuario = new UsuarioEND({ nombre, embedding });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado correctamente.', usuario: nuevoUsuario });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await UsuarioEND.find().sort({ fechaRegistro: -1 });
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios.' });
  }
});

module.exports = router;
