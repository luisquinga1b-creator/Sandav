
// --- 1. IMPORTACIÓN DE LIBRERÍAS (DEPENDENCIAS) ---
const express = require('express');      // Framework para crear el servidor web
const mysql = require('mysql2');         // Driver para conectar con la base de datos MySQL
const cors = require('cors');            // Middleware para permitir peticiones desde otro dominio (React corre en puerto 3000)
const bodyParser = require('body-parser'); // Middleware para leer datos JSON enviados en el cuerpo de las peticiones

// --- 2. CONFIGURACIÓN INICIAL DEL SERVIDOR ---
const app = express(); // Inicializamos la aplicación de Express

// --- MIDDLEWARES ---
// CORS: Permite que nuestro Frontend (http://localhost:3000) pueda pedir datos a este Backend (http://localhost:3001)
app.use(cors()); 
// BodyParser: Permite que el servidor entienda los datos JSON que llegan en los POST requests
app.use(bodyParser.json());

// --- 3. CONEXIÓN A LA BASE DE DATOS (MySQL) ---
const db = mysql.createConnection({
    host: 'localhost',      // Dirección del servidor de BD (local)
    user: 'root',           // Usuario administrador de MySQL
    password: '1234',       // Contraseña configurada en Workbench
    database: 'sandavb_db'  // Nombre de la base de datos del proyecto
});

// Intentamos conectar y mostramos resultado en consola
db.connect(err => {
    if (err) {
        console.error('❌ Error crítico conectando a la BD:', err);
        return;
    }
    console.log('✅ ¡Conexión exitosa a MySQL! Base de datos: sandavb_db');
});

/**
 * ============================================================================
 * SECCIÓN DE RUTAS (ENDPOINTS DE LA API)
 * Aquí definimos qué hace el servidor cuando recibe peticiones.
 * ============================================================================
 */

// --- RUTA 1: CONSULTAR CATÁLOGO DE PRODUCTOS (GET) ---
// Se usa para mostrar los abrigos en la página principal.
app.get('/api/productos', (req, res) => {
    const sql = "SELECT * FROM productos"; // Consulta SQL simple
    db.query(sql, (err, data) => {
        if(err) return res.json(err); // Si falla, devolvemos el error al frontend
        return res.json(data);        // Si funciona, devolvemos la lista de abrigos
    });
});

// --- RUTA 2: CONSULTAR AGENDA ACTIVA (GET) ---
// Se usa en el Panel de Administración para ver quién ha reservado.
app.get('/api/citas', (req, res) => {
    const sql = "SELECT * FROM citas";
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
});

// --- RUTA 3: REGISTRAR NUEVA CITA (POST) ---
// Recibe los datos del formulario y los guarda en la tabla 'citas'.
app.post('/api/agendar', (req, res) => {
    // 1. Destructuración: Extraemos los datos que vienen del formulario (req.body)
    const { nombre, cedula, email, telefono, edad, presupuesto, fecha_cita, hora_preferida, producto, talla } = req.body;
    
    // 2. Consulta SQL Preparada (Prepared Statement)
    // Usamos signos de interrogación (?) para evitar Inyecciones SQL (Seguridad)
    const sql = "INSERT INTO citas (nombre, cedula, email, telefono, edad, presupuesto, fecha_cita, hora_preferida, producto, talla) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    // 3. Arreglo de valores que reemplazarán a los signos de interrogación
    const values = [nombre, cedula, email, telefono, edad, presupuesto, fecha_cita, hora_preferida, producto, talla];

    // 4. Ejecutamos la inserción
    db.query(sql, values, (err, result) => {
        if(err) {
            console.error("Error al insertar:", err);
            return res.status(500).json({ error: "Error interno al guardar la cita" });
        }
        // Respondemos al frontend que todo salió bien
        return res.json({ status: "success", message: "Cita registrada correctamente" });
    });
});

// --- RUTA 4: CANCELAR CITA (DELETE) ---
// Elimina un registro de la tabla 'citas'.
// NOTA IMPORTANTE: Al ejecutar este DELETE, MySQL activa automáticamente
// el TRIGGER 'citas_BEFORE_DELETE' que mueve los datos a 'citas_eliminadas'.
app.delete('/api/citas/:id', (req, res) => {
    const id = req.params.id; // Capturamos el ID que viene en la URL (ej: /api/citas/5)
    const sql = "DELETE FROM citas WHERE id = ?"; 
    
    db.query(sql, id, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error al eliminar");
        } 
        res.send(result);
    });
});

// --- RUTA 5: CONSULTAR HISTORIAL / AUDITORÍA (GET) ---
// Muestra las citas que fueron canceladas y movidas por el Trigger.
app.get('/api/historial', (req, res) => {
    // Ordenamos por 'fecha_borrado DESC' para ver lo último que se borró al principio
    const sql = "SELECT * FROM citas_eliminadas ORDER BY fecha_borrado DESC";
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
});

// --- 4. INICIO DEL SERVIDOR ---
// Ponemos al servidor a "escuchar" peticiones en el puerto 3001
app.listen(3001, () => {
    console.log("🚀 Servidor Backend corriendo en puerto 3001 (http://localhost:3001)");
});