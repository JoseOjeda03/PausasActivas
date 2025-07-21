const express = require('express');
const router = express.Router();
const EventoPostura = require('../models/EventoPostura');

// Crear un nuevo evento
router.post('/', async (req, res) => {
    try {
        const { usuarioId, postura, horaInicio, horaFin, duracionSegundos, alertaActivada } = req.body;

        const nuevoEvento = new EventoPostura({
            usuarioId,
            postura,
            horaInicio,
            horaFin,
            duracionSegundos,
            alertaActivada
        });

        await nuevoEvento.save();
        res.status(201).json({ mensaje: 'Evento guardado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar el evento.' });
    }
});

// Obtener todos los eventos
router.get('/', async (req, res) => {
    try {
        const eventos = await EventoPostura.find().sort({ horaInicio: -1 });
        res.json(eventos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los eventos.' });
    }
});

// Obtener eventos por usuarioId
router.get('/usuario/:usuarioId', async (req, res) => {
    try {
        const eventos = await EventoPostura.find({ usuarioId: req.params.usuarioId }).sort({ horaInicio: -1 });
        res.json(eventos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los eventos del usuario.' });
    }
});

// Obtener eventos por rango de fechas
router.get('/fechas', async (req, res) => {
    try {
        const { desde, hasta } = req.query;

        if (!desde || !hasta) {
            return res.status(400).json({ error: 'Debe proporcionar las fechas "desde" y "hasta".' });
        }

        const eventos = await EventoPostura.find({
            horaInicio: {
                $gte: new Date(desde),
                $lte: new Date(hasta)
            }
        }).sort({ horaInicio: -1 });

        res.json(eventos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los eventos por fechas.' });
    }
});

// Obtener un evento específico por ID
router.get('/:id', async (req, res) => {
    try {
        const evento = await EventoPostura.findById(req.params.id);

        if (!evento) {
            return res.status(404).json({ error: 'Evento no encontrado.' });
        }

        res.json(evento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el evento.' });
    }
});

// Eliminar un evento por ID
router.delete('/:id', async (req, res) => {
    try {
        const resultado = await EventoPostura.findByIdAndDelete(req.params.id);

        if (!resultado) {
            return res.status(404).json({ error: 'Evento no encontrado.' });
        }

        res.json({ mensaje: 'Evento eliminado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el evento.' });
    }
});
// Actualizar un evento por ID
router.put('/:id', async (req, res) => {
    try {
        const { usuarioId, postura, horaInicio, horaFin, duracionSegundos, alertaActivada } = req.body;

        const eventoActualizado = await EventoPostura.findByIdAndUpdate(
            req.params.id,
            {
                usuarioId,
                postura,
                horaInicio,
                horaFin,
                duracionSegundos,
                alertaActivada
            },
            { new: true, runValidators: true }
        );

        if (!eventoActualizado) {
            return res.status(404).json({ error: 'Evento no encontrado.' });
        }

        res.json({ mensaje: 'Evento actualizado correctamente.', evento: eventoActualizado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el evento.' });
    }
});
module.exports = router;
