// index.js
const express = require('express');
const connectDB = require('./config/database');
const ventasRoutes = require('./routes/ventas');
const cors = require('cors');
const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para parsear JSON
app.use(express.json());

// Configurar CORS para permitir peticiones desde el frontend
app.use(cors());

// Usar las rutas de ventas
app.use('/ventas', ventasRoutes);

// Ruta raíz (opcional)
app.get('/', (req, res) => res.send('API Running'));

// Manejo de errores global (opcional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// Iniciar el servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
