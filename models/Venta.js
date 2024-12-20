// models/Venta.js
const mongoose = require('mongoose');

const ArticuloSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precioUnitario: { type: Number, required: true, min: 0 },
  peso: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const VentaSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  vendedor: { type: String, required: true },
  formaPago: { type: String, required: true },
  articulos: { 
    type: [ArticuloSchema], 
    required: true, 
    validate: [arrayLimit, '{PATH} debe tener al menos un artículo'] 
  },
  totalVenta: { type: Number, required: true, min: 0 }
});

// Función de validación para asegurarse de que hay al menos un artículo
function arrayLimit(val) {
  return val.length > 0;
}

module.exports = mongoose.model('Venta', VentaSchema);
