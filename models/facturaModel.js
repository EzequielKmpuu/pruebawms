const db = require('../db/connection');
const Producto = require('../models/productoModel');

module.exports = {
  registrar(serie, numero, proveedor, producto, cantidad, precio_unitario, usuario, nuevaRecepcion, callback) {
    const sql = `
      INSERT INTO facturas (serie, numero, proveedor, producto, cantidad, precio_unitario, usuario, recepcion, fecha, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), 'Pendiente')
    `;
    db.run(sql, [serie, numero, proveedor, producto, cantidad, precio_unitario, usuario, nuevaRecepcion], callback);
  },

  ActualizarVenta(fecha, total, usuario, metodo_pago, callback) {
    const sql = `INSERT INTO ventas (fecha, total, usuario, metodo_pago) VALUES (?, ?, ?, datetime('now', 'localtime'))`;
    db.run(sql, [fecha, total, usuario, metodo_pago], callback);
  },

  verificarExistencia(serie, numero, callback) {
  const sql = 'SELECT COUNT(*) AS remito FROM facturas WHERE serie = ? AND numero = ?';
  db.get(sql, [serie, numero], (err, row) => {
    if (err) return callback(err);
    callback(null, row.remito > 0); // true si ya existe
  });
},

obtenerCabeceraPorId(id, callback) {
  const sql = `SELECT * FROM facturas WHERE id = ? LIMIT 1`;
  db.get(sql, [id], callback); // db.get en vez de db.all porque devuelve una sola fila
},

obtenerProductosFactura(id, callback) {
  const sql = `
    SELECT * FROM facturas 
    WHERE numero = (SELECT numero FROM facturas WHERE id = ?) 
      AND serie = (SELECT serie FROM facturas WHERE id = ?)
  `;
  db.all(sql, [id, id], callback);
},

getUltimaRecepcion(callback) {
  const sql = `SELECT MAX(recepcion) as ultima FROM facturas`;
  db.get(sql, [], (err, row) => {
    if (err) return callback(err);
    const ultima = row?.ultima || 999; // si no hay facturas, empieza en 999
    console.log(row);
    callback(null, ultima + 1);
  });
},

validarYActualizarStock(idFactura, callback) {
  const sqlGet = `SELECT producto, cantidad FROM facturas WHERE id = ?`;
  db.all(sqlGet, [idFactura], (err, productos) => {
    if (err) return callback(err);

    const tareas = productos.map(p => {
      return new Promise((resolve, reject) => {
        Producto.actualizarStockIngresoPorNombre(p.producto, p.cantidad, err => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

  
    Promise.all(tareas)
      .then(() => {
        const sqlEstado = `UPDATE facturas SET estado = 'Validada' WHERE id = ?`;
        db.run(sqlEstado, [idFactura], callback);
      })
      .catch(callback);
  });
},

  listarSoloPendiente(callback) {
    const sql = `SELECT * FROM facturas WHERE estado = 'Pendiente' ORDER BY fecha DESC `;
    db.all(sql, callback);
  },

  listarOK(callback) {
    const sql = `SELECT * FROM facturas WHERE estado <> 'Pendiente' ORDER BY fecha DESC `;
    db.all(sql, callback);
  },

  listar(callback) {
    const sql = `SELECT * FROM facturas ORDER BY fecha DESC LIMIT 10`;
    db.all(sql, callback);
  },

  listarCodigoyFactura(id, callback) {
  const sql = `
    SELECT f.*, p.nombre AS producto_nombre, p.codigo AS codigo_barras
    FROM facturas f
    JOIN productos p ON f.producto = p.nombre
    WHERE numero = (SELECT numero FROM facturas WHERE id = ?) 
    AND serie = (SELECT serie FROM facturas WHERE id = ?)
    ORDER BY f.fecha DESC
  `;
  db.all(sql, [id, id], callback);
  }
};
