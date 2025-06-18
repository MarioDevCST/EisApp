// src/components/pages/ProductDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../db/firebase-config";
import { doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import useForm from "../../hooks/useForm";
import "../../App.css";

function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const {
    formData,
    handleChange,
    setFormData,
    imagePreviewUrl,
    setImagePreviewUrl,
  } = useForm({
    codigo: "", // Changed to string for leading zeros
    nombre: "",
    descripcion: "",
    tipo: "Seco",
    imageUrl: "",
  });

  const getTypeCodeColor = (tipo) => {
    switch (tipo) {
      case "Seco":
        return "#f5cba7";
      case "Refrigerado":
        return "#abebc6";
      case "Congelado":
        return "#aed6f1";
      case "Tecnico":
        return "#d2b4de";
      default:
        return "#95a5a6";
    }
  };

  useEffect(() => {
    if (!productId) {
      setError("ID de producto no proporcionado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage("");

    const productRef = doc(db, "Productos", productId);
    const unsubscribe = onSnapshot(
      productRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          setFormData({
            codigo: String(data.codigo) || "", // Ensure it's treated as a string
            nombre: data.nombre || "",
            descripcion: data.descripcion || "",
            tipo: data.tipo || "Seco",
            imageUrl: data.imageUrl || "",
          });
          setImagePreviewUrl(data.imageUrl || "");
          setLoading(false);
        } else {
          setError("Producto no encontrado.");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error al cargar el producto:", err);
        setError("Error al cargar los detalles del producto: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [productId, setFormData, setImagePreviewUrl]);

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const updatedData = {
        ...formData,
        codigo: formData.codigo, // No parseInt, keep as string
        imageUrl: imagePreviewUrl || "",
      };

      const productRef = doc(db, "Productos", productId);
      await updateDoc(productRef, updatedData);
      setMessage("Producto actualizado con éxito!");
      navigate("/admin", { state: { fromProductAction: true } });
    } catch (err) {
      console.error("Error al actualizar el producto:", err);
      setError("Error al actualizar el producto: " + err.message);
    }
  };

  const handleDeleteProduct = async () => {
    setError("");
    setMessage("");
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible."
      )
    ) {
      try {
        const productRef = doc(db, "Productos", productId);
        await deleteDoc(productRef);
        setMessage("Producto eliminado con éxito!");
        navigate("/admin", { state: { fromProductAction: true } });
      } catch (err) {
        console.error("Error al eliminar el producto:", err);
        setError("Error al eliminar el producto: " + err.message);
      }
    }
  };

  if (loading) {
    return <div className="loading">Cargando detalles del producto...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button
          className="create-palet-button"
          onClick={() => navigate("/admin")}
        >
          Volver al Panel de Administración
        </button>
      </div>
    );
  }

  if (!loading && !error && !formData.nombre) {
    return (
      <div className="page-content">
        <h1 className="main-title">Producto no encontrado</h1>
        <p>El producto que intentas ver no existe o ha sido eliminado.</p>
        <button
          className="create-palet-button"
          onClick={() => navigate("/admin")}
        >
          Volver al Panel de Administración
        </button>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="main-title">
        Editar Producto: {formData.nombre || "N/A"}
      </h1>

      <div className="auth-form-container">
        <form onSubmit={handleUpdateProduct} className="auth-form">
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="codigo">Código:</label>
            <input
              type="text" // Changed from 'number' to 'text'
              id="codigo"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              required
              aria-label="Código del producto"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre del Producto:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              aria-label="Nombre del producto"
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción:</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              aria-label="Descripción del producto"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="tipo">Tipo:</label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              aria-label="Tipo de producto"
            >
              <option value="Seco">Seco</option>
              <option value="Refrigerado">Refrigerado</option>
              <option value="Congelado">Congelado</option>
              <option value="Tecnico">Técnico</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Imagen del Producto:</label>
            <input
              type="file"
              id="imageUrl"
              name="imageUrl"
              accept="image/*"
              onChange={handleChange}
              aria-label="Seleccionar imagen del producto"
            />
            {imagePreviewUrl && (
              <div className="image-preview-container">
                <img
                  src={imagePreviewUrl}
                  alt="Vista previa del producto"
                  className="image-preview"
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Actualizar Producto
            </button>
            <button
              type="button"
              onClick={handleDeleteProduct}
              className="cancel-button delete-button"
              style={{ marginLeft: "10px" }}
            >
              Eliminar Producto
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="cancel-button"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductDetailPage;
