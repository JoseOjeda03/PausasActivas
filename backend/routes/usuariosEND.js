const express = require('express');
const router = express.Router();
const UsuarioEND = require('../models/UsuarioEND');

// Registrar nuevo usuario con embedding
router.post('/registrar', async (req, res) => {
  try {
    const { nombre, email, embedding } = req.body;

    // Validaciones
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio y debe ser una cadena válida.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'El correo electrónico no es válido.' });
    }

    if (!embedding || !Array.isArray(embedding) || embedding.length !== 512) {
      return res.status(400).json({ error: 'El embedding debe ser un arreglo de 512 valores numéricos.' });
    }

    if (!embedding.every(num => typeof num === 'number')) {
      return res.status(400).json({ error: 'Todos los valores del embedding deben ser numéricos.' });
    }

    // Verificar si el email ya existe
    const existe = await UsuarioEND.findOne({ email });
    if (existe) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo electrónico.' });
    }

    const nuevoUsuario = new UsuarioEND({ nombre, email, embedding });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

module.exports = router;
