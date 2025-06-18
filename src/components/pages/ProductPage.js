// src/components/pages/ProductPage.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import ProductFormModal from "../ProductFormModal";
import { useNavigate } from "react-router-dom";
import "../../App.css"; // Estilos generales
import { getTypeCodeColor } from "../../utils/colors"; // ¡CAMBIO CLAVE! Importa la función de colores

function ProductPage() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ¡CAMBIO CLAVE! La función getTypeCodeColor ha sido eliminada de aquí
  // y ahora se importa desde src/utils/colors.js

  // Efecto para cargar los productos desde Firestore y mantenerlos actualizados
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      collection(db, "Productos"),
      (snapshot) => {
        const productsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
        setLoading(false);
      },
      (err) => {
        console.error("Error al escuchar los productos:", err);
        setError("Error al cargar los productos: " + err.message);
        setLoading(false);
      }
    );

    // Función de limpieza para desuscribirse del listener
    return () => unsubscribe();
  }, []);

  // Función para abrir el modal en modo creación
  const handleCreateProductClick = () => {
    setShowProductModal(true);
  };

  // Función para navegar a la página de detalle del producto para edición
  const handleEditProductClick = (productId) => {
    navigate(`/productdetailpage/${productId}`); // Navega a la nueva ruta de detalle
  };

  // Función para manejar el guardado de un NUEVO producto (solo creación ahora)
  const handleSaveProduct = async (productData) => {
    try {
      await addDoc(collection(db, "Productos"), productData);
      console.log("Producto guardado con éxito:", productData);
      setShowProductModal(false); // Cierra el modal después de guardar
    } catch (err) {
      console.error("Error al guardar el producto:", err);
      setError("Hubo un error al guardar el producto: " + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="page-content">
      <h1 className="main-title">Gestión de Productos</h1>

      <div className="button-container" style={{ justifyContent: "flex-end" }}>
        <button
          className="create-palet-button"
          onClick={handleCreateProductClick} // Usa la función para crear
        >
          Crear Producto
        </button>
      </div>

      {products.length > 0 ? (
        <div className="user-list-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="user-image-cell">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.nombre}
                        className="user-table-image"
                      />
                    ) : (
                      <div className="user-table-image-placeholder">📦</div>
                    )}
                  </td>
                  <td>{product.codigo || "N/A"}</td>
                  <td>{product.nombre || "N/A"}</td>
                  <td>{product.descripcion || "N/A"}</td>
                  <td
                    style={{
                      textAlign: "center",
                      backgroundColor: getTypeCodeColor(product.tipo),
                      borderRadius: "5px",
                      padding: "5px",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {product.tipo || "N/A"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {/* Botón de Editar ahora navega a ProductDetailPage */}
                    <button
                      className="action-button edit-button"
                      style={{ marginRight: "5px" }}
                      onClick={() => handleEditProductClick(product.id)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="user-list-container"
          style={{
            minHeight: "150px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p>No hay productos registrados. Crea uno nuevo.</p>
        </div>
      )}

      {/* ProductFormModal ahora es solo para creación */}
      <ProductFormModal
        show={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
}

export default ProductPage;
