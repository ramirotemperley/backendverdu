// routes/ventas.js
const express = require('express');
const http    = require('http');
const router  = express.Router();
const { pool } = require('../config/database');

/* ------------------------------------------------------------------ */
/*  POST /ventas – crear una venta                                     */
/* ------------------------------------------------------------------ */
router.post('/', async (req, res) => {
  try {
    const { totalVenta, vendedorId, formaPagoId, articulos } = req.body;
    if (!Array.isArray(articulos) || articulos.length === 0) {
      return res.status(400).json({ error: 'La venta debe incluir al menos un artículo.' });
    }

    // 1) Insert en Ventas
    const [ventaResult] = await pool.execute(
      `INSERT INTO Ventas (totalVenta, vendedorId, formaPagoId, fecha)
       VALUES (?, ?, ?, NOW())`,
      [ totalVenta, vendedorId, formaPagoId ]
    );
    const ventaId = ventaResult.insertId;

    // 2) Insert en VentaArticulos
    for (const it of articulos) {
      const pesoLimpio = it.peso != null ? parseFloat(it.peso) : null;
      await pool.execute(
        `INSERT INTO VentaArticulos
           (ventaId, articuloId, cantidad, precio, total, peso)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ ventaId, it.articuloId, it.cantidad, it.precio, it.total, pesoLimpio ]
      );
    }

    res.status(201).json({ message: 'Venta creada correctamente', ventaId });
  } catch (e) {
    console.error('Error al crear la venta:', e);
    res.status(500).json({ error: 'Error al crear la venta', details: e.message });
  }
});

/* ------------------------------------------------------------------ */
/*  GET /ventas – historial completo                                   */
/* ------------------------------------------------------------------ */
router.get('/', async (_req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT
        v.id,
        v.totalVenta,
        v.fecha,
        v.vendedorId,
        v.formaPagoId,
        COALESCE(u.nombre,'–') AS vendedorNombre,
        COALESCE(fp.nombre,'–') AS formaPagoNombre
      FROM Ventas v
      LEFT JOIN Usuarios   u  ON v.vendedorId  = u.id
      LEFT JOIN FormasPago fp ON v.formaPagoId = fp.id
      ORDER BY v.id DESC
    `);
    res.json(ventas);
  } catch (e) {
    console.error('Error al obtener las ventas:', e);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
});

/* ------------------------------------------------------------------ */
/*  GET /ventas/:id – detalle de una venta                             */
/* ------------------------------------------------------------------ */
router.get('/:id', async (req, res) => {
  try {
    const ventaId = req.params.id;
    const [vRows] = await pool.query('SELECT * FROM Ventas WHERE id = ?', [ventaId]);
    if (!vRows.length) return res.status(404).json({ error: 'Venta no encontrada' });

    const [arts] = await pool.query('SELECT * FROM VentaArticulos WHERE ventaId = ?', [ventaId]);
    res.json({ ...vRows[0], articulos: arts });
  } catch (e) {
    console.error('Error al obtener la venta:', e);
    res.status(500).json({ error: 'Error al obtener la venta', details: e.message });
  }
});

/* ------------------------------------------------------------------ */
/*  DELETE /ventas/:id – eliminar venta                                */
/* ------------------------------------------------------------------ */
router.delete('/:id', async (req, res) => {
  try {
    const [r] = await pool.execute('DELETE FROM Ventas WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Venta no encontrada para eliminar' });
    res.json({ message: 'Venta eliminada correctamente' });
  } catch (e) {
    console.error('Error al eliminar la venta:', e);
    res.status(500).json({ error: 'Error al eliminar la venta', details: e.message });
  }
});

/* ------------------------------------------------------------------ */
/*  POST /ventas/imprimir – reimpresión única                           */
/* ------------------------------------------------------------------ */
router.post('/imprimir', async (req, res) => {
  try {
    let lista;

    if (req.body.id) {
      // ————————————————————————————————————————————————————————
      // Reimpresión: cargamos subtotales reales desde la DB
      const ventaId = req.body.id;
      const [rows] = await pool.query(
        `SELECT
           va.total AS precio,
           va.peso  AS peso,
           COALESCE(a.nombre,'VERDULERIA') AS nombre
         FROM VentaArticulos va
         LEFT JOIN articulos a       ON va.articuloId = a.id
         WHERE va.ventaId = ?`,
        [ventaId]
      );
      lista = rows.map(it => ({
        nombre: it.nombre,
        precio: Number(it.precio),
        peso:   it.peso
      }));
    } else {
      // ————————————————————————————————————————————————————————
      // Primera impresión: recibimos articulosPrint en el body
      const { articulosPrint, articulos } = req.body;
      lista = articulosPrint || articulos;
    }

    if (!Array.isArray(lista) || lista.length === 0) {
      return res.status(400).json({ error: 'Ticket vacío o sin artículos.' });
    }

    // — Formatear texto idéntico a la impresión inicial —
    const ahora   = new Date();
    const fecha   = ahora.toLocaleDateString('es-AR');
    const hora    = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const encabezado = `VERDULERIA\n${fecha} ${hora}\n\n`;
    const cuerpo = lista.map(it => {
      const nom = it.nombre
        .toUpperCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .replace(/[^A-Z0-9 ]/g,'');
      let pesoStr = '-';
      if (it.peso != null) {
        const p = parseFloat(it.peso);
        pesoStr = p >= 50 ? `${p.toFixed(0)}g` : `${p.toFixed(2)}kg`;
      }
      const pr = `$${it.precio.toFixed(2)}`;
      return `${nom.padEnd(12)} ${pesoStr.padEnd(6)} ${pr.padStart(8)}`;
    }).join('\n');
    const total = lista.reduce((s, it) => s + it.precio, 0);
    const texto = encabezado + cuerpo +
                  `\n\nTOTAL:           $${total.toFixed(2)}\n\nGRACIAS POR SU COMPRA\n\n\n`;

    console.log('→ Reimpresión:\n', texto);

    // — Enviar a impresora térmica una sola vez —
    const payload = JSON.stringify({ text: texto });
    const options = {
      hostname: 'localhost',
      port:     3002,
      path:     '/print',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const pr = http.request(options, r => r.on('data', d => console.log('Resp impresora:', d.toString())));
    pr.on('error', e => console.error('Error impresora:', e.message));
    pr.write(payload);
    pr.end();

    // — Responder OK al cliente —
    res.json({ mensaje: 'Ticket reenviado a impresión' });
  } catch (e) {
    console.error('Error en /ventas/imprimir:', e);
    res.status(500).json({ error: 'Error interno en impresión', details: e.message });
  }
});

module.exports = router;
