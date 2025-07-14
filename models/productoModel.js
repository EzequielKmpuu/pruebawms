const db = require('../db/connection');

module.exports = {
  obtenerTodos(callback) {
    db.all('SELECT * FROM productos ORDER BY id DESC', callback);
  },

  obtenerTodosActivados(callback) {
    db.all('SELECT * FROM productos WHERE activa = 1;', callback);
  },

  obtenerTodosDesactivados(callback) {
    db.all('SELECT * FROM productos WHERE activa = 0;', callback);
  },

  actualizarStockIngreso: (codigo, proveedor, cantidad, callback) => {
  const sql = 'UPDATE productos SET stock = stock + ? WHERE codigo = ? AND proveedor = ?';
  db.run(sql, [cantidad, codigo, proveedor], callback);
  },

  agregar(proveedor, nombre, corta, codigo, categoria, sub_categoria, stockFinal, precioFinal, callback) {
    console.log('Producto Nuevo agregado: '),
    console.log({
    proveedor,
    nombre,
    corta,
    codigo,
    categoria,
    sub_categoria,
    stockFinal,
    precioFinal
    });
    const sql = 'INSERT INTO productos (proveedor, nombre, corta, codigo, categoria, sub_categoria, stock, precio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [proveedor, nombre, corta, codigo, categoria, sub_categoria, stockFinal, precioFinal], callback);
  },

  buscarPorId(id, callback) {
  const sql = 'SELECT * FROM productos WHERE id = ?';
  db.get(sql, [id], callback);
  },

buscarPorIdYProveedor: (id, proveedor, callback) => {
  const sql = 'SELECT * FROM productos WHERE id = ? AND proveedor = ?';
  db.get(sql, [id, proveedor], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
    console.log(proveedor);
  });
  },

  actualizar(id, proveedor, nombre, corta, codigo, categoria, sub_categoria, stock, precio, callback) {
    const sql = 'UPDATE productos SET proveedor = ?, nombre = ?, corta = ?, codigo = ?, categoria = ?, sub_categoria = ?, stock = ?, precio = ? WHERE id = ?';
    db.run(sql, [proveedor, nombre, corta, codigo, categoria, sub_categoria, stock, precio, id], callback);
  },

  Activar(id, activa, callback) {
    const sql = 'UPDATE productos SET activa = 1 WHERE id = ?';
    db.run(sql, [activa, id], callback);
  },

  Desactivar(id, activa, callback) {
    const sql = 'UPDATE productos SET activa = 0 WHERE id = ?';
    db.run(sql, [activa, id], callback);
  },

  actualizarStock(producto_id, cantidad, tipo, callback) {
    const signo = tipo === 'ingreso' ? '+' : '-';
    const sql = `UPDATE productos SET stock = stock ${signo} ? WHERE id = ?`;
    db.run(sql, [cantidad, producto_id], callback);
  },

  actualizarStockIngresoPorNombre(producto, cantidad, callback) {
    const sql = `
      UPDATE productos
      SET stock = stock + ?
      WHERE descripcion = ?
    `;

    db.run(sql, [producto, cantidad], function(err) {
      if (err) return callback(err);
      callback(null);
    });
  },

  actualizarStockIngresoPorCodigo(producto, cantidad, callback) {
    const sql = `
      UPDATE productos
      SET stock = stock + ?
      WHERE codigo = ?
    `;

    db.run(sql, [producto, cantidad], function(err) {
      if (err) return callback(err);
      callback(null);
    });
  },

  buscarPorCodigo(codigo, callback) {
    const sql = 'SELECT * FROM productos WHERE codigo = ?';
    db.get(sql, [codigo], callback);
  },

  buscarPorProducto(producto, callback) {
    const sql = 'SELECT * FROM productos WHERE producto = ?';
    db.get(sql, [producto], callback);
  },

  eliminar(id, callback) {
    db.run('DELETE FROM productos WHERE id = ?', [id], callback);
  },

  verificarExistencia(codigo, callback) {
  const sql = 'SELECT COUNT(*) AS cantidad FROM productos WHERE codigo = ?';
  db.get(sql, [codigo], (err, row) => {
    if (err) return callback(err);
    callback(null, row.cantidad > 0); // true si ya existe
  });
  },

};