const express = require('express');
const router = express.Router();
const Producto = require('../models/productoModel');
const Ubicaciones = require('../models/ubicacionesModel');
const db = require('../db/connection');


// Middleware para proteger rutas
function auth(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}

// Listar productos
router.get('/', auth, (req, res) => {

  Producto.obtenerTodos((err, productos) => {
    if (err) return res.send('Error al obtener productos');

    Ubicaciones.obtenerTodos((err, ubicaciones) => {
        if (err) return res.send('Ubicaciones no encontradas');
  
    res.render('reubicar', { productos, ubicaciones });
    });
  });
});

router.get('/buscar/:codigo', (req, res) => {
  const codigo = req.params.codigo;

  console.log('Código recibido:', codigo);

  db.get('SELECT id, nombre, ubicacion FROM productos WHERE codigo = ?', [codigo], (err, row) => {
    if (err) return res.status(500).json({ error: 'Error en la búsqueda' });
    console.error('Error en consulta SQL:', err); 

    if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
    console.warn('Producto no encontrado en DB'); 
    
    res.json(row);
    console.log('Producto encontrado:', row); 
  });
});

router.post('/validar', (req, res) => {
  const { id, nuevaUbicacion } = req.body;
  db.run('UPDATE productos SET ubicacion = ? WHERE id = ?', [nuevaUbicacion, id], function (err) {
    if (err) return res.status(500).json({ error: 'Error al actualizar ubicación' });
    res.json({ success: true });
  });
});

module.exports = router;

