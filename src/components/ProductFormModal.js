// src/components/pages/ProductPage.jsx
import React from "react";
import "../App.css"; // Estilos generales

function ProductPage() {
  return (
    <div className="page-content">
      <h1 className="main-title">Gestión de Productos</h1>

      <div className="button-container" style={{ justifyContent: "flex-end" }}>
        <button className="create-palet-button">
          Crear Producto (Sin Programación)
        </button>
      </div>

      <div
        className="user-list-container"
        style={{
          minHeight: "150px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Aquí se mostrará la lista de productos.</p>
      </div>
    </div>
  );
}

export default ProductPage;
