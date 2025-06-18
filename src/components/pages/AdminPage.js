// src/components/pages/AdminPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserListPage, BarcosPage, CargasPage, ProductPage } from "./";
import "../../App.css"; // Estilos generales

function AdminPage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(() => {
    if (location.state && location.state.fromBarcoAction) {
      return "barcos";
    }
    if (location.state && location.state.fromCargaAction) {
      return "cargas";
    }
    // ¡NUEVO! Si se viene de una acción de producto, activar la sección 'productos'
    if (location.state && location.state.fromProductAction) {
      return "productos";
    }
    return "users";
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.fromBarcoAction) {
      setActiveSection("barcos");
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state && location.state.fromCargaAction) {
      setActiveSection("cargas");
      navigate(location.pathname, { replace: true, state: {} });
    }
    // ¡NUEVO! Manejar el estado de redirección para productos
    if (location.state && location.state.fromProductAction) {
      setActiveSection("productos");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleCreateUserClick = () => {
    navigate("/createuser");
  };

  const handleMenuClick = (section) => {
    setActiveSection(section);
  };

  const sectionComponents = {
    users: (
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
    ),
    barcos: <BarcosPage />,
    cargas: <CargasPage />,
    productos: <ProductPage />,
    palets: <p>Aquí se gestionarán los palets. (Funcionalidad pendiente)</p>,
  };

  return (
    <div className="page-content">
      <h1 className="main-title">Panel de Administración</h1>

      <div className="admin-menu-top">
        <button
          className={`admin-menu-button ${
            activeSection === "users" ? "active" : ""
          }`}
          onClick={() => handleMenuClick("users")}
        >
          Gestionar Usuarios
        </button>
        <button
          className={`admin-menu-button ${
            activeSection === "barcos" ? "active" : ""
          }`}
          onClick={() => handleMenuClick("barcos")}
        >
          Gestionar Barcos
        </button>
        <button
          className={`admin-menu-button ${
            activeSection === "cargas" ? "active" : ""
          }`}
          onClick={() => handleMenuClick("cargas")}
        >
          Gestionar Cargas
        </button>
        <button
          className={`admin-menu-button ${
            activeSection === "productos" ? "active" : ""
          }`}
          onClick={() => handleMenuClick("productos")}
        >
          Gestionar Producto
        </button>
      </div>

      <div className="admin-content-area">
        {sectionComponents[activeSection]}
      </div>
    </div>
  );
}

export default AdminPage;
