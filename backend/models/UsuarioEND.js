const mongoose = require('mongoose');

const UsuarioEndSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 512;
      },
      message: 'El embedding debe contener exactamente 512 valores.'
    }
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UsuarioEND', UsuarioEndSchema);
