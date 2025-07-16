// app.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'tu_clave_secreta',
  resave: false,
  saveUninitialized: true

}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/productos', require('./routes/productos'));
app.use('/movimientos', require('./routes/movimientos'));
app.use('/facturas', require('./routes/facturas'));
app.use('/proveedores', require('./routes/proveedores'));
app.use('/recepciones', require('./routes/recepciones'));
//app.use('/recepcionesOK', require('./routes/recepcionesOK'));
app.use('/clientes', require('./routes/clientes'));
app.use('/caja', require('./routes/caja'));
app.use('/importar', require('./routes/productos'));
app.use('/ubicaciones', require('./routes/ubicaciones'));
app.use('/reubicar', require('./routes/reubicar'));

// Iniciar servidor con el movil
//app.listen(3000, '192.168.1.160', () => {
//    console.log('Servidor corriendo en http://localhost:3000 para poder entrar con el movil');
//  });

// Iniciar servidor
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT} LOCAL`);
  });
