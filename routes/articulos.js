const express = require('express');
const router = express.Router();
const Articulo = require('../models/Articulo');

// Obtener todos los artículos
router.get('/', async (req, res) => {
  try {
    const articulos = await Articulo.find();
    res.status(200).json(articulos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los artículos', details: error.message });
  }
});

// Obtener un artículo por ID
router.get('/:id', async (req, res) => {
  try {
    const articulo = await Articulo.findById(req.params.id);
    if (!articulo) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.status(200).json(articulo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el artículo', details: error.message });
  }
});

// Crear un nuevo artículo
router.post('/', async (req, res) => {
    try {
      const { codigo, nombre } = req.body;
  
      if (!codigo || !nombre) {
        return res.status(400).json({ error: 'Código y nombre son obligatorios' });
      }
  
      const nuevoArticulo = new Articulo({ codigo, nombre });
      await nuevoArticulo.save();
      res.status(201).json({ message: 'Artículo creado correctamente', articulo: nuevoArticulo });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el artículo', details: error.message });
    }
  });
  
// Actualizar un artículo existente
router.put('/:id', async (req, res) => {
    try {
      const articuloActualizado = await Articulo.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!articuloActualizado) {
        return res.status(404).json({ error: 'Artículo no encontrado para actualizar' });
      }
      res.json({ message: 'Artículo actualizado correctamente', articulo: articuloActualizado });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el artículo', details: error.message });
    }
  });
  
// Eliminar un artículo
router.delete('/:id', async (req, res) => {
  try {
    const articuloEliminado = await Articulo.findByIdAndDelete(req.params.id);
    if (!articuloEliminado) return res.status(404).json({ error: 'Artículo no encontrado para eliminar' });
    res.json({ message: 'Artículo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el artículo', details: error.message });
  }
});

module.exports = router;
