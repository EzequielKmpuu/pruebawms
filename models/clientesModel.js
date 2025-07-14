const db = require('../db/connection');

module.exports = {
  obtenerTodos(callback) {
    db.all('SELECT * FROM clientes ORDER BY id DESC', callback);
  },

  agregar(razonSocial, nombre, domicilio, codPostal, contacto, dni, cuit, provincia, localidad, lista, callback) {
    const sql = 'INSERT INTO clientes (razonSocial, nombre, domicilio, codPostal, contacto, dni, cuit, provincia, localidad, lista) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [razonSocial, nombre, domicilio, codPostal, contacto, dni, cuit, provincia, localidad, lista], callback);
  },

  buscarPorId(id, callback) {
  const sql = 'SELECT * FROM clientes WHERE id = ?';
  db.get(sql, [id], callback);
  },

  actualizar(id, razonSocial, nombre, domicilio, codPostal, contacto, dni, cuit, provincia, localidad, lista, callback) {
    const sql = 'UPDATE clientes SET razonSocial = ?, nombre = ?, domicilio = ?, codPostal = ?, contacto = ?, dni = ?, cuit = ?, provincia = ?, localidad = ?, lista = ? WHERE id = ?';
    db.run(sql, [razonSocial, nombre, domicilio, codPostal, contacto, dni, cuit, provincia, localidad, lista, id], callback);
  },

  verificarExistencia(cuit, callback) {
  const sql = 'SELECT COUNT(*) AS cantidad FROM clientes WHERE cuit = ?';
  db.get(sql, [cuit], (err, row) => {
    if (err) return callback(err);
    callback(null, row.cantidad > 0); // true si ya existe
  });
  },

  eliminar(id, callback) {
    db.run('DELETE FROM clientes WHERE id = ?', [id], callback);
  },

};