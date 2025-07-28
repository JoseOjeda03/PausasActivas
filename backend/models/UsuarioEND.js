const mongoose = require('mongoose');

const UsuarioENDSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true,
    validate: {
      validator: arr => Array.isArray(arr) && arr.length === 512,
      message: 'El embedding debe contener exactamente 512 valores numéricos.'
    }
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UsuarioEND', UsuarioENDSchema);
