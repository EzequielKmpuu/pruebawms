// db/init.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    usuario VARCHAR(100),
    email TEXT UNIQUE,
    password TEXT,
    rol VARCHAR(20),
    activa BOOLEAN DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    razonSocial TEXT,
    nombre TEXT,
    domicilio TEXT,
    codPostal TEXT,
    contacto TEXT,
    dni TEXT,
    cuit TEXT,
    provincia TEXT,
    lista TEXT, -- 'clasica', 'medium', 'premium', 'vip', 'empleado'
    localidad TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proveedor TEXT,
    nombre TEXT,
    corta TEXT,
    categoria TEXT,
    sub_categoria TEXT,
    codigo TEXT UNIQUE,
    precio REAL,
    stock INTEGER,
    activa BOOLEAN DEFAULT 1
  )`);

   db.run(`CREATE TABLE IF NOT EXISTS ventas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL,
  total REAL NOT NULL,
  usuario TEXT NOT NULL,
  metodo_pago TEXT   
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS detalle_ventas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_venta INTEGER NOT NULL,
  codigo_producto TEXT NOT NULL,
  nombre_producto TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_unitario REAL NOT NULL,
  total_linea REAL NOT NULL,
  FOREIGN KEY (id_venta) REFERENCES ventas(id),
  FOREIGN KEY (codigo_producto) REFERENCES productos(codigo)   
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS facturas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  serie TEXT,
  numero TEXT,
  proveedor TEXT,
  producto TEXT,
  cantidad INTEGER,
  precio_unitario REAL,
  precio_venta REAL,
  usuario TEXT,
  recepcion INTEGER,
  estado TEXT, -- 'Pendiente', 'Validado', 'Eliminada'
  fecha TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS recepciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recepcion TEXT,
  producto TEXT,
  corta TEXT,
  codigo TEXT,
  cantidad INTEGER,
  recibida INTEGER,
  usuario TEXT,
  estado TEXT, -- 'Pendiente', 'Recepcionado', 'Recep-Parcial'
  observacion TEXT,
  fecha TEXT,
  contenedor INTEGER,
  ubicacion TEXT -- 'Ingreso'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS factura_detalle (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  factura_id INTEGER,
  producto_id INTEGER,
  cantidad INTEGER,
  FOREIGN KEY (factura_id) REFERENCES facturas(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS dbprov (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller TEXT,
  activa BOOLEAN DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ubicaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ubicacion TEXT UNIQUE NOT NULL,      -- Ej: "Rack A1", "Contenedor 3"
  tipo TEXT NOT NULL,                  -- Ej: "rack", "contenedor", "zona temporal"
  capacidad_max INTEGER DEFAULT 0,     -- Máximo de unidades
  activa BOOLEAN DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS productos_ubicaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL,
  ubicacion_id INTEGER NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id),
  UNIQUE(producto_id, ubicacion_id) -- evita duplicados
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orden_trabajo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_ot INTEGER,
  tipo VARCHAR(50),
  estado VARCHAR(20),
  usuario_asignado TEXT,
  descripcion TEXT
  referencia_externa VARCHAR(100),
  ubicacion_origen VARCHAR(50),
  ubicacion_destino VARCHAR(50),
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_finalizacion DATETIME,
  observacion TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS despacho (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha_despacho DATE,
  cliente VARCHAR(50),
  estado VARCHAR(50)
)`);

db.run(`CREATE TABLE IF NOT EXISTS despacho_detalle (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_despacho INTEGER,
  id_producto INTEGER,
  cantidad INTEGER
)`);

db.run(`CREATE TABLE IF NOT EXISTS inventario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_producto INTEGER,
  id_ubicacion INTEGER,
  cantidad INTEGER,
  fecha_ultimo_mov DATETIME
)`);

});

db.close();
