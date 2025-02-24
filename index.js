// index.js
const express = require('express');
const { connectDB } = require('./config/database'); // Asegúrate de que la ruta sea correcta
const cors = require('cors');

const ventasRoutes = require('./routes/ventas');
const articulosRoutes = require('./routes/articulos');
const formasPagoRoutes = require('./routes/formasPago');
const usuariosRoutes = require('./routes/usuarios');

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para parsear JSON
app.use(express.json());

// Configurar CORS
app.use(cors());

// Rutas
app.use('/ventas', ventasRoutes);
app.use('/articulos', articulosRoutes);
app.use('/formas-pago', formasPagoRoutes);
app.use('/usuarios', usuariosRoutes);

// Ruta raíz
app.get('/', (req, res) => res.send('API Running'));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// Iniciar el servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
