const db = require('../db/connection');

db.run(`ALTER TABLE productos ADD COLUMN Proveedor TEXT`, (err) => {
  if (err) {
    console.error("Error al agregar columna", err.message);
  } else {
    console.log("Columna agregada correctamente.");
  }
});