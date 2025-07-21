const mongoose = require('mongoose');

const EventoPosturaSchema = new mongoose.Schema({
    usuarioId: {
        type: String,
        required: true
    },
    postura: {
        type: String,
        enum: ['sentado', 'de_pie'],
        required: true
    },
    horaInicio: {
        type: Date,
        required: true
    },
    horaFin: {
        type: Date,
        required: true
    },
    duracionSegundos: {
        type: Number,
        required: true
    },
    alertaActivada: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('EventoPostura', EventoPosturaSchema);
