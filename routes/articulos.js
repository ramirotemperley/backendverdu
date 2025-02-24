const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * GET /articulos
 * Obtiene todos los registros de la tabla "articulos".
 * Supongamos que las columnas son: id, codigo, nombre
 */
router.get('/', async (req, res) => {
  try {
    // Aquí seleccionamos los campos: id, codigo, nombre
    const [rows] = await pool.query('SELECT id, codigo, nombre FROM articulos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener los artículos',
      details: error.message,
    });
  }
});

/**
 * GET /articulos/:id
 * Obtiene un artículo específico por su ID.
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, codigo, nombre FROM articulos WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener el artículo',
      details: error.message,
    });
  }
});

/**
 * POST /articulos
 * Crea un nuevo artículo.
 * Debes mandar en el body (JSON):
 * {
 *   "codigo": "ABC123",
 *   "nombre": "Mi Artículo"
 * }
 */
router.post('/', async (req, res) => {
  const { codigo, nombre } = req.body;
  try {
    // Insertamos en la tabla (codigo, nombre)
    const [result] = await pool.query(
      'INSERT INTO articulos (codigo, nombre) VALUES (?, ?)',
      [codigo, nombre]
    );
    
    // result.insertId trae el ID del nuevo registro
    res.status(201).json({
      articulo: {
        id: result.insertId,
        codigo,
        nombre
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al crear el artículo',
      details: error.message,
    });
  }
});

/**
 * PUT /articulos/:id
 * Actualiza un artículo existente.
 * Ejemplo body (JSON):
 * {
 *   "codigo": "XYZ999",
 *   "nombre": "Nombre actualizado"
 * }
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre } = req.body;

  try {
    // Verificamos si el artículo existe
    const [existeArticulo] = await pool.query('SELECT id FROM articulos WHERE id = ?', [id]);
    if (existeArticulo.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    // Realizamos el UPDATE
    await pool.query(
      'UPDATE articulos SET codigo = ?, nombre = ? WHERE id = ?',
      [codigo, nombre, id]
    );

    // Devolvemos el artículo actualizado
    res.json({
      articulo: {
        id: Number(id),
        codigo,
        nombre
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al actualizar el artículo',
      details: error.message,
    });
  }
});

/**
 * DELETE /articulos/:id
 * Elimina un artículo por su ID.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Primero verificamos si existe
    const [existeArticulo] = await pool.query('SELECT id FROM articulos WHERE id = ?', [id]);
    if (existeArticulo.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    // Eliminamos el registro
    await pool.query('DELETE FROM articulos WHERE id = ?', [id]);

    res.json({ message: 'Artículo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({
      error: 'Error al eliminar el artículo',
      details: error.message,
    });
  }
});

module.exports = router;
