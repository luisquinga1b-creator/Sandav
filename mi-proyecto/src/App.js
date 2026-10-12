import React, { useState, useEffect } from 'react';
import Axios from 'axios'; // Librería para peticiones HTTP asíncronas

// --- INTEGRACIÓN DE TERCEROS ---
// Motor de carrusel 'React Slick' para la sección Hero
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// --- ESTILOS MODULARES (CSS) ---
import './styles/Global.css';
import './styles/Header.css';
import './styles/Hero.css';
import './styles/Catalogo.css';
import './styles/Formulario.css';
import './styles/Footer.css';
import './styles/Guia.css';
import './App.css'; 

import FormularioCita from './FormularioCita';
import GuiaEstilo from './GuiaEstilo';
import ListaCitas from './ListaCitas'; 

function App() {
  // ==========================================
  // 1. GESTIÓN DE ESTADO (REACT HOOKS)
  // ==========================================
  
  // UI State: Controla la apariencia y navegación
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNavActive, setIsNavActive] = useState(false); // Menú hamburguesa móvil
  const [alert, setAlert] = useState({ show: false, msg: '', type: 'success' }); // Sistema de notificaciones
  
  // Data State: Datos de negocio provenientes de la BD
  const [productos, setProductos] = useState([]); // Array de objetos (Catálogo)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null); // Producto elegido por el usuario
  
  // Dashboard State: Contadores y Búsqueda
  const [citasCount, setCitasCount] = useState(0); // Sincronización con BD en tiempo real
  const [showSearch, setShowSearch] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(""); // Filtro dinámico

  // ==========================================
  // 2. LÓGICA DE NEGOCIO Y API (BACKEND)
  // ==========================================

  /**
   * FUNCIÓN: actualizarContador
   * PROPÓSITO: Sincronizar el contador de la bolsa con la base de datos MySQL.
   * MÉTODO: GET Request asíncrono.
   */
  const actualizarContador = () => {
    Axios.get("http://localhost:3001/api/citas")
      .then((response) => {
        // La longitud del array representa el número de citas activas
        setCitasCount(response.data.length);
      })
      .catch(error => console.error("Error de sincronización (Contador):", error));
  };

  /**
   * HOOK: useEffect (Montaje Inicial)
   * PROPÓSITO: Cargar datos iniciales y configurar listeners globales.
   * EQUIVALENTE: componentDidMount en clases antiguas.
   */
  useEffect(() => {
    // A. Carga inicial de datos
    actualizarContador();

    // B. Petición HTTP para obtener el catálogo de productos
    Axios.get("http://localhost:3001/api/productos")
      .then((response) => {
        setProductos(response.data);
      })
      .catch(error => console.error("Error cargando productos:", error));
      
    // C. Persistencia de preferencias (Tema Oscuro/Claro)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-theme');
    }

    // D. Accesibilidad: Cerrar menús con la tecla ESC
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsNavActive(false);
        setAlert(prev => ({ ...prev, show: false }));
        setShowSearch(false); 
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function: Elimina el listener al desmontar para evitar fugas de memoria
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * MANEJADOR DE EVENTOS: elegirProducto
   * PROPÓSITO: UX/UI - Seleccionar un item y llevar al usuario al formulario.
   */
  const elegirProducto = (producto) => {
    setProductoSeleccionado(producto);
    
    // 1. Limpieza de UI: Ocultamos la búsqueda para mostrar el contenido principal
    setSearchTerm(""); 
    setShowSearch(false);

    // 2. Manipulación del DOM (Scroll Suave)
    // Usamos setTimeout para asegurar que el componente Formulario se haya renderizado
    setTimeout(() => {
        const formulario = document.getElementById('agendar');
        if(formulario) {
            formulario.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.body.classList.toggle('dark-theme'); // Manipulación directa de clases del body
    localStorage.setItem('theme', newMode ? 'dark' : 'light'); // Persistencia local
    showAlert(newMode ? "Modo Oscuro Activado" : "Modo Claro Activado");
  };

  const showAlert = (msg, type = 'success') => {
    setAlert({ show: true, msg, type });
    // Auto-cierre de alerta después de 4 segundos
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
  };

  const closeMenu = () => setIsNavActive(false);
  
  // Callback: Se pasa al hijo (Formulario) para que notifique al padre (App)
  const handleAgendarCita = () => {
    actualizarContador();
  };

  // CONFIGURACIÓN: React Slick (Carrusel)
  const heroImages = [
    "/imagenes/new.png", 
    "/imagenes/ab1.png", 
    "/imagenes/ab2.png",
    "/imagenes/ab3.png",
    "/imagenes/ab4.png"
  ];

  const sliderSettings = {
    dots: false, arrows: false, infinite: true, speed: 2500, autoplaySpeed: 5000, autoplay: true, fade: true, cssEase: "linear", pauseOnHover: false
  };

  // ==========================================
  // 3. RENDERIZADO DE LA INTERFAZ (JSX)
  // ==========================================
  return (
    <div className="App">
      {/* RENDERIZADO CONDICIONAL: Alerta Global */}
      {alert.show && <div className="custom-alert">{alert.msg}</div>}

      <div className="top-bar">
        <p>ENVÍOS GLOBALES &nbsp; | &nbsp; SASTRERÍA A MEDIDA</p>
      </div>

      <header>
        {/* MENÚ MÓVIL (Hamburguesa) */}
        <button 
          className={`hamburger-menu ${isNavActive ? 'open' : ''}`} 
          onClick={() => setIsNavActive(!isNavActive)}
        >
          <span></span><span></span><span></span>
        </button>

        <div className="center-icons">
          {/* BARRA DE BÚSQUEDA INTERACTIVA */}
          <div className="search-wrapper">
            <button className="icon-btn" onClick={() => setShowSearch(!showSearch)} title="Buscar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            {/* Input controlado por estado (Two-way binding) */}
            <input 
              type="text" 
              className={`search-input ${showSearch ? 'active' : ''}`}
              placeholder="Buscar abrigo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* BOTÓN DE ADMINISTRACIÓN (Con contador dinámico) */}
          <button className="icon-btn cita-btn" onClick={() => window.location.href='#admin-panel'} title="Ir a Administración">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            {citasCount > 0 && <span className="badge">{citasCount}</span>}
          </button>
        </div>

        {/* LOGO CORPORATIVO (Activo desde public/imagenes) */}
        <a href="/" className="logo-container">
            <img src="/imagenes/log.png" alt="SANDAVB Logo" className="logo-image" />
        </a>

        <nav>
          <ul className={`nav-menu ${isNavActive ? 'active' : ''}`}>
             <li><a href="#inicio" onClick={closeMenu}>INICIO</a></li>
             <li><a href="#catalogo" onClick={closeMenu}>CATÁLOGO</a></li>
             <li><a href="#guia" onClick={closeMenu}>GUÍA</a></li>
             <li><a href="#agendar" onClick={closeMenu}>AGENDAR</a></li>
             <li><a href="#admin-panel" onClick={closeMenu}>ADMIN</a></li> 
             <li>
              <button onClick={() => { toggleTheme(); closeMenu(); }} className="theme-toggle-btn">
                {isDarkMode ? 'MODO CLARO' : 'MODO OSCURO'}
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        
        {/* SECCIÓN HERO: Se oculta si el usuario está buscando algo */}
        {!searchTerm && (
          <section className="hero-container" id="inicio">
            {/* Capa de Fondo: Carrusel React Slick */}
            <div className="hero-carousel-wrapper">
                <Slider {...sliderSettings}>
                    {heroImages.map((imgSrc, index) => (
                        <div key={index} className="hero-slide">
                            <div className="slide-image" style={{backgroundImage: `url('${imgSrc}')`}}></div>
                        </div>
                    ))}
                </Slider>
            </div>

            {/* Capa Superior: Call to Action (CTA) */}
            <div className="hero-overlay-content">
                <div className="hero-content-box">
                  <h1 style={{ fontSize: '3.5rem', textTransform: 'uppercase', letterSpacing: '5px', marginBottom: '20px' }}>
                    Excelencia a Medida
                  </h1>
                  <p style={{ fontSize: '1.2rem', fontStyle: 'italic', color: '#f4f4f4', marginTop: '10px', fontWeight: '300' }}>
                    "El verdadero estilo no se compra, se confecciona."
                  </p>
                  <a href="#catalogo" className="btn-gold">DESCUBRIR COLECCIÓN</a>
                </div>
            </div>
          </section>
        )}

        {/* SECCIÓN CATÁLOGO: Renderizado Dinámico de Listas */}
        <section id="catalogo" className="section" style={{padding: '60px 20px'}}>
            <div className="container">
                <h2 style={{textAlign:'center', fontSize:'2.5rem', marginBottom:'40px'}}>Nuestra Colección</h2>
                <div className="catalogo-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'30px'}}>
                    
                    {/* FILTRADO EN TIEMPO REAL (JS: Filter + Map) */}
                    {productos
                      .filter(prod => prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((prod) => (
                        <div key={prod.id} className="producto-card" style={{border:'1px solid #eee', textAlign:'center', paddingBottom:'20px'}}>
                            <div style={{height:'350px', overflow:'hidden', marginBottom:'15px'}}>
                                <img src={prod.imagen || "https://via.placeholder.com/300x400?text=SANDAVB"} alt={prod.nombre} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            </div>
                            <div style={{padding:'0 15px'}}>
                                <h3 style={{fontSize:'1.2rem', margin:'10px 0'}}>{prod.nombre}</h3>
                                <p style={{color:'#666', fontSize:'0.9rem'}}>{prod.descripcion}</p>
                                <span style={{display:'block', color:'#D4AF37', fontWeight:'bold', fontSize:'1.1rem', margin:'10px 0'}}>
                                    ${prod.precio}
                                </span>
                                <button className="btn-gold" onClick={() => elegirProducto(prod)} style={{width:'100%', padding:'10px', border:'none', background:'#D4AF37', color:'white', cursor:'pointer'}}>
                                    RESERVAR CITA
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {/* Feedback visual si no hay resultados */}
                    {productos.length === 0 && <p style={{textAlign:'center', width:'100%'}}>Cargando productos...</p>}
                </div>
            </div>
        </section>
        
        {!searchTerm && <GuiaEstilo />}
        
        {/* COMPONENTE: FORMULARIO DE CITA */}
        {/* Recibe props para comunicación Padre-Hijo */}
        {!searchTerm && (
            <FormularioCita 
                showAlert={showAlert} 
                onAgendar={handleAgendarCita} 
                productoPreseleccionado={productoSeleccionado}
            />
        )}

        {/* COMPONENTE: PANEL DE ADMINISTRACIÓN */}
        {/* Se pasa la función 'actualizarContador' para refrescar el badge al cancelar */}
        {!searchTerm && (
            <section id="admin-panel" style={{maxWidth: '1200px', margin: '40px auto', padding:'20px'}}>
                <div style={{textAlign:'center', marginBottom:'20px'}}>
                    <span style={{fontSize:'0.8rem', letterSpacing:'2px', color:'#999'}}>ZONA PRIVADA</span>
                    <h3 style={{marginTop:'5px'}}>Panel de Administración</h3>
                </div>
                <ListaCitas onUpdate={actualizarContador} />
            </section>
        )}

      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-top-grid">
            <div className="footer-col brand-col">
              <h3 className="footer-logo">SANDAVB</h3>
              <p className="footer-tagline">Sastrería de alta costura.<br />Tradición y modernidad.</p>
            </div>
            <div className="footer-col links-col">
              <h4 className="footer-heading">Explorar</h4>
              <ul className="footer-links">
                <li><a href="#inicio">Inicio</a></li>
                <li><a href="#catalogo">Colección</a></li>
                <li><a href="#guia">Guía</a></li>
                <li><a href="#agendar">Reservar</a></li>
              </ul>
            </div>
            <div className="footer-col contact-col">
              <h4 className="footer-heading">Contacto</h4>
              <ul className="contact-details">
                <li><span className="icon">📍</span><span>Quito, Ecuador</span></li>
                <li><span className="icon">📞</span><span>+593 2 123 4567</span></li>
                <li><span className="icon">✉️</span><a href="mailto:citas@sandavb.com" className="contact-link">citas@sandavb.com</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <div className="container"><p>&copy; {new Date().getFullYear()} SANDAVB. Derechos reservados.</p></div>
        </div>
      </footer>
    </div>
  );
}

export default App;