import React, { useState, useEffect } from 'react';
import './index.css';
import Catalogo from './catalogo'; 
import FormularioCita from './FormularioCita';
import GuiaEstilo from './GuiaEstilo';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNavActive, setIsNavActive] = useState(false);
  const [alert, setAlert] = useState({ show: false, msg: '', type: 'success' });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-theme');
    }
    
    // Cerrar menú con tecla Escape (OnKeyDown)
    const handleEsc = (e) => { if (e.key === 'Escape') setIsNavActive(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    showAlert(newMode ? "Modo Oscuro Activado" : "Modo Claro Activado");
  };

  const showAlert = (msg, type = 'success') => {
    setAlert({ show: true, msg, type });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
  };

  const closeMenu = () => setIsNavActive(false);

  return (
    <div className="App">
      {alert.show && (
        <div className="custom-alert">
          {alert.msg}
        </div>
      )}

      <header>
        <a href="/" className="logo">SANDAVB</a>
        
        {/* Botón hamburguesa con líneas estilizadas */}
        <button 
          className={`hamburger-menu ${isNavActive ? 'open' : ''}`} 
          onClick={() => setIsNavActive(!isNavActive)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav>
          <ul className={`nav-menu ${isNavActive ? 'active' : ''}`}>
            <li><a href="#inicio" onClick={closeMenu}>INICIO</a></li>
            <li><a href="#catalogo" onClick={closeMenu}>CATÁLOGO</a></li>
            <li><a href="#guia" onClick={closeMenu}>GUÍA</a></li>
            <li><a href="#agendar" onClick={closeMenu}>AGENDAR</a></li>
            <li>
              <button onClick={() => { toggleTheme(); closeMenu(); }} className="theme-toggle-btn">
                {isDarkMode ? '☀️ CLARO' : '🌙 OSCURO'}
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <section className="hero" id="inicio">
          <img 
            src="/imagenes/hero-image_1763998313116_1765499649426.jpg" 
            alt="Hero" 
            className="interactive-img" 
          />
          <div className="hero-content">
            <h1>ELEGANCIA ATEMPORAL</h1>
            <p>SASTRERÍA A MEDIDA PARA EL CABALLERO MODERNO</p>
            <a href="#catalogo" className="btn">VER CATÁLOGO</a>
          </div>
        </section>

        <Catalogo />
        <GuiaEstilo />
        <FormularioCita showAlert={showAlert} />
      </main>

      <footer>
        <div className="container footer-grid">
          <div className="footer-section">
            <h3 className="logo">SANDAVB</h3>
            <p>Sastrería de alta costura donde la tradición se encuentra con la modernidad.</p>
          </div>
          <div className="footer-section">
            <h3>Contacto</h3>
            <p>📍 Calle de la Elegancia 123, Quito</p>
            <p>📞 +593 2 123 4567</p>
            <p>✉️ citas@sandavb.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 SANDAVB. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;