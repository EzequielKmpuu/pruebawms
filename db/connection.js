const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
  if (err) console.error('Error al conectar a la BD', err);
});

db.run(`CREATE TABLE IF NOT EXISTS movimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER,
  tipo TEXT, -- 'entrada', 'salida', 'traslado'
  cantidad INTEGER,
  usuario TEXT,
  observacion TEXT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  ubicacion_origen TEXT,
  ubicacion_destino TEXT,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
)`);


module.exports = db;
