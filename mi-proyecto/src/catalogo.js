import React, { useState, useEffect } from 'react';

function Catalogo({ searchTerm }) {
  // Estado para guardar los productos que vienen de la BD
  const [productos, setProductos] = useState([]);

  // useEffect se ejecuta al cargar la página
  useEffect(() => {
    fetch('http://localhost:3001/api/productos')
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  // Filtramos sobre los productos reales de la BD
  const productosFiltrados = productos.filter(prod => 
    prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    prod.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="section" id="catalogo">
      <div className="container">
        <h2>Nuestra Colección</h2>
        
        {productosFiltrados.length === 0 ? (
           <p style={{textAlign: 'center', fontSize: '1.2rem', color: '#888'}}>
             {productos.length === 0 ? "Cargando colección..." : "No se encontraron abrigos."}
           </p>
        ) : (
          <div className="grid-3">
            {productosFiltrados.map((prod) => (
              <article className="card" key={prod.id}>
                {/* Nota: Asegúrate de que las rutas de imagen en la BD sean correctas */}
                <img src={prod.imagen} alt={prod.nombre} />
                <h3>{prod.nombre}</h3>
                <p>{prod.descripcion}</p>
                <span className="price">${prod.precio}</span>
                <a href="#agendar" className="btn">Agendar Cita</a>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Catalogo;