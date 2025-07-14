const db = require('../db/connection');

module.exports = {
  obtenerTodosProveedores(callback) {
    db.all('SELECT * FROM dbprov ORDER BY id DESC', callback);
  },

  agregarProveedor(seller, callback) {
    const sql = 'INSERT INTO dbprov (seller) VALUES (?)';
    db.run(sql, [seller], callback);
  },

  actualizarProveedor(id, seller, callback) {
    const sql = 'UPDATE dbprov SET seller = ? WHERE id = ?';
    db.run(sql, [seller, id], callback);
  },

  eliminarProveedor(id, callback) {
    db.run('DELETE FROM dbprov WHERE id = ?', [id], callback);
  }
};
