const express = require('express');
const router = express.Router();
const Producto = require('../models/productoModel');
const rutaprov = require('../models/proveedorModel');
const Recepciones = require('../models/recepcionesModels');
const Factura = require('../models/facturaModel');


// Middleware para proteger rutas
function auth(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}

// Listar productos
router.get('/', auth, (req, res) => {
 
  Factura.listarOK((err, facturas) => {
    if (err) return res.send('Error al obtener facturas');

  Producto.obtenerTodos((err, productos) => {
    if (err) return res.send('Error al cargar productos');

  rutaprov.obtenerTodosProveedores((err, dvprov) => {
      if (err) return res.send('Error al obtener productos');

    res.render('recepcionesOK', { facturas, productos, dvprov, });
        });
      });
    });
  });

module.exports = router;
