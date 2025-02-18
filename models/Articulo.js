const mongoose = require('mongoose');

const ArticuloSchema = new mongoose.Schema({
  codigo: { type: String, required: true }, // Asegúrate de que el campo código esté aquí
  nombre: { type: String, required: true },
  precio: { type: Number, required: false, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
});

module.exports = mongoose.model('Articulo', ArticuloSchema);
