// src/components/CargaPaletFormModal.jsx
import React, { useState, useEffect } from "react";
import "./PaletFormModal.css"; // Asegúrate de que los estilos existan
import { db } from "../db/firebase-config"; // Importa la instancia de Firestore
import { collection, getDocs, query, where } from "firebase/firestore"; // CAMBIO: Importa query y where para filtrar

// Subrayado: CargaPaletFormModal ahora recibe props de la carga a la que se asocia
function CargaPaletFormModal({
  show,
  onClose,
  onSave,
  cargaId,
  cargaNombreBarco,
  cargaFecha,
}) {
  // Estado para los campos que el usuario introducirá
  const [formData, setFormData] = useState({
    tipoPalet: "Europeo", // CAMBIO: Valor por defecto para el desplegable de Tipo de Palet
    tipoGenero: "Tecnico", // Valor por defecto
  });

  // Nuevo estado para el número de palet correlativo
  const [nextPaletNumber, setNextPaletNumber] = useState(null);

  const [loadingNumeroPalet, setLoadingNumeroPalet] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Efecto para calcular el próximo número de palet al abrir el modal
  useEffect(() => {
    const fetchNextPaletNumber = async () => {
      setLoadingNumeroPalet(true);
      setError("");
      try {
        // CAMBIO CLAVE: Consulta solo los palets asociados a esta carga específica
        const paletsCollectionRef = collection(db, "Palets");
        const q = query(
          paletsCollectionRef,
          where("cargaAsociadaId", "==", cargaId)
        ); // Filtra por cargaId

        const querySnapshot = await getDocs(q); // Ejecuta la consulta filtrada

        // Se obtiene la cantidad de documentos (palets) en el querySnapshot y se le suma 1
        const countOfPalets = querySnapshot.size;
        setNextPaletNumber(countOfPalets + 1);

        setLoadingNumeroPalet(false);
      } catch (err) {
        console.error("Error al obtener el número de palet correlativo:", err);
        setError("Error al cargar el número de palet: " + err.message);
        setLoadingNumeroPalet(false);
        setNextPaletNumber("Error"); // Mostrar "Error" si no se pudo cargar
      }
    };

    if (show) {
      // Solo ejecutar cuando el modal está visible
      fetchNextPaletNumber();
      // Reiniciar el formulario y los mensajes/errores al abrir el modal
      setFormData({
        tipoPalet: "Europeo", // CAMBIO: Restablecer al valor por defecto del desplegable
        tipoGenero: "Tecnico",
      });
      setError("");
      setMessage("");
    }
  }, [show, cargaId]); // CAMBIO: Añade cargaId como dependencia, ya que la consulta depende de ello

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
    e.preventDefault();
    setError("");
    setMessage("");

    if (nextPaletNumber === null || nextPaletNumber === "Error") {
      setError("El número de palet no se ha podido generar correctamente.");
      return;
    }

    // Construir el objeto del nuevo palet combinando datos del formulario,
    // de las props de la carga y el número autogenerado.
    const paletToSave = {
      // Datos heredados de la carga (pasados como props)
      cargaAsociadaId: cargaId,
      nombreBarco: cargaNombreBarco,
      fechaCarga: cargaFecha,
      // Número de palet autogenerado
      numeroPalet: nextPaletNumber,
      // Datos introducidos por el usuario
      tipoPalet: formData.tipoPalet,
      tipoGenero: formData.tipoGenero,
      createdAt: new Date(), // Opcional: añadir fecha de creación
    };

    onSave(paletToSave); // Llama a la función onSave pasada desde el componente padre
    // No reseteamos el número de palet aquí porque se recalculará al reabrir el modal
  };

  // Si 'show' es falso, no renderizamos el modal
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Crear Nuevo Palet</h2>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <form onSubmit={handleSubmit}>
          {/* Campo de solo lectura para el número de palet autogenerado */}
          <div className="form-group">
            <label htmlFor="numeroPaletDisplay">Número de Palet:</label>
            <input
              type="text"
              id="numeroPaletDisplay"
              // CAMBIO: El valor ya muestra "Calculando..." o el número.
              // Esto ya actúa como una previsualización del número que se va a crear.
              value={loadingNumeroPalet ? "Calculando..." : nextPaletNumber}
              disabled // Deshabilitado para que el usuario no lo edite
              readOnly // Solo lectura
              className="read-only-input" // Puedes añadir estilos específicos para inputs de solo lectura
              aria-label="Número de palet autogenerado"
            />
          </div>

          {/* Tipo de Palet (CAMBIO: Ahora es un desplegable) */}
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
              <option value="Otros">Otros</option>
            </select>
          </div>

          {/* Tipo de Género */}
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
            <button type="submit" className="submit-button">
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

export default CargaPaletFormModal;
