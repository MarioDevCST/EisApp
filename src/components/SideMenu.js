// src/components/SideMenu.jsx
import React from "react";
import "./SideMenu.css"; // Importa los estilos para el menú lateral

function SideMenu() {
  return (
    <div className="side-menu">
      <nav className="side-menu-nav">
        <ul>
          <li>
            <a href="#dashboard">Dashboard</a>
          </li>
          {/* Subrayado: Añadido el enlace de Analytics según la imagen */}
          {/*<li><a href="#analytics">Analytics</a></li>*/}
          {/* Puedes añadir más enlaces aquí si es necesario */}
          {/* Por ahora, quitamos los enlaces de perfil, configuración y cerrar sesión
              para que coincida más con la simplicidad de la imagen proporcionada.
              Los podemos añadir de nuevo cuando se necesiten. */}
          <li>
            <a href="#profile">Mi Perfil</a>
          </li>
          {/* <li><a href="#settings">Configuración</a></li> */}
          {/* <li><a href="#logout">Cerrar Sesión</a></li> */}
        </ul>
      </nav>
    </div>
  );
}

export default SideMenu;
