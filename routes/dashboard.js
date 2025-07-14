const express = require('express');
const router = express.Router();
const db = require('../db/connection');




function auth(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}

router.get('/', auth, async (req, res) => {

  try {
    const totalProductos = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) AS total FROM productos', (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });

    const totalUnidades = await new Promise((resolve, reject) => {
      db.get('SELECT SUM(stock) AS total FROM productos', (err, row) => {
        if (err) reject(err);
        else resolve(row.total || 0);
      });
    });

    const productosBajoStock = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM productos WHERE stock IS NOT NULL AND stock < 10', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const ultimosMovimientos = await new Promise((resolve, reject) => {
      db.all(`
        SELECT m.*, p.nombre AS producto_nombre 
        FROM movimientos m 
        JOIN productos p ON m.producto_id = p.id 
        ORDER BY m.fecha DESC LIMIT 5
      `, (err, rows) => {

        if (err) reject(err);
        else resolve(rows);
      });
    });

    const usuario = req.session.user?.nombre || 'Desconocido';

    res.render('dashboard', {
      totalProductos,
      totalUnidades,
      productosBajoStock,
      ultimosMovimientos,
      usuario,
      user: req.session.user
    });
  } catch (error) {
    console.error("Error en el dashboard:", error);
    res.status(500).send("Error al cargar el dashboard");
  }
});


 

module.exports = router;

