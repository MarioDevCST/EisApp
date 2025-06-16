// src/components/pages/CargaEditPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Para obtener parámetros de la URL y navegar
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore"; // Funciones de Firestore
import "../../App.css"; // Estilos generales

function CargaEditPage() {
  const { cargaId } = useParams(); // Obtiene el cargaId de la URL
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

  // Efecto para cargar los datos de la carga y la lista de barcos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Cargar la lista de barcos para el desplegable
        const barcosSnapshot = await getDocs(collection(db, "Barcos"));
        const barcosList = barcosSnapshot.docs.map((d) => ({
          id: d.id,
          nombre: d.data().nombre,
        }));
        setBarcos(barcosList);

        // 2. Cargar los datos de la carga
        const cargaDocRef = doc(db, "Cargas", cargaId);
        const cargaDocSnap = await getDoc(cargaDocRef);

        if (cargaDocSnap.exists()) {
          const cargaData = cargaDocSnap.data();
          // Intentar encontrar el ID del barco por su nombre, ya que solo guardamos el nombre
          const barcoEncontrado = barcosList.find(
            (b) => b.nombre === cargaData.nombreBarco
          );

          setFormData({
            nombreBarcoId: barcoEncontrado ? barcoEncontrado.id : "", // Asignar el ID del barco encontrado
            fechaCarga: cargaData.fechaCarga || "",
            listaPalets: cargaData.listaPalets || "",
          });
        } else {
          setError("Carga no encontrada.");
        }
      } catch (err) {
        console.error("Error al cargar datos de la carga o barcos:", err);
        setError("Error al cargar los datos: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cargaId]); // Se re-ejecuta si cargaId cambia

  // Manejador de cambios para los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Función para guardar los cambios de la carga
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (barcos.length === 0 || !formData.nombreBarcoId) {
      setError("Debe seleccionar un barco para la carga.");
      return;
    }

    try {
      const selectedBarco = barcos.find(
        (barco) => barco.id === formData.nombreBarcoId
      );
      const nombreBarco = selectedBarco
        ? selectedBarco.nombre
        : "Barco Desconocido";
      const nombreCarga = `${nombreBarco}-${formData.fechaCarga}`;

      const cargaDocRef = doc(db, "Cargas", cargaId);
      await updateDoc(cargaDocRef, {
        nombreCarga: nombreCarga,
        nombreBarco: nombreBarco,
        fechaCarga: formData.fechaCarga,
        listaPalets: formData.listaPalets,
      });
      setMessage("Carga actualizada exitosamente.");
      // Redirige a /admin y pasa un estado para activar la sección de cargas
      navigate("/admin", { state: { fromCargaAction: true } });
    } catch (err) {
      console.error("Error al actualizar carga:", err);
      setError("Error al actualizar carga: " + err.message);
    }
  };

  // Función para borrar la carga
  const handleDeleteCarga = async () => {
    setMessage("");
    setError("");
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar esta carga? Esta acción es irreversible."
    );
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "Cargas", cargaId));
        setMessage("Carga eliminada exitosamente.");
        // Redirige a /admin y pasa un estado para activar la sección de cargas
        navigate("/admin", { state: { fromCargaAction: true } });
      } catch (err) {
        console.error("Error al eliminar carga:", err);
        setError("Error al eliminar carga: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-content loading-profile">
        <div className="loading-app-message">Cargando datos de la carga...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content error-profile">
        <div className="error-app-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="main-title">Editar Carga</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form
        onSubmit={handleSaveChanges}
        className="auth-form profile-edit-form"
      >
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

        <div className="form-actions-edit-user">
          <button type="submit" className="submit-button">
            Guardar Cambios
          </button>
          <button
            type="button"
            className="delete-user-button"
            onClick={handleDeleteCarga}
          >
            Borrar Carga
          </button>
        </div>
      </form>
    </div>
  );
}

export default CargaEditPage;
