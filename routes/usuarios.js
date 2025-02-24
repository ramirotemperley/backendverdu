const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    // Seleccionamos las columnas id y nombre
    const [rows] = await pool.query('SELECT id, nombre FROM Usuarios');
    // rows vendrá con [{id: 1, nombre: 'Ramiro'}, {id: 2, nombre: 'Ricardo'}, ...]
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener los usuarios',
      details: error.message
    });
  }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    // Verificar si el nombre ya existe
    const [existe] = await pool.query('SELECT * FROM Usuarios WHERE nombre = ?', [nombre]);
    if (existe.length > 0) {
      return res.status(400).json({ error: 'El nombre ya existe' });
    }

    // Insertar el usuario
    const [result] = await pool.execute(
      'INSERT INTO Usuarios (nombre) VALUES (?)',
      [nombre]
    );

    // Devolver el nuevo usuario creado
    res.status(201).json({ 
      id: result.insertId, 
      nombre 
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al crear el usuario',
      details: error.message
    });
  }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM Usuarios WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({
      error: 'Error al eliminar el usuario',
      details: error.message
    });
  }
});

module.exports = router;
