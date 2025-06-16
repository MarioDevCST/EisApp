// src/components/pages/CargaFormPage.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import { collection, getDocs, addDoc } from "firebase/firestore"; // Funciones de Firestore
import { useNavigate } from "react-router-dom"; // Para la navegación
import "../../App.css"; // Estilos generales

function CargaFormPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreBarcoId: "", // ID del barco seleccionado
    fechaCarga: "",
    listaPalets: "", // Por ahora, un campo de texto
  });
  const [barcos, setBarcos] = useState([]); // Lista de barcos disponibles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // Efecto para cargar la lista de barcos para el desplegable
  useEffect(() => {
    const fetchBarcos = async () => {
      try {
        setLoading(true);
        const barcosSnapshot = await getDocs(collection(db, "Barcos"));
        const barcosList = barcosSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre, // Asume que los barcos tienen un campo 'nombre'
        }));
        setBarcos(barcosList);
        // Establecer el primer barco como seleccionado por defecto si hay alguno
        if (barcosList.length > 0) {
          setFormData((prevData) => ({
            ...prevData,
            nombreBarcoId: barcosList[0].id,
          }));
        } else {
          setFormData((prevData) => ({
            ...prevData,
            nombreBarcoId: "",
          }));
        }
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar barcos:", err);
        setError(
          "Error al cargar la lista de barcos disponibles: " + err.message
        );
        setLoading(false);
      }
    };

    fetchBarcos();
  }, []);

  // Manejador de cambios para los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Función para manejar el envío del formulario y crear la carga
  const handleCreateCarga = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (barcos.length === 0 || !formData.nombreBarcoId) {
      setError("Debe seleccionar un barco para la carga.");
      return;
    }

    try {
      // Encontrar el nombre del barco seleccionado
      const selectedBarco = barcos.find(
        (barco) => barco.id === formData.nombreBarcoId
      );
      const nombreBarco = selectedBarco
        ? selectedBarco.nombre
        : "Barco Desconocido";

      // Generar el nombre de la carga
      const nombreCarga = `${nombreBarco}-${formData.fechaCarga}`;

      // Añadir la nueva carga a la colección "Cargas" en Firestore
      await addDoc(collection(db, "Cargas"), {
        nombreCarga: nombreCarga,
        nombreBarco: nombreBarco, // Guardamos el nombre del barco para fácil visualización
        fechaCarga: formData.fechaCarga,
        listaPalets: formData.listaPalets,
        createdAt: new Date(),
      });

      setMessage("Carga creada exitosamente.");
      // Limpiar formulario y redirigir a la página de cargas en el panel de administración
      setFormData({
        nombreBarcoId: barcos.length > 0 ? barcos[0].id : "",
        fechaCarga: "",
        listaPalets: "",
      });
      // Redirige a /admin y pasa un estado para activar la sección de cargas
      navigate("/admin", { state: { fromCargaAction: true } });
    } catch (err) {
      console.error("Error al crear carga:", err);
      setError("Error al crear carga: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-content loading-profile">
        <div className="loading-app-message">
          Cargando datos del formulario...
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="main-title">Crear Nueva Carga</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form
        onSubmit={handleCreateCarga}
        className="auth-form profile-edit-form"
      >
        {" "}
        {/* Reutilizamos estilos */}
        <div className="form-group">
          <label htmlFor="nombreBarcoId">Nombre de Barco:</label>
          <select
            id="nombreBarcoId"
            name="nombreBarcoId"
            value={formData.nombreBarcoId}
            onChange={handleChange}
            required
            aria-label="Nombre del barco para la carga"
            disabled={barcos.length === 0}
          >
            {barcos.length === 0 ? (
              <option value="">Cargando barcos...</option>
            ) : (
              barcos.map((barco) => (
                <option key={barco.id} value={barco.id}>
                  {barco.nombre}
                </option>
              ))
            )}
          </select>
          {barcos.length === 0 && !loading && (
            <p className="error-message">
              No hay barcos disponibles para asociar a una carga.
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="fechaCarga">Fecha de Carga:</label>
          <input
            type="date"
            id="fechaCarga"
            name="fechaCarga"
            value={formData.fechaCarga}
            onChange={handleChange}
            required
            aria-label="Fecha de la carga"
          />
        </div>
        <div className="form-group">
          <label htmlFor="listaPalets">Lista de Palets (texto):</label>
          <textarea
            id="listaPalets"
            name="listaPalets"
            value={formData.listaPalets}
            onChange={handleChange}
            rows="5"
            placeholder="Introduce los palets de la carga (ej. P101, P102, ...)"
            aria-label="Lista de palets de la carga"
          ></textarea>
        </div>
        <div
          className="form-actions-edit-user"
          style={{ justifyContent: "center" }}
        >
          <button type="submit" className="submit-button">
            Crear Carga
          </button>
        </div>
      </form>
    </div>
  );
}

export default CargaFormPage;
