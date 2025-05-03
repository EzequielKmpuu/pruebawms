const sqlite3 = require('sqlite3').verbose();

// Conectar o crear base de datos SQLite
const db = new sqlite3.Database('./wms.db', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos', err.message);
    } else {
        console.log('Conexión exitosa a la base de datos DATABASE');
    }
});

// Crear tabla de usuarios si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT NOT NULL,
        contraseña TEXT NOT NULL,
        rol TEXT NOT NULL
    )
`);

// Crear tabla de productos si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  codigo_barra INTEGER UNIQUE NOT NULL,
  UxCaja INTEGER NOT NULL,
  Categoria TEXT NOT NULL,
  sub_categoria TEXT NOT NULL,
  stock INTEGER NOT NULL
    )
`);

module.exports = db;