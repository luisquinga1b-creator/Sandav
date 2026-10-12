

import React, { useState, useEffect } from 'react';
import Axios from 'axios';

/**
 * COMPONENTE FUNCIONAL: ListaCitas
 * PROPS:
 * - onUpdate: Función callback que se ejecuta cuando una cita es cancelada.
 * Sirve para avisar a App.js que actualice el contador del badge.
 */
function ListaCitas({ onUpdate }) {
  
  // ==========================================
  // 1. GESTIÓN DE ESTADO LOCAL
  // ==========================================
  
  // Almacena las citas activas traídas de la BD
  const [citas, setCitas] = useState([]);
  
  // Almacena el historial de cancelaciones (Auditoría)
  const [historial, setHistorial] = useState([]); 
  
  // Toggle (Interruptor) para cambiar entre la vista de Agenda y Papelera
  const [verCanceladas, setVerCanceladas] = useState(false); 

  
  // Petición GET para obtener citas pendientes
  const cargarCitas = () => {
    Axios.get("http://localhost:3001/api/citas").then((response) => {
      setCitas(response.data);
    }).catch(err => console.error("Error al cargar citas:", err));
  };

  // Petición GET para obtener el historial (Tabla 'citas_eliminadas')
  const cargarHistorial = () => {
    Axios.get("http://localhost:3001/api/historial").then((response) => {
      setHistorial(response.data);
    }).catch(err => console.error("Error al cargar historial:", err));
  };

  // useEffect: Se ejecuta al montar el componente para traer los datos iniciales
  useEffect(() => {
    cargarCitas();
    cargarHistorial();
  }, []);


  /**
   * FUNCIÓN: cancelarCita
   * DESCRIPCIÓN: Elimina una cita de la tabla principal.
   * NOTA TÉCNICA: Al borrar, el Trigger de MySQL mueve el dato al historial.
   */
  const cancelarCita = (id) => {
    // Confirmación nativa del navegador para evitar clics accidentales
    if(window.confirm("¿Está seguro de que desea CANCELAR esta cita? El registro se moverá al historial de cancelaciones.")) {
      
      // Petición DELETE al servidor
      Axios.delete(`http://localhost:3001/api/citas/${id}`).then(() => {
        alert("Cita cancelada correctamente.");
        
        // A. Actualizamos las listas locales para reflejar el cambio en la UI
        cargarCitas();
        cargarHistorial();

        // B. COMUNICACIÓN HIJO -> PADRE
        // Ejecutamos el callback para que App.js actualice el número en la bolsa
        if (onUpdate) {
            onUpdate();
        }

      }).catch(err => alert("Error al procesar la cancelación."));
    }
  };

  // Selector Dinámico: Determina qué array mostrar basándose en el estado 'verCanceladas'
  const listaParaMostrar = verCanceladas ? historial : citas;

  // ==========================================
  // 4. RENDERIZADO (JSX)
  // ==========================================
  return (
    <div className="admin-dashboard">
      
      {/* --- CABECERA DEL PANEL (Con Botón Toggle) --- */}
      <div className="dashboard-header">
        <div>
          <h2 style={{fontFamily: 'Playfair Display, serif', fontSize: '2rem'}}>
            {/* Título dinámico según la vista activa */}
            {verCanceladas ? "Historial de Cancelaciones" : "Agenda de Clientes"}
          </h2>
          <p className="subtitle">Gestión de Citas SANDAVB</p>
        </div>
        
        {/* Botón para alternar vistas (Agenda <-> Papelera) */}
        <button 
          className={`btn-toggle-history ${verCanceladas ? 'active' : ''}`} 
          onClick={() => setVerCanceladas(!verCanceladas)}
          style={{
            backgroundColor: verCanceladas ? "#111" : "transparent",
            color: verCanceladas ? "#D4AF37" : "#111",
            border: "1px solid #111",
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: "bold",
            letterSpacing: "1px"
          }}
        >
          {verCanceladas ? "⬅ VER AGENDA ACTIVA" : "CITAS CANCELADAS ♻️"}
        </button>
      </div>
      
      {/* --- ESTADO VACÍO (Empty State) --- */}
      {/* Feedback visual si no hay datos en la lista actual */}
      {listaParaMostrar.length === 0 && (
        <div style={{textAlign: "center", padding: "50px", color: "#999"}}>
          <p>{verCanceladas ? "No hay registros en el historial de cancelaciones." : "No hay citas pendientes en la agenda."}</p>
        </div>
      )}

      {/* --- GRID DE TARJETAS (Renderizado de Listas) --- */}
      <div className="citas-grid" style={{display: 'grid', gap: '20px'}}>
        {listaParaMostrar.map((val, key) => (
          
          /* TARJETA INDIVIDUAL (TICKET) */
          <div 
            key={key} 
            // Clase condicional para cambiar el estilo si es cancelada (Borde Rojo vs Dorado)
            className={`cita-ticket ${verCanceladas ? 'ticket-cancelado' : ''}`}
            style={{
              display: 'flex',
              background: 'white',
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              borderLeft: `5px solid ${verCanceladas ? '#e74c3c' : '#D4AF37'}`
            }}
          >
            
            {/* COLUMNA 1: FECHA Y HORA (Estilo Calendario) */}
            <div style={{
              padding: '20px',
              textAlign: 'center',
              borderRight: '1px dashed #ddd',
              minWidth: '120px',
              backgroundColor: '#fcfcfc'
            }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 'bold',
                padding: '4px 8px',
                borderRadius: '10px',
                backgroundColor: verCanceladas ? '#fff5f5' : '#f0f9f1',
                color: verCanceladas ? '#c0392b' : '#27ae60'
              }}>
                {verCanceladas ? "CANCELADA" : "CONFIRMADA"}
              </span>
              <div style={{marginTop: '15px'}}>
                {/* Formateo de fecha: Extraemos día y mes */}
                <span style={{display: 'block', fontSize: '1.8rem', fontWeight: 'bold', lineHeight: '1'}}>
                  {val.fecha_cita ? val.fecha_cita.substring(8, 10) : "??"}
                </span>
                <span style={{fontSize: '0.75rem', color: '#666', letterSpacing: '2px', textTransform: 'uppercase'}}>
                   {val.fecha_cita ? new Date(val.fecha_cita).toLocaleString('es-ES', { month: 'short' }) : "MES"}
                </span>
              </div>
              <div style={{marginTop: '10px', fontSize: '0.9rem', fontWeight: 'bold', color: '#D4AF37'}}>
                {val.hora_preferida}
              </div>
            </div>

            {/* COLUMNA 2: DETALLES DEL CLIENTE */}
            <div style={{padding: '20px 30px', flexGrow: 1}}>
              <h3 style={{margin: '0', fontSize: '1.4rem', color: '#111'}}>{val.nombre}</h3>
              <p style={{color: '#999', fontSize: '0.85rem', margin: '5px 0 15px 0'}}>CI: {val.cedula || 'No registrada'}</p>
              
              <div style={{display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#555'}}>
                <span>📧 {val.email}</span>
                <span>📱 {val.telefono}</span>
              </div>

              <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee'}}>
                <strong>Prenda:</strong> {val.producto || "Asesoría General"} 
                {val.talla && <span style={{
                  marginLeft: '10px',
                  backgroundColor: '#f0f0f0',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>Talla: {val.talla}</span>}
              </div>

              {/* Timestamp de cancelación (Solo visible en historial) */}
              {verCanceladas && val.fecha_borrado && (
                <div style={{marginTop: '10px', color: '#e74c3c', fontSize: '0.8rem', fontStyle: 'italic'}}>
                  ⚠️ Cancelada el: {new Date(val.fecha_borrado).toLocaleString()}
                </div>
              )}
            </div>

            {/* COLUMNA 3: ACCIONES (Botón Cancelar) */}
            {/* Solo se muestra si NO estamos viendo las ya canceladas */}
            {!verCanceladas && (
              <div style={{padding: '20px', display: 'flex', alignItems: 'center', backgroundColor: '#fafafa'}}>
                <button 
                  onClick={() => cancelarCita(val.id)}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#999',
                    border: '1px solid #ddd',
                    padding: '10px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = '#e74c3c';
                    e.target.style.borderColor = '#e74c3c';
                    e.target.style.backgroundColor = '#fff5f5';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = '#999';
                    e.target.style.borderColor = '#ddd';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  CANCELAR CITA
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListaCitas;