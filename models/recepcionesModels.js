const db = require('../db/connection');

module.exports = {
  obtenerTodos(callback) {
    db.all('SELECT * FROM recepciones ORDER BY id DESC', callback);
  },

  actualizarStockIngreso: (codigo, proveedor, cantidad, callback) => {
  const sql = 'UPDATE recepciones SET stock = stock + ? WHERE codigo = ? AND proveedor = ?';
  db.run(sql, [cantidad, codigo, proveedor], callback);
  },

  agregar(proveedor, nombre, codigo, corta, categoria, sub_categoria, stockFinal, callback) {
    const sql = 'INSERT INTO recepciones (proveedor, nombre, corta, codigo, categoria, sub_categoria, stock) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [proveedor, nombre, corta, codigo, categoria, sub_categoria, stockFinal], callback);
  },

  buscarPorId(id, callback) {
  const sql = 'SELECT * FROM recepciones WHERE id = ?';
  db.get(sql, [id], callback);
  },

buscarPorIdYProveedor: (id, proveedor, callback) => {
  const sql = 'SELECT * FROM recepciones WHERE id = ? AND proveedor = ?';
  db.get(sql, [id, proveedor], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
    console.log(proveedor);
  });
  },

  actualizar(id, proveedor, nombre, corta, codigo, categoria, sub_categoria, stock, callback) {
    const sql = 'UPDATE recepciones SET proveedor = ?, nombre = ?, corta = ?, codigo = ?, categoria = ?, sub_categoria = ?, stock = ? WHERE id = ?';
    db.run(sql, [proveedor, nombre, corta,  codigo, categoria, sub_categoria, stock, id], callback);
  },

  actualizarStock(producto_id, cantidad, tipo, callback) {
    const signo = tipo === 'ingreso' ? '+' : '-';
    const sql = `UPDATE recepciones SET stock = stock ${signo} ? WHERE id = ?`;
    db.run(sql, [cantidad, producto_id], callback);
  },

  buscarPorCodigo(codigo, callback) {
    const sql = 'SELECT * FROM recepciones WHERE codigo = ?';
    db.get(sql, [codigo], callback);
  },

  buscarPorProducto(producto, callback) {
    const sql = 'SELECT * FROM recepciones WHERE producto = ?';
    db.get(sql, [producto], callback);
  },

  eliminar(id, callback) {
    db.run('DELETE FROM recepciones WHERE id = ?', [id], callback);
  },

  verificarExistencia(codigo, callback) {
  const sql = 'SELECT COUNT(*) AS cantidad FROM recepciones WHERE codigo = ?';
  db.get(sql, [codigo], (err, row) => {
    if (err) return callback(err);
    callback(null, row.cantidad > 0); // true si ya existe
  });
  },

  getRecepcion(callback) {
  const sql = `SELECT estado FROM recepciones`;
  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);
    const estado = rows?.estado || 'Pendiente';
    callback(null, rows); // rows es un array de objetos con la columna estado
  });
},

};
