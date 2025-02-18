const express = require('express');
const router = express.Router();
const FormaPago = require('../models/FormaPago'); // Asegúrate de tener el modelo correctamente importado

// Obtener todas las formas de pago
router.get('/', async (req, res) => {
  try {
    const formasPago = await FormaPago.find();
    res.status(200).json(formasPago);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las formas de pago', details: error.message });
  }
});

// Obtener una forma de pago por ID
router.get('/:id', async (req, res) => {
  try {
    const formaPago = await FormaPago.findById(req.params.id);
    if (!formaPago) {
      return res.status(404).json({ error: 'Forma de pago no encontrada' });
    }
    res.status(200).json(formaPago);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la forma de pago', details: error.message });
  }
});

// Crear una nueva forma de pago
router.post('/', async (req, res) => {
    console.log('Body recibido:', req.body); // Log del body recibido
    try {
      const nuevaFormaPago = new FormaPago(req.body); // Crear el nuevo documento
      console.log('Forma de pago antes de guardar:', nuevaFormaPago); // Verificar el documento antes de guardar
      await nuevaFormaPago.save(); // Guardar en la base de datos
      res.status(201).json({ message: 'Forma de pago creada correctamente', formaPago: nuevaFormaPago });
    } catch (error) {
      console.error('Error al crear la forma de pago:', error); // Log del error
      res.status(500).json({ error: 'Error al crear la forma de pago', details: error.message });
    }
  });
  
// Actualizar una forma de pago existente
router.put('/:id', async (req, res) => {
  try {
    const formaPagoActualizada = await FormaPago.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!formaPagoActualizada) {
      return res.status(404).json({ error: 'Forma de pago no encontrada para actualizar' });
    }
    res.json({ message: 'Forma de pago actualizada correctamente', formaPago: formaPagoActualizada });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la forma de pago', details: error.message });
  }
});

// Eliminar una forma de pago
router.delete('/:id', async (req, res) => {
  try {
    const formaPagoEliminada = await FormaPago.findByIdAndDelete(req.params.id);
    if (!formaPagoEliminada) {
      return res.status(404).json({ error: 'Forma de pago no encontrada para eliminar' });
    }
    res.json({ message: 'Forma de pago eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la forma de pago', details: error.message });
  }
});

module.exports = router;
