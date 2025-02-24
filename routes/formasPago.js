// routes/formasPago.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener todas las formas de pago
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM FormasPago');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las formas de pago', details: error.message });
  }
});

// Obtener una forma de pago por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM FormasPago WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Forma de pago no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la forma de pago', details: error.message });
  }
});

// Crear una nueva forma de pago
router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la forma de pago es obligatorio' });
    }
    const [result] = await pool.execute(
      'INSERT INTO FormasPago (nombre) VALUES (?)',
      [nombre]
    );
    res.status(201).json({
      message: 'Forma de pago creada correctamente',
      formaPago: { id: result.insertId, nombre },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la forma de pago', details: error.message });
  }
});

// Actualizar una forma de pago existente
router.put('/:id', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la forma de pago es obligatorio' });
    }
    const [result] = await pool.execute(
      'UPDATE FormasPago SET nombre = ? WHERE id = ?',
      [nombre, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Forma de pago no encontrada para actualizar' });
    }
    // Devolver la forma de pago actualizada
    const [updated] = await pool.query('SELECT * FROM FormasPago WHERE id = ?', [req.params.id]);
    res.json({ message: 'Forma de pago actualizada correctamente', formaPago: updated[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la forma de pago', details: error.message });
  }
});

// Eliminar una forma de pago
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM FormasPago WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Forma de pago no encontrada para eliminar' });
    }
    res.json({ message: 'Forma de pago eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la forma de pago', details: error.message });
  }
});

module.exports = router;
