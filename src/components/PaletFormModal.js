// src/components/PaletFormModal.jsx
import React, { useState } from "react";
import "./PaletFormModal.css"; // Crearemos este archivo de estilos
// Si tu archivo de configuración se llama firebase-config.js
// y está en src/db, la importación sería así:
// import { db } from '../db/firebase-config'; // No necesitamos 'db' aquí, ya que 'onSave' se encarga

function PaletFormModal({ show, onClose, onSave }) {
  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    nombreBarco: "",
    tipoPalet: "",
    numeroPalet: "",
    fechaCarga: "",
    tipoGenero: "Tecnico", // Valor por defecto
  });

  // Maneja los cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Maneja el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita el recarga de la página por defecto
    // Convertir numeroPalet a número para asegurar el tipo correcto en Firestore
    const paletToSave = {
      ...formData,
      numeroPalet: Number(formData.numeroPalet), // Asegurarse de que sea un número
    };
    onSave(paletToSave); // Llama a la función onSave pasada desde App.js
    setFormData({
      // Resetea el formulario después de guardar
      nombreBarco: "",
      tipoPalet: "",
      numeroPalet: "",
      fechaCarga: "",
      tipoGenero: "Tecnico",
    });
  };

  // Si 'show' es falso, no renderizamos el modal
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      {" "}
      {/* Cierra al hacer clic fuera */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {" "}
        {/* Evita que el clic dentro cierre el modal */}
        <h2>Crear Nuevo Palet</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombreBarco">Nombre del Barco:</label>
            <input
              type="text"
              id="nombreBarco"
              name="nombreBarco"
              value={formData.nombreBarco}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipoPalet">Tipo de Palet:</label>
            <input
              type="text"
              id="tipoPalet"
              name="tipoPalet"
              value={formData.tipoPalet}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="numeroPalet">Número de Palet:</label>
            <input
              type="number"
              id="numeroPalet"
              name="numeroPalet"
              value={formData.numeroPalet}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fechaCarga">Fecha de Carga:</label>
            <input
              type="date" // Usamos input type="date" para un selector de fecha
              id="fechaCarga"
              name="fechaCarga"
              value={formData.fechaCarga}
              onChange={handleChange}
              required
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
            >
              <option value="Tecnico">Técnico</option>
              <option value="Congelado">Congelado</option>
              <option value="Refrigerado">Refrigerado</option>
              <option value="Seco">Seco</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button">
              Guardar Palet
            </button>
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

export default PaletFormModal;
