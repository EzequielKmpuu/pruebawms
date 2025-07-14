const db = require('../db/connection');

module.exports = {
  obtenerTodos(callback) {
    db.all('SELECT * FROM ubicaciones ORDER BY id DESC', callback);
  },

  agregarUbicacion(ubicacion, tipo, callback) {
    const sql = 'INSERT INTO ubicaciones (ubicacion, tipo) VALUES (?, ?)';
    db.run(sql, [ubicacion, tipo], callback);
  },

  actualizarUbicacion(id, capacidad_max, callback) {
    const sql = 'UPDATE ubicaciones SET capacidad_max = ? WHERE id = ?';
    db.run(sql, [capacidad_max, id], callback);
  },

  // no es eliminar, es cambiar de Disponible a No-Disponible
  eliminarUbicacion(id, callback) {
    db.run('DELETE FROM ubicaciones WHERE id = ?', [id], callback);
  }
};