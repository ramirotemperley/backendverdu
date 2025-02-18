const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
