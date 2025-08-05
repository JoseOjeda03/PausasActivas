const mongoose = require('mongoose');

const UsuarioENDSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  embedding: {
    type: [[Number]], // Matriz de arrays de números
    validate: {
      validator: function(arr) {
        return Array.isArray(arr) && arr.every(subArr => Array.isArray(subArr) && subArr.length === 512);
      },
      message: 'Cada embedding debe ser un array de 512 números.'
    },
    required: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UsuarioEND', UsuarioENDSchema);
