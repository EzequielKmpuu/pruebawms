const express = require('express');
const router = express.Router();
const Clientes = require('../models/clientesModel');

function auth(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}

// Mostrar formulario + historial
router.get('/', auth, (req, res) => {
  Clientes.obtenerTodos((err, clientes) => {
    if (err) return res.send('Error al cargar productos');
    
      res.render('clientes', { clientes });
    });
  });

// Registrar Cliente
router.post('/registrar', auth, (req, res) => {
  const { razonSocial, nombre, domicilio, codPostal, contacto, dni, cuit, provincia, localidad, lista } = req.body;
  const usuario = req.session.user?.nombre || 'Desconocido'; 

  //console.log(Clientes);

  Clientes.agregar(razonSocial, nombre, domicilio, codPostal, contacto, dni, cuit, provincia, localidad, lista, (err) => {
    if (err) return res.send('Error al registrar Cliente');

      res.redirect('/clientes');
    });
  });

  router.post('/editar/:id', auth, (req, res) => {
    const { id } = req.params;
    const { razonSocial, nombre, domicilio, codPostal, contacto, dni, cuit, provincia, localidad, lista } = req.body;

    Clientes.actualizar(id, razonSocial, nombre, domicilio, codPostal, contacto, dni, cuit, provincia, localidad, lista, (err) => {
      if (err) return res.send('Error al actualizar');
      res.redirect('/clientes');
      
    });
  });

  router.get('/eliminar/:id', auth, (req, res) => {
    const { id } = req.params;
    Clientes.eliminar(id, (err) => {
      if (err) return res.send('Error al eliminar');
      res.redirect('/clientes');
    });
  });

module.exports = router;
