// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/Verduleria', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conectado a MongoDB local");
  } catch (err) {
    console.error("Error conectando a MongoDB:", err.message);
    process.exit(1); // Termina el proceso si falla la conexión
  }
};

module.exports = connectDB;
