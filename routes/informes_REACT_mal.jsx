// routes/informes.js  (BACK-END, CommonJS)
const express = require('express');
const router  = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  const { desde, hasta, clave } = req.query;
  if (clave !== 'verdu123') {
    return res.status(403).json({ error: 'Clave incorrecta' });
  }
  if (!desde || !hasta) {
    return res.status(400).json({ error: 'Debe especificar \"desde\" y \"hasta\"' });
  }

  try {
    const [[{ total }]] = await pool.query(
      'SELECT SUM(totalVenta) AS total FROM Ventas WHERE DATE(fecha) BETWEEN ? AND ?',
      [desde, hasta]
    );

    const [[{ efectivo }]] = await pool.query(
      'SELECT SUM(totalVenta) AS efectivo FROM Ventas WHERE formaPagoId = 1 AND DATE(fecha) BETWEEN ? AND ?',
      [desde, hasta]
    );

    const [[{ credito }]] = await pool.query(
      'SELECT SUM(totalVenta) AS credito FROM Ventas WHERE formaPagoId = 3 AND DATE(fecha) BETWEEN ? AND ?',
      [desde, hasta]
    );

    const [empleados] = await pool.query(
      `SELECT u.nombre, SUM(v.totalVenta) AS total
       FROM Ventas v
       JOIN Usuarios u ON v.vendedorId = u.id
       WHERE DATE(v.fecha) BETWEEN ? AND ?
       GROUP BY v.vendedorId`,
      [desde, hasta]
    );

    res.json({ total: total || 0, efectivo: efectivo || 0, credito: credito || 0, empleados });
  } catch (err) {
    console.error('Error en /informes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
