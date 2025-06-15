import React from "react";
import "./Header.css"; // Importa los estilos para la cabecera

function Header() {
  return (
    <header className="app-header">
      <div className="header-left">
        {/* Placeholder para el logo: un cuadrado de color */}
        <div className="logo-placeholder"></div>
        {/* Nombre de la aplicación */}
        <span className="app-name">EisApp</span>
      </div>
      <div className="header-right">
        {/* Placeholder para el nombre de usuario */}
        <span className="user-name-placeholder">Nombre de Usuario</span>
        {/* Placeholder para el logo de usuario */}
        <div className="user-icon-placeholder"></div>
      </div>
    </header>
  );
}

export default Header;
