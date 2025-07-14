const express = require('express');
const router = express.Router();
const Factura = require('../models/facturaModel');
const Producto = require('../models/productoModel');
const rutaprov = require('../models/proveedorModel');

// Middleware para proteger rutas
function auth(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}

// Mostrar formulario de ingreso de factura
router.get('/', auth, (req, res) => {
  Factura.listar((err, facturas) => {
    if (err) return res.send('Error al obtener facturas');

  Producto.obtenerTodos((err, productos) => {
    if (err) return res.send('Error al cargar productos');

  rutaprov.obtenerTodosProveedores((err, dvprov) => {
      if (err) return res.send('Error al obtener productos');

    res.render('facturas', { facturas, productos, dvprov });
      });
    });
  });
});

router.post('/registrar', auth, (req, res) => {
  const { serie, numero, proveedor, estado } = req.body;
  const usuario = req.session.user?.nombre || 'Desconocido';

  const productos = req.body["producto[]"];
  const cantidades = req.body["cantidad[]"];
  const precios = req.body["precio_unitario[]"];

  const productosArray = Array.isArray(productos) ? productos : [productos];
  const cantidadesArray = Array.isArray(cantidades) ? cantidades : [cantidades];
  const preciosArray = Array.isArray(precios) ? precios : [precios];

  Factura.getUltimaRecepcion((err, nuevaRecepcion) => {
    if (err) return res.send('Error al obtener el número de recepción');

    Factura.verificarExistencia(serie, numero, (err, existe) => {
      if (err) return res.send('Error al verificar existencia');

      if (existe) {
        return res.send('<script>alert("Número de Serie y Factura ya existen."); window.location.href="/facturas";</script>');
      }

      // ✅ Acá definimos las tareas una vez validadas todas las condiciones
      const tareas = productosArray.map((prod, i) => {
        return new Promise((resolve, reject) => {
          Factura.registrar(
            serie,
            numero,
            proveedor,
            prod,
            cantidadesArray[i],
            preciosArray[i],
            usuario,
            nuevaRecepcion,
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      });

      // ✅ Ejecutamos después de definir completamente el array
      Promise.all(tareas)
        .then(() => res.redirect('/facturas'))
        .catch((err) => res.send('Error al registrar productos en la factura: ' + err.message));
    });
  });
});



module.exports = router;
