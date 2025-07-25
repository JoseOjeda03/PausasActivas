const express = require('express');
const router = express.Router();
const SesionPostura = require('../models/SesionPostura');

// Crear una nueva sesión
router.post('/', async (req, res) => {
    try {
        const {
            usuario,
            inicio_sesion,
            fin_sesion,
            trabajo_total_segundos,
            descanso_total_segundos,
            ciclos_trabajo,
            ciclos_descanso
        } = req.body;

        const nuevaSesion = new SesionPostura({
            usuario,
            inicio_sesion,
            fin_sesion,
            trabajo_total_segundos,
            descanso_total_segundos,
            ciclos_trabajo,
            ciclos_descanso
        });

        await nuevaSesion.save();
        res.status(201).json({ mensaje: 'Sesión guardada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar la sesión.' });
    }
});

// Obtener todas las sesiones
router.get('/', async (req, res) => {
    try {
        const sesiones = await SesionPostura.find().sort({ inicio_sesion: -1 });
        res.json(sesiones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las sesiones.' });
    }
});

// Obtener sesiones por nombre de usuario
router.get('/usuario/:usuario', async (req, res) => {
    try {
        const sesiones = await SesionPostura.find({ usuario: req.params.usuario }).sort({ inicio_sesion: -1 });
        res.json(sesiones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las sesiones del usuario.' });
    }
});

// Obtener sesiones por rango de fechas
router.get('/fechas', async (req, res) => {
    try {
        const { desde, hasta } = req.query;

        if (!desde || !hasta) {
            return res.status(400).json({ error: 'Debe proporcionar las fechas "desde" y "hasta".' });
        }

        const sesiones = await SesionPostura.find({
            inicio_sesion: {
                $gte: new Date(desde),
                $lte: new Date(hasta)
            }
        }).sort({ inicio_sesion: -1 });

        res.json(sesiones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las sesiones por fechas.' });
    }
});

// Obtener sesión por ID
router.get('/:id', async (req, res) => {
    try {
        const sesion = await SesionPostura.findById(req.params.id);

        if (!sesion) {
            return res.status(404).json({ error: 'Sesión no encontrada.' });
        }

        res.json(sesion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la sesión.' });
    }
});

// Eliminar una sesión por ID
router.delete('/:id', async (req, res) => {
    try {
        const resultado = await SesionPostura.findByIdAndDelete(req.params.id);

        if (!resultado) {
            return res.status(404).json({ error: 'Sesión no encontrada.' });
        }

        res.json({ mensaje: 'Sesión eliminada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la sesión.' });
    }
});

// Actualizar sesión por ID
router.put('/:id', async (req, res) => {
    try {
        const {
            usuario,
            inicio_sesion,
            fin_sesion,
            trabajo_total_segundos,
            descanso_total_segundos,
            ciclos_trabajo,
            ciclos_descanso
        } = req.body;

        const sesionActualizada = await SesionPostura.findByIdAndUpdate(
            req.params.id,
            {
                usuario,
                inicio_sesion,
                fin_sesion,
                trabajo_total_segundos,
                descanso_total_segundos,
                ciclos_trabajo,
                ciclos_descanso
            },
            { new: true, runValidators: true }
        );

        if (!sesionActualizada) {
            return res.status(404).json({ error: 'Sesión no encontrada.' });
        }

        res.json({ mensaje: 'Sesión actualizada correctamente.', sesion: sesionActualizada });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la sesión.' });
    }
});

module.exports = router;
