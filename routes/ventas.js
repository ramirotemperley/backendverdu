// routes/ventas.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Crear una venta nueva
router.post('/', async (req, res) => {
  // Ejemplo de body:
  // {
  //   "totalVenta": 100.5,
  //   "vendedorId": 1,
  //   "formaPagoId": 2,
  //   "articulos": [
  //       { "articuloId": 1, "cantidad": 2, "precio": 30, "total": 60 },
  //       { "articuloId": 2, "cantidad": 1, "precio": 40.5, "total": 40.5 }
  //   ]
  // }
  try {
    const { totalVenta, vendedorId, formaPagoId, articulos } = req.body;

    // 1) Insertamos la venta en la tabla Ventas
    const [ventaResult] = await pool.execute(
      `INSERT INTO Ventas (totalVenta, vendedorId, formaPagoId, fecha)
       VALUES (?, ?, ?, NOW())`,
      [totalVenta, vendedorId || null, formaPagoId || null]
    );
    
    const ventaId = ventaResult.insertId;

    // 2) Insertamos artículos en VentaArticulos
    //    Solo si en el body viene un array de articulos
    if (Array.isArray(articulos)) {
      for (const item of articulos) {
        const { articuloId, cantidad, precio, total } = item;
        await pool.execute(
          `INSERT INTO VentaArticulos (ventaId, articuloId, cantidad, precio, total)
           VALUES (?, ?, ?, ?, ?)`,
          [ventaId, articuloId, cantidad, precio, total]
        );
      }
    }

    res.status(201).json({ message: 'Venta creada correctamente', ventaId });
  } catch (error) {
    console.error('Error al crear la venta:', error);
    res.status(500).json({ error: 'Error al crear la venta', details: error.message });
  }
});

// Obtener todas las ventas
router.get('/', async (req, res) => {
  try {
    // Podemos traer la info básica de la venta
    const [ventas] = await pool.query('SELECT * FROM Ventas');
    res.status(200).json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
});

// Obtener una venta específica con sus artículos
router.get('/:id', async (req, res) => {
  const ventaId = req.params.id;
  try {
    // 1) Traemos la venta
    const [ventaRows] = await pool.query('SELECT * FROM Ventas WHERE id = ?', [ventaId]);
    if (ventaRows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    const venta = ventaRows[0];

    // 2) Traemos los artículos de esa venta
    const [articulosRows] = await pool.query(
      'SELECT * FROM VentaArticulos WHERE ventaId = ?',
      [ventaId]
    );

    // 3) Combinamos en la respuesta
    venta.articulos = articulosRows;
    res.status(200).json(venta);
  } catch (error) {
    console.error('Error al obtener la venta:', error);
    res.status(500).json({ error: 'Error al obtener la venta', details: error.message });
  }
});

// Actualizar una venta existente
router.put('/:id', async (req, res) => {
  const ventaId = req.params.id;
  // Suponemos que en el body puedes actualizar totalVenta, vendedorId, formaPagoId y la lista de artículos
  try {
    const { totalVenta, vendedorId, formaPagoId, articulos } = req.body;

    // 1) Actualizar la venta principal
    const [result] = await pool.execute(
      `UPDATE Ventas
       SET totalVenta = ?, vendedorId = ?, formaPagoId = ?
       WHERE id = ?`,
      [totalVenta, vendedorId || null, formaPagoId || null, ventaId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Venta no encontrada para actualizar' });
    }

    // 2) Si hay un array de artículos en el body, actualizar "VentaArticulos"
    //    Podemos primero eliminar los artículos antiguos y luego insertar los nuevos
    if (Array.isArray(articulos)) {
      // Eliminar artículos antiguos
      await pool.execute('DELETE FROM VentaArticulos WHERE ventaId = ?', [ventaId]);
      // Insertar los nuevos
      for (const item of articulos) {
        const { articuloId, cantidad, precio, total } = item;
        await pool.execute(
          `INSERT INTO VentaArticulos (ventaId, articuloId, cantidad, precio, total)
           VALUES (?, ?, ?, ?, ?)`,
          [ventaId, articuloId, cantidad, precio, total]
        );
      }
    }

    // 3) Devolver la venta actualizada con sus artículos
    const [updatedVentaRows] = await pool.query('SELECT * FROM Ventas WHERE id = ?', [ventaId]);
    const [updatedArticulos] = await pool.query(
      'SELECT * FROM VentaArticulos WHERE ventaId = ?',
      [ventaId]
    );
    const ventaActualizada = updatedVentaRows[0];
    ventaActualizada.articulos = updatedArticulos;

    res.json({ message: 'Venta actualizada correctamente', venta: ventaActualizada });
  } catch (error) {
    console.error('Error al actualizar la venta:', error);
    res.status(500).json({ error: 'Error al actualizar la venta', details: error.message });
  }
});

// Eliminar una venta
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM Ventas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Venta no encontrada para eliminar' });
    }
    // Dado que VentaArticulos tiene ON DELETE CASCADE (si lo configuraste),
    // los artículos asociados se eliminarán automáticamente.
    res.json({ message: 'Venta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la venta:', error);
    res.status(500).json({ error: 'Error al eliminar la venta', details: error.message });
  }
});

module.exports = router;
