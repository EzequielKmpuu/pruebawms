const db = require('../db/connection');

console.log ()
module.exports = {

  registrar(tipo, producto_id, cantidad, observacion, usuario, callback) {
  const sql = `INSERT INTO movimientos (tipo, producto_id, cantidad, observacion, fecha, usuario)
               VALUES (?, ?, ?, ?, datetime('now', 'localtime'), ?)`;
  db.run(sql, [tipo, producto_id, cantidad, observacion, usuario], callback);
},

  listar(callback) {
    const sql = `
      SELECT m.*, p.nombre AS producto_nombre, p.codigo
      FROM movimientos m
      JOIN productos p ON m.producto_id = p.id
      ORDER BY m.fecha DESC
      LIMIT 10
    `;
    db.all(sql, callback);
  }
};
