const express = require('express');
const router = express.Router();
const Producto = require('../models/productoModel');

// Middleware para proteger rutas
function auth(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}
// Listar productos
router.get('/', auth, (req, res) => {

  Producto.obtenerTodos((err, productos) => {
      if (err) return res.send('Error al obtener productos');

    res.render('caja', {productos});
  });
});

router.get('/producto/:codigo', (req, res) => {
  const codigo = req.params.codigo;

  db.get('SELECT * FROM productos WHERE codigo = ?', [codigo], (err, row) => {
    if (err) return res.status(500).json({ error: 'Error interno' });
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    res.json(row);
  });
});

router.post('/finalizar', (req, res) => {
  const productos = req.body.productos;
  const metodo_pago = req.body.metodo_pago;
  const usuario = req.session.user 
  const fecha = new Date().toISOString();

  let total = productos.reduce((sum, p) => sum + p.total, 0);

  db.serialize(() => {
    db.run(
      'INSERT INTO ventas (fecha, total, usuario, metodo_pago) VALUES (?, ?, ?, ?)',
      [fecha, total, usuario, metodo_pago],
      function(err) {
        if (err) return res.json({ success: false });

        const idVenta = this.lastID;

        const stmt = db.prepare(`
          INSERT INTO detalle_ventas
          (id_venta, codigo_producto, nombre_producto, cantidad, precio_unitario, total_linea)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        productos.forEach(p => {
          stmt.run([idVenta, p.codigo, p.nombre, p.cantidad, p.precio, p.total]);
          db.run('UPDATE productos SET stock = stock - ? WHERE codigo = ?', [p.cantidad, p.codigo]);
        });
  
        stmt.finalize();
        res.json({ success: true });
      }
    );
  });
});

router.get('/venta/:codigo', (req, res) => {
  const codigo = req.params.codigo;

  Producto.buscarPorCodigo(codigo, (err, producto) => {
    if (err || !producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
  console.log(producto);
    // Si querés actualizar stock, podrías hacerlo aparte o aquí mismo si realmente hace falta.
    // Pero no uses `res.redirect()` si vas a responder al frontend con `fetch`.

    res.json(producto); // ✅ Enviar el producto como JSON

  });
});

module.exports = router;
