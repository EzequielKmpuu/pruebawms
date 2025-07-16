const express = require('express');
const router = express.Router();
const Producto = require('../models/productoModel');
const rutaprov = require('../models/proveedorModel');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const db = require('../db/connection');
const { subscribe } = require('diagnostics_channel');

const upload = multer({ dest: 'uploads/' });

// Middleware para proteger rutas
function auth(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}

router.get('/escanear', auth, (req, res) => {
  res.render('escanear');
});


// Listar productos
router.get('/', auth, (req, res) => {
  Producto.obtenerTodos((err, productos) => {
    if (err) return res.send('Error al obtener productos');
  
  rutaprov.obtenerTodosProveedores((err, dvprov) => {
    if (err) return res.send('Error al obtener proveedores');

    res.render('productos', { productos, dvprov });
      });
    });
  });

// Agregar producto
router.post('/agregar', auth, (req, res) => {
  const { proveedor, nombre, corta, categoria, sub_categoria, codigo, stock, precio } = req.body;
  const stockFinal = stock || 0; // valor por defecto si viene vacío o undefined
  const precioFinal = precio || 0; // valor por defecto si viene vacío o undefined

  // Validar si ya existe
  Producto.verificarExistencia(codigo, (err, existe) => {
  if (err) return res.send('Error al verificar existencia');

  if (existe) {
    return res.send('<script>alert("Ya existe un producto con ese código."); window.location.href="/productos";</script>');
  }

  // SOLO SI NO EXISTE, agregamos:
  Producto.agregar(proveedor, nombre, corta, codigo, categoria, sub_categoria, stockFinal, precioFinal, (err) => {
    if (err) return res.send('Error al agregar producto!');
    res.redirect('/productos');
    });
  });
});


// Editar producto
router.post('/editar/:id', auth, (req, res) => {
  const { id } = req.params;
  const { proveedor, nombre, corta, categoria, sub_categoria, codigo, stock, precio } = req.body;

  //console.log(req.body);

  Producto.actualizar(id, proveedor, nombre, corta, codigo, categoria, sub_categoria, stock, precio, (err) => {
    if (err) return res.send('Error al actualizar');
    res.redirect('/productos');
    
  });
});

// Eliminar producto
router.get('/eliminar/:id', auth, (req, res) => {
  const { id } = req.params;
  Producto.eliminar(id, (err) => {
    if (err) return res.send('Error al eliminar');
    res.redirect('/productos');
  });
});

//Importar productos
router.get('/importar', auth, (req, res) => {
  res.render('importar');
});

//Buscar productos
router.get('/buscarlo', (req, res) => {
  const { nombre, codigo, categoria, sub_categoria } = req.query;

  //console.log(req.query)

  rutaprov.obtenerTodosProveedores((err, dvprov) => {
    if (err) return res.send('Error al obtener proveedores');

  let sql = 'SELECT * FROM productos WHERE 1=1';
  const params = [];

  if (nombre) {
    sql += ' AND nombre LIKE ?';
    params.push(`%${nombre}%`);
  }

  if (codigo) {
    sql += ' AND codigo LIKE ?';
    params.push(`%${codigo}%`);
  }
  if (categoria) {
    sql += ' AND categoria LIKE ?';
    params.push(`%${categoria}%`);
  }
  if (sub_categoria) {
    sql += ' AND sub_categoria LIKE ?';
    params.push(`%${sub_categoria}%`);
  }

  db.all(sql, params, (err, productos) => {
    if (err) {
      console.error('Error al consultar productos:', err.message);
      return res.status(500).send('Error interno del servidor');
    }

    // Enviamos de vuelta los filtros para que se conserven en los inputs
    res.render('productos', { productos, nombre, codigo, categoria, sub_categoria, dvprov });
    });
  });
});

router.post('/importar', upload.single('archivoExcel'), (req, res) => {
  const archivo = req.file.path;
  
  const workbook = xlsx.readFile(archivo);
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  
  const datos = xlsx.utils.sheet_to_json(hoja, { defval: "" }); // evita undefined
  
  
   const productos = datos
    .filter(row => row.codigo || row['Código'] || row['codigo']) // asegurarse que tenga código
    .map(row => ({
      proveedor: row.proveedor || row['Proveedor'] || '',
      nombre: row.nombre || row['Nombre'],
      corta: row.corta || row['Corta'] || '',
      codigo: row.codigo || row['Código'],      
      categoria: row.categoria || row['Categoria'] || '',
      sub_categoria: row.sub_categoria || row['Sub_categoria'] || '',
      precio: parseFloat((row.precio || row['Precio'] || '0').toString().replace(',', '.')),
      stock: parseInt(row.stock || row['Stock'] || 0),
    }));

   const insertSQL = `
    INSERT INTO productos 
    (proveedor, nombre, corta, codigo, categoria, sub_categoria, stock, precio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const stmt = db.prepare(insertSQL);

  productos.forEach(p => {
    stmt.run([
      p.proveedor,
      p.nombre,
      p.corta,
      p.codigo,
      p.categoria,
      p.sub_categoria,
      p.stock || 0,
      p.precio || 0
      ], err => {
  if (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      console.warn(`⚠️ Código ya existente: ${p.codigo}`);
    } else {
      console.error('Error al insertar producto:', err.message);
    }
  }
});
  });

  stmt.finalize();
  fs.unlinkSync(archivo); // eliminar archivo temporal

  //console.log('Productos importados:', productos.length);
  res.redirect('/productos'); // redirige correctamente
});

module.exports = router;
