// src/components/PaletFormModal.jsx
import React, { useState, useEffect } from "react";
import "./PaletFormModal.css"; // Crearemos este archivo de estilos
import { db } from "../db/firebase-config"; // Importa la instancia de Firestore
import { collection, getDocs } from "firebase/firestore"; // Importa collection y getDocs

function PaletFormModal({ show, onClose, onSave }) {
  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    nombreBarco: "",
    cargaAsociadaId: "", // Nuevo campo para la ID de la carga asociada
    tipoPalet: "",
    numeroPalet: "",
    fechaCarga: "",
    tipoGenero: "Tecnico", // Valor por defecto
  });

  const [cargas, setCargas] = useState([]);
  const [loadingCargas, setLoadingCargas] = useState(true);
  const [error, setError] = useState(""); // Nuevo estado para mensajes de error
  const [message, setMessage] = useState(""); // Nuevo estado para mensajes de éxito/info

  // Efecto para cargar las cargas disponibles al montar el componente
  useEffect(() => {
    const fetchCargas = async () => {
      try {
        setLoadingCargas(true);
        setError(""); // Limpiar errores previos
        const querySnapshot = await getDocs(collection(db, "Cargas"));
        const cargasList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          nombreCarga: doc.data().nombreCarga || "Carga sin nombre",
        }));
        setCargas(cargasList);
        // Establecer la primera carga como seleccionada por defecto si hay alguna
        if (cargasList.length > 0) {
          setFormData((prevData) => ({
            ...prevData,
            cargaAsociadaId: cargasList[0].id,
          }));
        } else {
          // Si no hay cargas, asegúrate de que cargaAsociadaId sea una cadena vacía
          setFormData((prevData) => ({
            ...prevData,
            cargaAsociadaId: "",
          }));
        }
        setLoadingCargas(false);
      } catch (err) {
        console.error("Error al cargar las cargas:", err);
        setError("Error al cargar las cargas disponibles: " + err.message); // Establecer mensaje de error
        setLoadingCargas(false);
      }
    };

    if (show) {
      // Solo cargar las cargas cuando el modal está visible
      fetchCargas();
      // Reiniciar el formulario y los mensajes/errores al abrir el modal
      setFormData({
        nombreBarco: "",
        cargaAsociadaId: "",
        tipoPalet: "",
        numeroPalet: "",
        fechaCarga: "",
        tipoGenero: "Tecnico",
      });
      setError("");
      setMessage("");
    }
  }, [show]); // Se re-ejecuta cuando 'show' cambia (cuando el modal se abre/cierra)

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
    setError(""); // Limpiar errores al intentar enviar
    setMessage("");

    if (cargas.length > 0 && !formData.cargaAsociadaId) {
      setError("Por favor, selecciona una carga para asociar."); // Usa setError
      return;
    }
    if (cargas.length === 0) {
      // Si no hay cargas en absoluto
      setError(
        "No hay cargas disponibles para asociar un palet. Crea una carga primero."
      );
      return;
    }

    // Convertir numeroPalet a número para asegurar el tipo correcto en Firestore
    const paletToSave = {
      ...formData,
      numeroPalet: Number(formData.numeroPalet), // Asegurarse de que sea un número
      cargaAsociadaId: formData.cargaAsociadaId,
    };
    onSave(paletToSave); // Llama a la función onSave pasada desde App.js
    setFormData({
      // Resetea el formulario después de guardar
      nombreBarco: "",
      cargaAsociadaId: cargas.length > 0 ? cargas[0].id : "", // Resetea al primer elemento o vacío
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
        {error && <p className="error-message">{error}</p>}{" "}
        {/* Muestra el error aquí */}
        {message && <p className="success-message">{message}</p>}{" "}
        {/* Muestra mensajes de éxito aquí */}
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
              aria-label="Nombre del barco"
            />
          </div>

          {/* Nuevo campo para asociar la carga */}
          <div className="form-group">
            <label htmlFor="cargaAsociadaId">Carga Asociada:</label>
            <select
              id="cargaAsociadaId"
              name="cargaAsociadaId"
              value={formData.cargaAsociadaId}
              onChange={handleChange}
              required={cargas.length > 0} // Solo requerido si hay cargas para seleccionar
              disabled={loadingCargas || cargas.length === 0} // Deshabilitar mientras carga o si no hay cargas
              aria-label="Carga asociada"
            >
              {loadingCargas ? (
                <option value="">Cargando cargas...</option>
              ) : cargas.length === 0 ? (
                <option value="">No hay cargas disponibles</option>
              ) : (
                cargas.map((carga) => (
                  <option key={carga.id} value={carga.id}>
                    {carga.nombreCarga}
                  </option>
                ))
              )}
            </select>
            {cargas.length === 0 && !loadingCargas && (
              <p className="error-message">
                No hay cargas disponibles para asociar un palet. Crea una carga
                primero.
              </p>
            )}
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
              aria-label="Tipo de palet"
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
              aria-label="Número de palet"
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
              aria-label="Fecha de carga"
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
              aria-label="Tipo de género"
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
