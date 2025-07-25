const mongoose = require('mongoose');

const SesionPosturaSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: true
  },
  inicio_sesion: {
    type: Date,
    required: true
  },
  fin_sesion: {
    type: Date,
    required: true
  },
  trabajo_total_segundos: {
    type: Number,
    required: true
  },
  descanso_total_segundos: {
    type: Number,
    required: true
  },
  ciclos_trabajo: {
    type: Number,
    required: true
  },
  ciclos_descanso: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('SesionPostura', SesionPosturaSchema);
