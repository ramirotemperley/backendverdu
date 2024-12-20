// routes/ventas.js
const express = require('express');
const router = express.Router();
const Venta = require('../models/Venta');

console.log('Rutas de ventas cargadas');

// Ruta de Prueba
router.get('/test', (req, res) => {
  res.send('Ruta de prueba funcionando correctamente');
});

// POST /ventas → Crear una nueva venta
router.post('/', async (req, res) => {
  console.log('Datos recibidos en POST /ventas:', req.body);
  try {
    const venta = new Venta(req.body);
    await venta.save();
    res.status(201).json({ message: 'Venta creada correctamente', venta });
  } catch (err) {
    console.error('Error al crear la venta:', err);
    res.status(500).json({ error: 'Error al crear la venta', details: err.message });
  }
});

// GET /ventas → Obtener todas las ventas
router.get('/', async (req, res) => {
  try {
    const ventas = await Venta.find();
    res.status(200).json(ventas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
});

// GET /ventas/:id → Obtener una venta específica
router.get('/:id', async (req, res) => {
  const rawId = req.params.id;
  const id = rawId.trim(); // Limpiar el ID

  console.log('GET /ventas/:id llamada con id:', id);
  try {
    const venta = await Venta.findById(id);
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    res.status(200).json(venta);
  } catch (err) {
    console.error('Error al obtener la venta:', err);
    res.status(500).json({ error: 'Error al obtener la venta', details: err.message });
  }
});

// PUT /ventas/:id → Editar una venta existente
router.put('/:id', async (req, res) => {
  const rawId = req.params.id;
  const id = rawId.trim(); // Limpiar el ID

  console.log('PUT /ventas/:id llamada con id:', id);
  try {
    const datosVenta = req.body;
    const ventaActualizada = await Venta.findByIdAndUpdate(id, datosVenta, { new: true, runValidators: true });
    if (!ventaActualizada) {
      console.log('Venta no encontrada para actualizar');
      return res.status(404).json({ error: 'Venta no encontrada para actualizar' });
    }
    console.log('Venta actualizada correctamente:', ventaActualizada);
    res.json({ message: 'Venta actualizada correctamente', venta: ventaActualizada });
  } catch (err) {
    console.error('Error al actualizar la venta:', err);
    res.status(400).json({ error: 'Error al actualizar la venta', details: err.message });
  }
});

// DELETE /ventas/:id → Eliminar una venta existente
router.delete('/:id', async (req, res) => {
    const rawId = req.params.id;
    const id = rawId.trim(); // Limpiar el ID
  
    console.log('DELETE /ventas/:id llamada con id:', id);
    try {
      const ventaEliminada = await Venta.findByIdAndDelete(id);
      if (!ventaEliminada) {
        console.log('Venta no encontrada para eliminar');
        return res.status(404).json({ error: 'Venta no encontrada para eliminar' });
      }
      console.log('Venta eliminada correctamente:', ventaEliminada);
      res.json({ message: 'Venta eliminada correctamente' });
    } catch (err) {
      console.error('Error al eliminar la venta:', err);
      res.status(500).json({ error: 'Error al eliminar la venta', details: err.message });
    }
  });
  
// GET /ventas/estadisticas → Obtener estadísticas de ventas
router.get('/estadisticas', async (req, res) => {
  console.log('GET /ventas/estadisticas llamada');
  try {
    const totalDiario = await Venta.aggregate([
      { $group: { _id: null, total: { $sum: "$totalVenta" } } }
    ]);

    const ventasPorFormaPago = await Venta.aggregate([
      { $group: { _id: "$formaPago", total: { $sum: "$totalVenta" } } }
    ]);

    const ventasPorVendedor = await Venta.aggregate([
      { $group: { _id: "$vendedor", total: { $sum: "$totalVenta" } } }
    ]);

    const ventasPorArticulo = await Venta.aggregate([
      { $unwind: "$articulos" },
      { $group: { _id: "$articulos.nombre", total: { $sum: "$articulos.total" } } }
    ]);

    res.status(200).json({
      totalDiario: totalDiario[0]?.total || 0,
      ventasPorFormaPago,
      ventasPorVendedor,
      ventasPorArticulo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas', details: err.message });
  }
});

module.exports = router;
