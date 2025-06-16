// src/components/CargaPaletFormModal.jsx
import React, { useState, useEffect } from "react";
import "../App.css"; // Importa estilos generales, incluyendo los de formularios

function CargaPaletFormModal({
  show,
  onClose,
  onSave,
  cargaId,
  cargaNombreBarco,
  cargaFecha,
}) {
  const [formData, setFormData] = useState({
    numeroPalet: "",
    tipoGenero: "Seco", // Valor por defecto
    tipoPalet: "Europeo", // Valor por defecto
    fechaCarga: cargaFecha || "", // Establece la fecha de carga de la carga como predeterminada
    nombreBarco: cargaNombreBarco || "", // Establece el nombre del barco de la carga como predeterminado
    cargaAsociadaId: cargaId, // Asocia automáticamente con la carga actual
  });
  const [error, setError] = useState("");

  // Sincroniza los datos de la carga si cambian las props
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      fechaCarga: cargaFecha || "",
      nombreBarco: cargaNombreBarco || "",
      cargaAsociadaId: cargaId,
    }));
  }, [cargaId, cargaNombreBarco, cargaFecha]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validaciones básicas
    if (
      !formData.numeroPalet ||
      isNaN(formData.numeroPalet) ||
      parseInt(formData.numeroPalet) <= 0
    ) {
      setError("El número de palet debe ser un número positivo.");
      return;
    }
    // Subrayado: Las validaciones de fechaCarga y nombreBarco ya no son necesarias aquí,
    // porque los campos están deshabilitados y se pre-rellenan.
    if (!formData.tipoGenero || !formData.tipoPalet) {
      setError("Todos los campos obligatorios deben ser rellenados.");
      return;
    }

    onSave(formData); // Llama a la función onSave pasada por props
    // Reinicia el formulario después de guardar (opcional, podrías querer mantenerlo abierto para más palets)
    setFormData({
      numeroPalet: "",
      tipoGenero: "Seco",
      tipoPalet: "Europeo",
      fechaCarga: cargaFecha || "",
      nombreBarco: cargaNombreBarco || "",
      cargaAsociadaId: cargaId,
    });
  };

  if (!show) {
    return null; // No renderiza el modal si 'show' es false
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <form onSubmit={handleSubmit} className="auth-form">
          {" "}
          {/* Reutiliza la clase auth-form */}
          <h2>
            Crear Nuevo Palet para Carga{" "}
            {cargaId ? `(${cargaId.substring(0, 5)}...)` : ""}
          </h2>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="numeroPalet">Número de Palet:</label>
            <input
              type="number"
              id="numeroPalet"
              name="numeroPalet"
              value={formData.numeroPalet}
              onChange={handleChange}
              required
              aria-label="Número de palet"
            />
          </div>
          <div className="form-group">
            <label htmlFor="tipoGenero">Tipo de Género:</label>
            <select
              id="tipoGenero"
              name="tipoGenero"
              value={formData.tipoGenero}
              onChange={handleChange}
              required
              aria-label="Tipo de género del palet"
            >
              <option value="Seco">Seco</option>
              <option value="Congelado">Congelado</option>
              <option value="Refrigerado">Refrigerado</option>
              <option value="Tecnico">Técnico</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="tipoPalet">Tipo de Palet:</label>
            <select
              id="tipoPalet"
              name="tipoPalet"
              value={formData.tipoPalet}
              onChange={handleChange}
              required
              aria-label="Tipo de palet"
            >
              <option value="Europeo">Europeo</option>
              <option value="Americano">Americano</option>
            </select>
          </div>
          {/* Subrayado: Se han eliminado los campos de fecha de carga y nombre del barco */}
          {/* Estos campos ya no se muestran en el modal, ya que los datos se toman de la carga principal */}
          {/* Conservamos los valores en formData para que se envíen al guardar */}
          <button type="submit" className="submit-button">
            Guardar Palet
          </button>
        </form>
      </div>
    </div>
  );
}

export default CargaPaletFormModal;
