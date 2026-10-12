import React from 'react';
import './styles/Guia.css'; 

const GuiaEstilo = () => {
  const guias = [
    {
      id: 1,
      titulo: "Limpieza Profesional",
      texto: "Recomendamos limpieza en seco exclusivamente. El vapor suave reactiva las fibras y elimina arrugas.",
      // AQUI LLAMAMOS A TU VIDEO LOCAL 1:
      video: "/videos/limpieza.mp4", 
      icono: "✨"
    },
    {
      id: 2,
      titulo: "Almacenamiento",
      texto: "Utiliza perchas anchas de madera de cedro para mantener la forma de los hombros y repeler la humedad.",
      // AQUI LLAMAMOS A TU VIDEO LOCAL 2:
      video: "/videos/guardado.mp4",
      icono: "🧥"
    },
    {
      id: 3,
      titulo: "Rotación de Uso",
      texto: "Deja descansar tu abrigo al menos 24 horas entre usos para que las fibras recuperen su forma natural.",
      // AQUI LLAMAMOS A TU VIDEO LOCAL 3:
      video: "/videos/uso.mp4",
      icono: "⏳"
    }
  ];

  return (
    <section className="section guide-section" id="guia">
      <div className="container">
        <h2>Guía de Cuidado</h2>
        <p style={{textAlign: 'center', marginBottom: '3rem', color: '#666'}}>
            El arte de mantener la elegancia perdurable.
        </p>

        <div className="guide-grid">
          {guias.map((item) => (
            <article className="guide-card" key={item.id}>
              
              {/* VIDEO LOCAL */}
              <video 
                className="guide-video" 
                src={item.video} 
                autoPlay 
                loop 
                muted 
                playsInline 
              >
                Tu navegador no soporta videos.
              </video>
              
              <div className="card-icon">{item.icono}</div>

              <div className="guide-content">
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
              </div>
              
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuiaEstilo;