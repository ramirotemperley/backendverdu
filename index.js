const express = require('express');
const cors    = require('cors');
const { connectDB, pool } = require('./config/database');

const ventasRoutes     = require('./routes/ventas');
const articulosRoutes  = require('./routes/articulos');
const formasPagoRoutes = require('./routes/formasPago');
const usuariosRoutes   = require('./routes/usuarios');
const informesRoutes   = require('./routes/informes');

const app = express(); // <-- esto tiene que ir antes de usar `app.use`

// 1) Conectar a la base de datos
connectDB();

// 2) Middleware: parseo JSON
app.use(express.json());

// 3) Middleware: CORS
app.use(cors());

// 4) Rutas
app.use('/ventas',      ventasRoutes);
app.use('/articulos',   articulosRoutes);
app.use('/formas-pago', formasPagoRoutes);
app.use('/usuarios',    usuariosRoutes);
app.use('/informes',    informesRoutes); // <-- ahora sí, ya existe `app`

// 5) Ruta raíz y test
app.get('/', (_req, res) => res.send('API Running'));
app.get('/api/test', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS test');
    res.json({ ok: true, result: rows });
  } catch (err) {
    console.error('Error en /api/test:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 6) Manejador global de errores
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// 7) Levantar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
