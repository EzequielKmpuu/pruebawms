const express = require('express');
const router = express.Router();
const Movimiento = require('../models/movimientoModel');
const Producto = require('../models/productoModel');

function auth(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}

// Mostrar formulario + historial
router.get('/', auth, (req, res) => {
  Producto.obtenerTodos((err, productos) => {
    if (err) return res.send('Error al cargar productos');
    Movimiento.listar((err, movimientos) => {
      if (err) return res.send('Error al cargar movimientos');
      res.render('movimientos', { productos, movimientos });
    });
  });
});

// Registrar movimiento
router.post('/registrar', auth, (req, res) => {
  const { tipo, producto_id, cantidad, observacion } = req.body;
  const usuario = req.session.user?.nombre || 'Desconocido'; 

  Movimiento.registrar(tipo, producto_id, cantidad, observacion, usuario, (err) => {
    if (err) return res.send('Error al registrar movimiento');

    Producto.actualizarStock(producto_id, cantidad, tipo, (err) => {
      if (err) return res.send('Error al actualizar stock');
      res.redirect('/movimientos');
    });
  });
});

module.exports = router;
