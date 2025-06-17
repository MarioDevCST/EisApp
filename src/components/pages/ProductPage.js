// src/components/pages/ProductPage.jsx
import React from "react"; // ¡CAMBIO! Eliminamos useState, ya no es necesario por ahora
// ¡CAMBIO! Eliminamos la importación del modal por ahora: import ProductFormModal from '../ProductFormModal';
import "../../App.css"; // Estilos generales

function ProductPage() {
  // ¡CAMBIO! Eliminamos el estado showProductModal y la función handleSaveProduct por ahora.
  // La lógica para abrir el modal y guardar el producto se añadirá en el futuro.

  return (
    <div className="page-content">
      <h1 className="main-title">Gestión de Productos</h1>

      <div className="button-container" style={{ justifyContent: "flex-end" }}>
        <button
          className="create-palet-button"
          // ¡CAMBIO! El onClick ahora no tiene ninguna funcionalidad asociada.
          // En el futuro, aquí se volverá a añadir la lógica para abrir el modal.
          onClick={() =>
            console.log("Botón 'Crear Producto' clicado (modal pendiente)")
          }
        >
          Crear Producto
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

      {/* ¡CAMBIO! Eliminamos la renderización del ProductFormModal por ahora.
          Se volverá a añadir cuando se implemente la funcionalidad del modal. */}
      {/* <ProductFormModal
        show={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSave={handleSaveProduct}
      /> */}
    </div>
  );
}

export default ProductPage;
