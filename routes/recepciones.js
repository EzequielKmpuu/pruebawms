const express = require('express');
const router = express.Router();
const db = require('../db/connection');
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

  Factura.listarSoloPendiente((err, facturas) => {
    if (err) return res.send('Error al obtener facturas');

  Producto.obtenerTodos((err, productos) => {
    if (err) return res.send('Error al cargar productos');

  rutaprov.obtenerTodosProveedores((err, dvprov) => {
      if (err) return res.send('Error al obtener productos');

    res.render('recepciones', { facturas, productos, dvprov, });
        });
      });
    });
  });

  router.get('/recepcion/:id', auth, (req, res) => {
  const idFactura = parseInt(req.params.id, 10);
  //console.log(idFactura);


  Factura.obtenerCabeceraPorId(idFactura, (err, factura) => {
    if (err) return res.send('Error al obtener factura');

    Factura.obtenerProductosFactura(idFactura, (err, productos) => {
      if (err) return res.send('Error al obtener productos');

      Factura.listarCodigoyFactura(idFactura, (err, codigo) => {
        if (err) return res.send('Error al obtener los codigos de barra');

      res.render('informeRecepcion', { factura, productos, codigo });
        })
      });
    });
  });

router.post('/validar', auth, (req, res) => {
  const productos = req.body.productos; // [{ codigo, cantidad }]
  const idRecepcion = req.body.recepcion;
  const estadoNuevo = 'Validada';

  const sql = `UPDATE productos SET stock = stock + ? WHERE codigo = ?`;
  const stmt = db.prepare(sql);

  // ✅ 1. Primero verificamos que la factura esté en estado "Pendiente"
  db.get(`SELECT estado FROM facturas WHERE recepcion = ?`, [idRecepcion], (err, row) => {
    if (err) {
      console.error('Error al consultar el estado de la factura:', err.message);
      return res.status(500).json({ error: 'Error al consultar estado de la factura' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    if (row.estado === 'Validada') {
      return res.status(400).json({ error: 'La factura ya fue validada anteriormente' });
    }

    // ✅ 2. Solo si no está validada, seguimos con el stock y el update
    db.serialize(() => {
      productos.forEach(p => {
        stmt.run([p.cantidad, p.codigo]);
      });

      stmt.finalize(err => {
        if (err) {
          console.error('Error al actualizar stock:', err.message);
          return res.status(500).json({ error: 'Error al actualizar stock' });
        }

        db.run(
          `UPDATE facturas SET estado = ? WHERE recepcion = ?`,
          [estadoNuevo, idRecepcion],
          function (err) {
            if (err) {
              console.error('Error al actualizar el estado de la factura:', err.message);
              return res.status(500).json({ error: 'Error al actualizar factura' });
            }

           // console.log(`Factura con recepción ${idRecepcion} actualizada a '${estadoNuevo}'`);
            res.json({ success: true });
          }
        );
      });
    });
  });
});

router.get('/buscar/:codigo', auth, (req, res) => {
  const codigo = req.params?.codigo;
  //console.log(req.params?.codigo);


  Producto.buscarPorCodigo(codigo, (err, producto) => {
      //console.log(producto);
    if (err) return res.status(500).json({ error: 'Error de servidor' }); 
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(producto);
  });
});


module.exports = router;
