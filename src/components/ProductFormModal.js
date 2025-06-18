// src/components/ProductFormModal.jsx
import React from "react"; // Eliminamos useEffect ya que la lógica de edición se simplifica
import "../App.css"; // Asegúrate de que tus estilos generales estén disponibles
import useForm from "../hooks/useForm"; // Importa el custom hook useForm

// ProductFormModal ahora solo acepta show, onClose, onSave para la creación
function ProductFormModal({ show, onClose, onSave }) {
  // Inicializamos useForm con los campos del formulario
  const {
    formData,
    handleChange,
    resetForm, // Función para resetear el formulario
    imagePreviewUrl, // URL de previsualización de la imagen
    setImagePreviewUrl, // Función para establecer la URL de previsualización
  } = useForm({
    codigo: "", // Campo: Código
    nombre: "", // Campo: Nombre
    descripcion: "", // Campo: Descripción
    tipo: "Seco", // Campo: Tipo (con valor por defecto)
    imageUrl: "", // Campo para la URL de la imagen
  });

  // Maneja el envío del formulario (Solo Guardar en esta versión)
  const handleSubmit = (e) => {
    e.preventDefault();

    // Construimos el objeto de datos a guardar
    const dataToSave = {
      ...formData,
      codigo: parseInt(formData.codigo) || 0, // Asegura que el código sea un número
      imageUrl: imagePreviewUrl || "", // Guarda la URL de previsualización
    };

    onSave(dataToSave); // Llama a la función 'onSave' del componente padre

    // Resetea el formulario y limpia la previsualización de la imagen
    resetForm();
    setImagePreviewUrl("");
  };

  // Si 'show' es falso, no renderizamos el modal
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Crear Nuevo Producto</h2> {/* Título estático */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Campo: Código */}
          <div className="form-group">
            <label htmlFor="codigo">Código:</label>
            <input
              type="number"
              id="codigo"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              required
              aria-label="Código del producto"
            />
          </div>

          {/* Campo: Nombre */}
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

          {/* Campo: Descripción */}
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

          {/* Campo: Tipo */}
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

          {/* Campo: Imagen del Producto */}
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
              Guardar Producto
            </button>{" "}
            {/* Texto del botón estático */}
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
          </div>
        </form>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
}

export default ProductFormModal;
