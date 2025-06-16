// src/components/pages/AdminPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserListPage from "./UserListPage"; // Asume que este es el componente de la lista de usuarios
import BarcosPage from "./BarcosPage"; // Importa el componente BarcosPage
import CargasPage from "./CargasPage"; // Importa el nuevo componente CargasPage
import "../../App.css"; // Estilos generales

function AdminPage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(() => {
    // Verificar si la redirección proviene de BarcoFormPage o BarcoEditPage
    if (location.state && location.state.fromBarcoAction) {
      return "barcos";
    }
    // Si se viene de una acción de carga, activar la sección 'cargas'
    if (location.state && location.state.fromCargaAction) {
      return "cargas";
    }
    return "users"; // Por defecto, mostrar la sección de usuarios
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.fromBarcoAction) {
      setActiveSection("barcos");
      // Limpiar el estado de la ubicación para que no se active en recargas futuras
      navigate(location.pathname, { replace: true, state: {} });
    }
    // Manejar el estado de redirección para cargas
    if (location.state && location.state.fromCargaAction) {
      setActiveSection("cargas");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleCreateUserClick = () => {
    navigate("/createuser"); // Navega a la ruta donde está el formulario de registro (SignupForm)
  };

  // Función para manejar los clics en los botones del menú superior
  const handleMenuClick = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="page-content">
      <h1 className="main-title">Panel de Administración</h1>

      {/* Menú superior de administración */}
      <div className="admin-menu-top">
        <button
          className={`admin-menu-button ${
            activeSection === "users" ? "active" : ""
          }`}
          onClick={() => handleMenuClick("users")}
        >
          Gestionar Usuarios
        </button>
        {/*
          // El botón Gestionar Palets puede estar aquí si hay una sección de gestión de palets
          // que no es el PaletList principal. Por ahora, se mantendrá como placeholder
          <button 
            className={`admin-menu-button ${activeSection === 'palets' ? 'active' : ''}`}
            onClick={() => handleMenuClick('palets')}
          >
            Gestionar Palets
          </button>
        */}
        <button
          className={`admin-menu-button ${
            activeSection === "barcos" ? "active" : ""
          }`}
          onClick={() => handleMenuClick("barcos")}
        >
          Gestionar Barcos
        </button>
        {/* Nuevo botón para "Gestionar Cargas" */}
        <button
          className={`admin-menu-button ${
            activeSection === "cargas" ? "active" : ""
          }`}
          onClick={() => handleMenuClick("cargas")}
        >
          Gestionar Cargas
        </button>
      </div>

      {/* Área de contenido dinámico según la sección activa */}
      <div className="admin-content-area">
        {activeSection === "users" && (
          <>
            <div
              className="button-container"
              style={{ justifyContent: "flex-end" }}
            >
              <button
                className="create-palet-button"
                onClick={handleCreateUserClick}
              >
                Crear Usuario
              </button>
            </div>
            <UserListPage />
          </>
        )}
        {activeSection === "palets" && (
          <p>Aquí se gestionarán los palets. (Funcionalidad pendiente)</p>
        )}
        {/* BarcosPage se renderiza condicionalmente aquí cuando activeSection es 'barcos' */}
        {activeSection === "barcos" && <BarcosPage />}
        {/* CargasPage se renderiza condicionalmente aquí cuando activeSection es 'cargas' */}
        {activeSection === "cargas" && <CargasPage />}
      </div>
    </div>
  );
}

export default AdminPage;
