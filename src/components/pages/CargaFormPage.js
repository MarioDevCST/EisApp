// src/components/pages/CargaFormPage.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import { collection, getDocs, addDoc, query, where } from "firebase/firestore"; // Funciones de Firestore
import { useNavigate } from "react-router-dom"; // Para la navegación
import "../../App.css"; // Estilos generales
import useForm from "../../hooks/useForm"; // Importa el custom hook useForm

function CargaFormPage() {
  const navigate = useNavigate();

  // ¡CAMBIO CLAVE! Usamos el custom hook useForm con los nuevos campos
  const {
    formData,
    handleChange,
    resetForm,
    setFormData, // Necesitamos setFormData para inicializar nombreBarcoId y conductorId
  } = useForm({
    nombreBarcoId: "", // ID del barco seleccionado
    fechaCarga: "",
    puerto: "BCN", // Valor por defecto
    terminal: "Adosados", // Valor por defecto
    conductorId: "", // Subrayado: ¡NUEVO CAMPO! ID del conductor seleccionado
  });

  const [barcos, setBarcos] = useState([]); // Lista de barcos disponibles
  const [conductors, setConductors] = useState([]); // Subrayado: Lista de conductores disponibles
  const [loading, setLoading] = useState(true); // Estado de carga general
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // Efecto para cargar la lista de barcos para el desplegable y establecer el valor inicial
  useEffect(() => {
    const fetchBarcos = async () => {
      try {
        // No manejamos el loading aquí directamente para no interferir con el loading global
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
      } catch (err) {
        console.error("Error al cargar barcos:", err);
        setError(
          "Error al cargar la lista de barcos disponibles: " + err.message
        );
      }
    };

    fetchBarcos();
  }, [setFormData]); // Dependencia del setFormData para que el efecto se ejecute una vez y actualice el hook.

  // Subrayado: Nuevo efecto para cargar la lista de usuarios con rol "Conductor"
  useEffect(() => {
    const fetchConductors = async () => {
      try {
        setLoading(true); // Pone loading a true al inicio de esta carga también
        // Filtrar usuarios por el rol "Conductor"
        const q = query(
          collection(db, "users"),
          where("role", "==", "Conductor")
        );
        const querySnapshot = await getDocs(q);
        const conductorList = querySnapshot.docs.map((d) => ({
          id: d.id,
          fullName: `${d.data().nombre || ""} ${
            d.data().primerApellido || ""
          } (${d.data().email})`.trim(),
        }));
        setConductors(conductorList);

        // Subrayado: No establecer un conductor por defecto, se mantiene vacío para hacerlo opcional.
        // setFormData(prevData => ({ ...prevData, conductorId: conductorList[0]?.id || '' }));

        setLoading(false); // Pone loading a false al final de esta carga
      } catch (err) {
        console.error("Error al cargar conductores:", err);
        setError(
          "Error al cargar la lista de conductores disponibles: " + err.message
        );
        setLoading(false);
      }
    };

    fetchConductors();
  }, [setFormData]); // Dependencia del setFormData para que el efecto se ejecute una vez y actualice el hook.

  // Función para manejar el envío del formulario y crear la carga
  const handleCreateCarga = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (barcos.length === 0 || !formData.nombreBarcoId) {
      setError("Debe seleccionar un barco para la carga.");
      return;
    }
    // Subrayado: Eliminada la validación obligatoria del conductor.
    // if (conductors.length === 0 || !formData.conductorId) {
    //   setError("Debe seleccionar un conductor para la carga.");
    //   return;
    // }

    try {
      // Encontrar el nombre del barco seleccionado
      const selectedBarco = barcos.find(
        (barco) => barco.id === formData.nombreBarcoId
      );
      const nombreBarco = selectedBarco
        ? selectedBarco.nombre
        : "Barco Desconocido";

      // Subrayado: Determinar el nombre del conductor y su ID
      let finalConductorId = formData.conductorId;
      let finalConductorNombre = "Pendiente"; // Valor por defecto si no se selecciona conductor

      if (formData.conductorId) {
        const selectedConductor = conductors.find(
          (cond) => cond.id === formData.conductorId
        );
        finalConductorNombre = selectedConductor
          ? selectedConductor.fullName
          : "Conductor Desconocido";
      }

      // Generar el nombre de la carga
      const nombreCarga = `${nombreBarco}-${formData.fechaCarga}`;

      // Añadir la nueva carga a la colección "Cargas" en Firestore
      await addDoc(collection(db, "Cargas"), {
        nombreCarga: nombreCarga,
        nombreBarco: nombreBarco, // Guardamos el nombre del barco para fácil visualización
        fechaCarga: formData.fechaCarga,
        puerto: formData.puerto,
        terminal: formData.terminal,
        conductorId: finalConductorId || null, // Subrayado: Guardar el ID del conductor (o null si es "Pendiente")
        nombreConductor: finalConductorNombre, // Subrayado: Guardar el nombre completo del conductor o "Pendiente"
        createdAt: new Date(),
      });

      setMessage("Carga creada exitosamente.");
      // Limpiar formulario y redirigir a la página de cargas en el panel de administración
      resetForm({
        // Resetea el formulario con los valores iniciales del hook
        nombreBarcoId: barcos.length > 0 ? barcos[0].id : "",
        fechaCarga: "",
        puerto: "BCN",
        terminal: "Adosados",
        conductorId: "", // Subrayado: Resetea el conductor a vacío para hacerlo opcional
      });
      // Redirige a /admin y pasa un estado para activar la sección de cargas
      navigate("/admin", { state: { fromCargaAction: true } });
    } catch (err) {
      console.error("Error al crear carga:", err);
      setError("Error al crear carga: " + err.message);
    }
  };

  // Se considera cargando si los barcos o los conductores (o ambos) están cargando
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
        {/* Subrayado: ¡NUEVO CAMPO! Conductor */}
        <div className="form-group">
          <label htmlFor="conductorId">Conductor (Opcional):</label>
          <select
            id="conductorId"
            name="conductorId"
            value={formData.conductorId}
            onChange={handleChange}
            // Subrayado: Ahora no es requerido
            // required
            aria-label="Conductor de la carga"
            disabled={conductors.length === 0}
          >
            {/* Subrayado: Opción por defecto para "Pendiente" */}
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
