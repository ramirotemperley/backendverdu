// routes/informes.js  (solo Node/Express)
const express = require('express');
const router  = express.Router();
const { pool } = require('../config/database');

/*
  GET /informes?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&clave=verdu123

  Respuesta:
    {
      total       : 12345,
      efectivo    : 10000,
      credito     : 2345,
      cantVentas  : 42,                     // ← NUEVO
      empleados   : [
        { nombre:'Ramiro', ventas:27, total:51500 },
        …
      ]
    }
*/
router.get('/', async (req, res) => {
  const { desde, hasta, clave } = req.query;

  /* ── validaciones ─────────────────────────────────────────────── */
  if (clave !== 'verdu123')
    return res.status(403).json({ error: 'Clave incorrecta' });

  if (!desde || !hasta)
    return res.status(400).json({ error: 'Debe especificar "desde" y "hasta"' });

  try {
    /* ── totales globales ───────────────────────────────────────── */
    const [[{ total }]] = await pool.query(
      `SELECT SUM(totalVenta) AS total
         FROM Ventas
        WHERE DATE(fecha) BETWEEN ? AND ?`,
      [desde, hasta]
    );

    const [[{ efectivo }]] = await pool.query(
      `SELECT SUM(totalVenta) AS efectivo
         FROM Ventas
        WHERE formaPagoId = 1
          AND DATE(fecha) BETWEEN ? AND ?`,
      [desde, hasta]
    );

    const [[{ credito }]] = await pool.query(
      `SELECT SUM(totalVenta) AS credito
         FROM Ventas
        WHERE formaPagoId = 3
          AND DATE(fecha) BETWEEN ? AND ?`,
      [desde, hasta]
    );

    /* ── contador global de tickets ────────────────────────────── */
    const [[{ cantVentas }]] = await pool.query(
      `SELECT COUNT(*) AS cantVentas
         FROM Ventas
        WHERE DATE(fecha) BETWEEN ? AND ?`,
      [desde, hasta]
    );

    /* ── desglose por vendedor ─────────────────────────────────── */
    const [empleados] = await pool.query(
      `SELECT u.nombre,
              COUNT(*)          AS ventas,
              SUM(v.totalVenta) AS total
         FROM Ventas v
         JOIN Usuarios u ON v.vendedorId = u.id
        WHERE DATE(v.fecha) BETWEEN ? AND ?
     GROUP BY v.vendedorId`,
      [desde, hasta]
    );

    /* ── respuesta ─────────────────────────────────────────────── */
    res.json({
      total    : total      || 0,
      efectivo : efectivo   || 0,
      credito  : credito    || 0,
      cantVentas,
      empleados              // [{ nombre, ventas, total }]
    });

  } catch (err) {
    console.error('Error en /informes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
