// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db/connection'); // conexión a SQLite
const { markAsUntransferable } = require('worker_threads');

// Página de login
router.get('/', (req, res) => {
  res.render('login', { error: null });
});

// Procesar login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
  db.get(sql, [email, password], (err, user) => {
    if (err) return res.send('Error en la base de datos.');
    if (!user) return res.render('login', { error: 'Credenciales incorrectas' });

      req.session.user = user; // Guardamos el usuario  
      console.log(user, "en el modulo de AUTH");

    res.redirect('/dashboard');
  });
});

// Cerrar sesión
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
