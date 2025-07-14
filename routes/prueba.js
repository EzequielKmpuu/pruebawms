const express = require('express');
const router = express.Router();

// Mostrar la página de pruebas
router.get('/prueba', (req, res) => {
  res.render('prueba');
});

module.exports = router;
