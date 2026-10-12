import React, { useState, useEffect } from 'react';

const FormularioCita = ({ showAlert, onAgendar, productoPreseleccionado }) => {
  const [formData, setFormData] = useState({
    nombre: '', 
    cedula: '',      
    email: '', 
    telefono: '', 
    edad: '',          
    presupuesto: '',   
    fecha_cita: '', 
    hora_preferida: '', 
    producto: '', 
    talla: ''
  });

  // Si seleccionan un producto del catálogo, llenamos los datos automáticamente
  useEffect(() => {
    if (productoPreseleccionado) {
      setFormData(prev => ({
        ...prev,
        producto: productoPreseleccionado.nombre,
        presupuesto: productoPreseleccionado.precio
      }));
    }
  }, [productoPreseleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // VALIDACIÓN EN TIEMPO REAL (UX)
    
    // 1. Teléfono y Cédula: Solo permitir números
    if ((name === 'telefono' || name === 'cedula' || name === 'edad' || name === 'presupuesto') && isNaN(value)) {
        return; // Si no es número, no escribe nada
    }

    // 2. Teléfono: Máximo 10 dígitos
    if (name === 'telefono' && value.length > 10) return;

    // 3. Cédula: Máximo 10 dígitos
    if (name === 'cedula' && value.length > 10) return;

    setFormData({ ...formData, [name]: value });
  };

  // --- ALGORITMO VALIDACIÓN CÉDULA ECUADOR ---
  const validarCedulaEcuador = (cedula) => {
    if (cedula.length !== 10) return false;
    const digitoRegion = parseInt(cedula.substring(0, 2));
    if (digitoRegion < 1 || digitoRegion > 24) return false; // Provincias del 1 al 24
    
    const ultimoDigito = parseInt(cedula.substring(9, 10));
    const pares = parseInt(cedula.substring(1, 2)) + parseInt(cedula.substring(3, 4)) + parseInt(cedula.substring(5, 6)) + parseInt(cedula.substring(7, 8));
    
    let numeroUno = parseInt(cedula.substring(0, 1)) * 2;
    if (numeroUno > 9) numeroUno -= 9;
    let numeroTres = parseInt(cedula.substring(2, 3)) * 2;
    if (numeroTres > 9) numeroTres -= 9;
    let numeroCinco = parseInt(cedula.substring(4, 5)) * 2;
    if (numeroCinco > 9) numeroCinco -= 9;
    let numeroSiete = parseInt(cedula.substring(6, 7)) * 2;
    if (numeroSiete > 9) numeroSiete -= 9;
    let numeroNueve = parseInt(cedula.substring(8, 9)) * 2;
    if (numeroNueve > 9) numeroNueve -= 9;

    const impares = numeroUno + numeroTres + numeroCinco + numeroSiete + numeroNueve;
    const sumaTotal = pares + impares;
    const primerDigitoSuma = parseInt(String(sumaTotal).substring(0, 1));
    const decena = (primerDigitoSuma + 1) * 10;
    
    let digitoValidador = decena - sumaTotal;
    if (digitoValidador === 10) digitoValidador = 0;

    return digitoValidador === ultimoDigito;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // --- 1. VALIDACIÓN DE NOMBRE (No permitir 'mi espe') ---
    // Regex: Solo letras y espacios. Debe tener al menos un espacio (Nombre + Apellido)
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombreRegex.test(formData.nombre) || formData.nombre.trim().split(' ').length < 2) {
        alert("⚠️ Por favor ingresa tu Nombre y Apellido completos (sin números ni símbolos).");
        return;
    }

    // --- 2. VALIDACIÓN DE CÉDULA ---
    if (!validarCedulaEcuador(formData.cedula)) {
        alert("⚠️ El número de Cédula es incorrecto (Algoritmo Ecuatoriano).");
        return;
    }

    // --- 3. VALIDACIÓN DE TELÉFONO (Empieza con 09 y son 10 dígitos) ---
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(formData.telefono)) {
        alert("⚠️ El celular debe tener 10 dígitos y empezar con '09'.");
        return;
    }

    // --- 4. VALIDACIÓN DE HORA (07:00 a 20:00) ---
    const [hora, minutos] = formData.hora_preferida.split(':').map(Number);
    if (hora < 7 || hora > 20 || (hora === 20 && minutos > 0)) {
        alert("⚠️ Nuestro horario de atención es de 07:00 AM a 08:00 PM.");
        return;
    }

    // --- 5. VALIDACIÓN DE CAMPOS VACÍOS ---
    if (!formData.email || !formData.edad || !formData.fecha_cita || !formData.talla) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
    }

    // SI PASA TODO, ENVIAMOS AL SERVIDOR
    fetch('http://localhost:3001/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            showAlert("¡Cita reservada con éxito!", "success");
            if (onAgendar) onAgendar();
            setFormData({ nombre: '', cedula: '', email: '', telefono: '', edad: '', presupuesto: '', fecha_cita: '', hora_preferida: '', producto: '', talla: '' });
        } else {
            alert("Error del servidor: " + JSON.stringify(data));
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error de conexión. Revisa que el servidor esté encendido.");
    });
  };

  return (
    <section className="section appointment-section" id="agendar" style={{maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
      <h2 style={{textAlign: 'center', marginBottom: '20px', fontFamily: 'Playfair Display, serif'}}>Finalizar Reserva</h2>
      
      <form onSubmit={handleSubmit} style={{display: 'grid', gap: '20px', background: '#fcfcfc', padding: '40px', borderRadius: '4px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)'}}>
        
        {/* CAMPO DE PRODUCTO */}
        <div className="form-group">
            <label style={{fontWeight:'bold', color: '#D4AF37', fontSize:'0.9rem', textTransform:'uppercase'}}>Abrigo Seleccionado</label>
            <input 
                type="text" 
                name="producto" 
                value={formData.producto} 
                readOnly 
                placeholder="Selecciona un abrigo del catálogo..."
                style={{width: '100%', padding: '15px', border: '1px solid #eee', background: '#f9f9f9', fontFamily:'Lato, sans-serif'}}
            />
        </div>

        {/* NOMBRE Y CÉDULA */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
             <input type="text" name="nombre" placeholder="Nombre y Apellido" value={formData.nombre} onChange={handleChange} style={inputStyle} required/>
             <input type="text" name="cedula" placeholder="Cédula (10 dígitos)" value={formData.cedula} onChange={handleChange} style={inputStyle} maxLength="10" required/>
        </div>

        {/* EMAIL Y TELÉFONO */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
             <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleChange} style={inputStyle} required/>
             <input type="tel" name="telefono" placeholder="Celular (09...)" value={formData.telefono} onChange={handleChange} style={inputStyle} maxLength="10" required/>
        </div>

        {/* EDAD, PRESUPUESTO Y TALLA */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px'}}>
             <input type="number" name="edad" placeholder="Edad" value={formData.edad} onChange={handleChange} style={inputStyle} required min="18" />
             <input type="number" name="presupuesto" placeholder="Presupuesto ($)" value={formData.presupuesto} onChange={handleChange} style={inputStyle} required />
             <select name="talla" value={formData.talla} onChange={handleChange} style={inputStyle} required>
                <option value="">Talla</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
             </select>
        </div>

        {/* FECHA Y HORA */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
             <div style={{position:'relative'}}>
                 <label style={{fontSize:'0.8rem', color:'#666', marginBottom:'5px', display:'block'}}>Fecha de Cita</label>
                 <input type="date" name="fecha_cita" value={formData.fecha_cita} onChange={handleChange} style={inputStyle} required/>
             </div>
             <div style={{position:'relative'}}>
                 <label style={{fontSize:'0.8rem', color:'#666', marginBottom:'5px', display:'block'}}>Hora (07:00 - 20:00)</label>
                 <input type="time" name="hora_preferida" value={formData.hora_preferida} onChange={handleChange} style={inputStyle} required min="07:00" max="20:00"/>
             </div>
        </div>

        <button type="submit" className="btn-gold" style={{width: '100%', marginTop: '20px', padding: '18px', fontSize: '1rem', letterSpacing:'2px'}}>
            CONFIRMAR CITA
        </button>
      </form>
    </section>
  );
};

// Estilo unificado para los inputs para que se vean premium
const inputStyle = {
    padding: '15px', 
    border: '1px solid #e0e0e0', 
    borderRadius: '2px', // Bordes más rectos = más elegante
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.3s'
};

export default FormularioCita;