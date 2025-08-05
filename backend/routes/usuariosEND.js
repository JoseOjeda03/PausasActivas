const express = require('express');
const router = express.Router();
const UsuarioEND = require('../models/UsuarioEND');

// 👉 Función para calcular la distancia euclidiana
function distanciaEuclidiana(arr1, arr2) {
  return Math.sqrt(arr1.reduce((acc, val, i) => acc + Math.pow(val - arr2[i], 2), 0));
}

// ✅ Registrar un nuevo usuario con múltiples embeddings
router.post('/', async (req, res) => {
  try {
    const { nombre, embedding } = req.body;

    if (!nombre || !embedding) {
      return res.status(400).json({ error: 'Nombre y embedding son obligatorios.' });
    }

    if (
      !Array.isArray(embedding) ||
      embedding.length === 0 ||
      !embedding.every(sub => Array.isArray(sub) && sub.length === 512 && sub.every(val => typeof val === 'number'))
    ) {
      return res.status(400).json({ error: 'El campo "embedding" debe ser una matriz de arrays numéricos de longitud 512.' });
    }

    const nuevoUsuario = new UsuarioEND({ nombre, embedding });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado correctamente.', usuario: nuevoUsuario });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

// ✅ Obtener todos los usuarios registrados
router.get('/', async (req, res) => {
  try {
    const usuarios = await UsuarioEND.find().sort({ fechaRegistro: -1 });
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios.' });
  }
});

// ✅ Verificar usuario por embedding (login facial)
router.post('/verificar', async (req, res) => {
  try {
    const { embedding } = req.body;

    if (!embedding || !Array.isArray(embedding) || embedding.length !== 512) {
      return res.status(400).json({ error: 'Debes enviar un embedding de 512 dimensiones.' });
    }

    const usuarios = await UsuarioEND.find();
    let usuarioCoincidente = null;
    let menorDistancia = Infinity;
    const UMBRAL = 0.6; // ajusta este valor según tu modelo

    usuarios.forEach(usuario => {
      usuario.embedding.forEach(eRegistrado => {
        const dist = distanciaEuclidiana(embedding, eRegistrado);
        if (dist < menorDistancia) {
          menorDistancia = dist;
          usuarioCoincidente = usuario;
        }
      });
    });

    if (menorDistancia < UMBRAL) {
      return res.json({
        mensaje: 'Usuario identificado correctamente.',
        usuario: {
          id: usuarioCoincidente._id,
          nombre: usuarioCoincidente.nombre,
          distancia: menorDistancia
        }
      });
    } else {
      return res.status(401).json({ error: 'Usuario no reconocido.' });
    }
  } catch (error) {
    console.error('Error en verificación facial:', error);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

module.exports = router;
