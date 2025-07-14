const express = require('express');
const router = express.Router();
const proveedor = require('../models/proveedorModel');

// Middleware para proteger 
function auth(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}

// Listar productos
router.get('/', auth, (req, res) => {
  proveedor.obtenerTodosProveedores((err, seller) => {
    if (err) return res.send('Error al obtener proveedores route get obtener todos los proveedores');
    res.render('proveedores', { seller });
  });
});

// Agregar proveedor
router.post('/agregar', auth, (req, res) => {
  const { seller } = req.body;

  proveedor.agregarProveedor(seller, (err) => {
        
    if (err) return res.send('Error al agregar proveedor route post agregar todos los proveedores!');

    res.redirect('/proveedores');
  });
});

// Editar producto
router.post('/editar/:id', auth, (req, res) => {
  const { id } = req.params;
  const { seller } = req.body;

  proveedor.actualizarProveedor(id, seller, (err) => {
    if (err) return res.send('Error al actualizar proveedor');
    res.redirect('/proveedores');
  });
});

// Eliminar producto
router.get('/eliminar/:id', auth, (req, res) => {
  const { id } = req.params;
  proveedor.eliminarProveedor(id, (err) => {
    if (err) return res.send('Error al eliminar proveedor');
    res.redirect('/proveedores');
  });
});

module.exports = router;
