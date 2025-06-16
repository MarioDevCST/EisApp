// src/components/SideMenu.jsx
import React from "react";
import "./SideMenu.css";
// Importa Link de react-router-dom para la navegación
import { Link } from "react-router-dom";

function SideMenu({ onLogout }) {
  // Asegúrate de que onLogout se pasa como prop si se usa en el SideMenu
  return (
    <div className="side-menu">
      <nav className="side-menu-nav">
        <ul>
          {/* Enlace para el Dashboard (ruta "/") */}
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          {/* Enlace para Mi Perfil (ruta "/profile") */}
          <li>
            <Link to="/profile">Mi Perfil</Link>
          </li>
          {/* Enlace para el Panel de Administración (ruta "/admin") */}
          <li>
            <Link to="/admin">Administración</Link>
          </li>
          {/* Enlace para la página de Barcos */}
          <li>
            <Link to="/barcos">Barcos</Link>
          </li>
          {/* Subrayado: Nuevo enlace para la página de Palets */}
          <li>
            <Link to="/palets">Palets</Link>
          </li>
          {/* Enlace para Cerrar Sesión (ruta "/logout") */}
          <li>
            <Link to="/logout">Cerrar Sesión</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default SideMenu;
