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
  query,
  where,
} from "firebase/firestore"; // Funciones de Firestore y para consultas
import "../../App.css"; // Estilos generales
import useForm from "../../hooks/useForm"; // ¡CAMBIO! Importa el custom hook useForm

function CargaEditPage() {
  const { cargaId } = useParams(); // Obtiene el cargaId de la URL
  const navigate = useNavigate();

  // ¡CAMBIO CLAVE! Usamos el custom hook useForm
  const {
    formData,
    handleChange,
    setFormData, // Necesitamos setFormData para inicializar el formulario con los datos de la carga
  } = useForm({
    nombreBarcoId: "", // ID del barco seleccionado
    fechaCarga: "",
    puerto: "BCN", // Nuevo campo
    terminal: "Adosados", // Nuevo campo
    conductorId: "", // Nuevo campo, opcional
    // 'listaPalets' fue eliminado de la creación, no se incluye aquí
  });

  const [barcos, setBarcos] = useState([]); // Lista de barcos disponibles
  const [conductors, setConductors] = useState([]); // Lista de conductores disponibles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // Efecto para cargar los datos de la carga, la lista de barcos y la lista de conductores
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

        // 2. Cargar la lista de conductores
        const qConductors = query(
          collection(db, "users"),
          where("role", "==", "Conductor")
        );
        const conductorsSnapshot = await getDocs(qConductors);
        const conductorList = conductorsSnapshot.docs.map((d) => ({
          id: d.id,
          fullName: `${d.data().nombre || ""} ${
            d.data().primerApellido || ""
          } (${d.data().email})`.trim(),
        }));
        setConductors(conductorList);

        // 3. Cargar los datos de la carga específica
        const cargaDocRef = doc(db, "Cargas", cargaId);
        const cargaDocSnap = await getDoc(cargaDocRef);

        if (cargaDocSnap.exists()) {
          const cargaData = cargaDocSnap.data();
          // Intentar encontrar el ID del barco por su nombre (si se guardó el nombre)
          const barcoEncontrado = barcosList.find(
            (b) => b.nombre === cargaData.nombreBarco
          );

          // ¡CAMBIO! Usamos setFormData del hook para inicializar el formulario
          setFormData({
            nombreBarcoId: barcoEncontrado ? barcoEncontrado.id : "", // Asignar el ID del barco encontrado
            fechaCarga: cargaData.fechaCarga || "",
            puerto: cargaData.puerto || "BCN", // Inicializar Puerto
            terminal: cargaData.terminal || "Adosados", // Inicializar Terminal
            conductorId: cargaData.conductorId || "", // Inicializar Conductor
            // 'listaPalets' ya no se incluye en el formulario, así que no se inicializa aquí
          });
        } else {
          setError("Carga no encontrada.");
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cargaId, setFormData]); // Dependencias del efecto, incluyendo setFormData

  // ¡CAMBIO! La función handleChange ya viene del hook useForm y maneja inputs y selects.
  // No necesitamos una implementación manual aquí.

  // Función para guardar los cambios de la carga
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (barcos.length === 0 || !formData.nombreBarcoId) {
      setError("Debe seleccionar un barco para la carga.");
      return;
    }

    // Lógica para el conductor opcional
    let finalConductorId = formData.conductorId;
    let finalConductorNombre = "Pendiente";

    if (formData.conductorId) {
      const selectedConductor = conductors.find(
        (cond) => cond.id === formData.conductorId
      );
      finalConductorNombre = selectedConductor
        ? selectedConductor.fullName
        : "Conductor Desconocido";
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
        puerto: formData.puerto, // Guardar Puerto
        terminal: formData.terminal, // Guardar Terminal
        conductorId: finalConductorId || null, // Guardar el ID del conductor (o null si es "Pendiente")
        nombreConductor: finalConductorNombre, // Guardar el nombre completo del conductor o "Pendiente"
        // 'listaPalets' ya no se incluye aquí
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

        {/* Campo Puerto */}
        <div className="form-group">
          <label htmlFor="puerto">Puerto:</label>
          <select
            id="puerto"
            name="puerto"
            value={formData.puerto}
            onChange={handleChange}
            required
            aria-label="Puerto de la carga"
          >
            <option value="BCN">BCN</option>
            <option value="TGN">TGN</option>
            <option value="CDZ">CDZ</option>
            <option value="HAM">HAM</option>
          </select>
        </div>

        {/* Campo Terminal */}
        <div className="form-group">
          <label htmlFor="terminal">Terminal:</label>
          <select
            id="terminal"
            name="terminal"
            value={formData.terminal}
            onChange={handleChange}
            required
            aria-label="Terminal de la carga"
          >
            <option value="Adosados">Adosados</option>
            <option value="APM">APM</option>
            <option value="Best">Best</option>
            <option value="San Beltrán">San Beltrán</option>
            <option value="CarGill">CarGill</option>
            <option value="Cruceros">Cruceros</option>
          </select>
        </div>

        {/* Campo Conductor (Opcional) */}
        <div className="form-group">
          <label htmlFor="conductorId">Conductor (Opcional):</label>
          <select
            id="conductorId"
            name="conductorId"
            value={formData.conductorId}
            onChange={handleChange}
            aria-label="Conductor de la carga"
            disabled={conductors.length === 0}
          >
            <option value="">Pendiente</option>
            {conductors.length === 0 ? (
              <option value="" disabled>
                Cargando conductores...
              </option>
            ) : (
              conductors.map((conductor) => (
                <option key={conductor.id} value={conductor.id}>
                  {conductor.fullName}
                </option>
              ))
            )}
          </select>
          {conductors.length === 0 && !loading && (
            <p className="error-message">
              No hay usuarios con rol "Conductor" disponibles para asignar.
            </p>
          )}
        </div>

        {/* Eliminado: Campo Lista de Palets */}
        {/* <div className="form-group">
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
        </div> */}

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
