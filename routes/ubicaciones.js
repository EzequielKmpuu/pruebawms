const express = require('express');
const router = express.Router();
const Ubicacion = require('../models/ubicacionesModel');

// Middleware para proteger rutas
function auth(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}

// Listar productos
router.get('/', auth, (req, res) => {
  Ubicacion.obtenerTodos((err, ubicacion) => {
    if (err) return res.send('Error al obtener productos');
  
    res.render('ubicaciones', { ubicacion })
      });
    });

    // Agregar Ubicacion
router.post('/agregar', auth, (req, res) => {
  const { ubicacion, tipo } = req.body;

  console.log('Ubicacion agregada =', req.body);

  Ubicacion.agregarUbicacion(ubicacion, tipo, (err) => {
        
    if (err) return res.send('Error al agregar ubicacion');

    res.redirect('/ubicaciones');
  });
});

// Editar producto
router.post('/editar/:id', auth, (req, res) => {
  const { id } = req.params;
  const { capacidad_max } = req.body;

  Ubicacion.actualizarUbicacion(id, capacidad_max, (err) => {
    if (err) return res.send('Error al actualizar');
    res.redirect('/ubicaciones');
    
  });
});

module.exports = router;
