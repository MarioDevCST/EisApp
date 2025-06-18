// src/components/pages/BarcoEditPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Para obtener parámetros de la URL y navegar
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"; // Funciones de Firestore
import "../../App.css"; // Estilos generales
import useForm from "../../hooks/useForm"; // Importa el custom hook useForm

function BarcoEditPage() {
  const { barcoId } = useParams(); // Obtiene el barcoId de la URL
  const navigate = useNavigate();

  // ¡CAMBIO CLAVE! Usamos el custom hook useForm
  const {
    formData,
    handleChange,
    selectedFile,
    imagePreviewUrl,
    setFormData, // Necesitamos setFormData para inicializar el formulario con los datos del usuario
    setSelectedFile, // Necesitamos setSelectedFile para limpiar el estado del archivo
    setImagePreviewUrl, // Necesitamos setImagePreviewUrl para inicializar y limpiar la previsualización
  } = useForm({
    nombre: "",
    empresa: "",
    tipo: "Mercante", // Valor por defecto
    responsableId: "", // ID del usuario administrador seleccionado
    imageUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [administrators, setAdministrators] = useState([]); // Lista de usuarios administradores

  // Efecto para cargar los datos del barco y la lista de administradores
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Cargar la lista de administradores
        const q = query(
          collection(db, "users"),
          where("role", "==", "Administración")
        );
        const querySnapshot = await getDocs(q);
        const adminList = querySnapshot.docs.map((d) => ({
          id: d.id,
          fullName: `${d.data().nombre || ""} ${
            d.data().primerApellido || ""
          } (${d.data().email})`.trim(),
          ...d.data(),
        }));
        setAdministrators(adminList);

        // 2. Cargar los datos del barco
        const barcoDocRef = doc(db, "Barcos", barcoId);
        const barcoDocSnap = await getDoc(barcoDocRef);

        if (barcoDocSnap.exists()) {
          const barcoData = barcoDocSnap.data();
          setFormData({
            nombre: barcoData.nombre || "",
            empresa: barcoData.empresa || "",
            tipo: barcoData.tipo || "Mercante",
            responsableId:
              barcoData.responsableId ||
              (adminList.length > 0 ? adminList[0].id : ""), // Asignar el actual o el primero si no hay
            imageUrl: barcoData.imageUrl || "",
          });
          setImagePreviewUrl(barcoData.imageUrl || ""); // Establece la URL de previsualización
        } else {
          setError("Barco no encontrado.");
        }
      } catch (err) {
        console.error(
          "Error al cargar datos del barco o administradores:",
          err
        );
        setError("Error al cargar los datos: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [barcoId, setFormData, setImagePreviewUrl, setSelectedFile]); // Dependencias del efecto

  // Función para guardar los cambios del barco
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      let finalImageUrl = formData.imageUrl;
      if (selectedFile) {
        // En una aplicación real, aquí subirías selectedFile a Firebase Storage
        // y asignarías la URL de descarga a finalImageUrl.
        finalImageUrl = imagePreviewUrl; // Usamos la URL de previsualización como la "final" por ahora
      }

      const barcoDocRef = doc(db, "Barcos", barcoId);
      await updateDoc(barcoDocRef, {
        nombre: formData.nombre,
        empresa: formData.empresa,
        tipo: formData.tipo,
        responsableId: formData.responsableId,
        imageUrl: finalImageUrl,
      });
      setMessage("Barco actualizado exitosamente.");
      // Redirige a /admin y pasa un estado para activar la sección de barcos
      navigate("/admin", { state: { fromBarcoAction: true } });
    } catch (err) {
      console.error("Error al actualizar barco:", err);
      setError("Error al actualizar barco: " + err.message);
    }
  };

  // Función para borrar el barco
  const handleDeleteBarco = async () => {
    setMessage("");
    setError("");
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar este barco? Esta acción es irreversible."
    );
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "Barcos", barcoId));
        setMessage("Barco eliminado exitosamente.");
        // Redirige a /admin y pasa un estado para activar la sección de barcos
        navigate("/admin", { state: { fromBarcoAction: true } });
      } catch (err) {
        console.error("Error al eliminar barco:", err);
        setError("Error al eliminar barco: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-content loading-profile">
        <div className="loading-app-message">Cargando datos del barco...</div>
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
      <h1 className="main-title">Editar Barco</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form
        onSubmit={handleSaveChanges}
        className="auth-form profile-edit-form"
      >
        <div className="form-group">
          <label htmlFor="nombre">Nombre del Barco:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            aria-label="Nombre del barco"
          />
        </div>

        <div className="form-group">
          <label htmlFor="empresa">Empresa:</label>
          <input
            type="text"
            id="empresa"
            name="empresa"
            value={formData.empresa}
            onChange={handleChange}
            required
            aria-label="Empresa del barco"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipo">Tipo de Barco:</label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            aria-label="Tipo de barco"
          >
            <option value="Mercante">Mercante</option>
            <option value="Crucero">Crucero</option>
            <option value="Ferry">Ferry</option>{" "}
            {/* Subrayado: Nueva opción "Ferry" */}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="responsableId">Responsable (Administración):</label>
          <select
            id="responsableId"
            name="responsableId"
            value={formData.responsableId}
            onChange={handleChange}
            required
            aria-label="Responsable del barco"
            disabled={administrators.length === 0}
          >
            {administrators.length === 0 ? (
              <option value="">Cargando administradores...</option>
            ) : (
              administrators.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.fullName}
                </option>
              ))
            )}
          </select>
          {administrators.length === 0 && !loading && (
            <p className="error-message">
              No hay usuarios con rol "Administración" disponibles.
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Imagen del Barco:</label>
          <input
            type="file"
            id="imageUrl"
            name="imageUrl"
            accept="image/*"
            onChange={handleChange}
            aria-label="Seleccionar imagen del barco"
          />
          {imagePreviewUrl && (
            <div className="image-preview-container">
              <img
                src={imagePreviewUrl}
                alt="Vista previa"
                className="image-preview"
              />
            </div>
          )}
        </div>

        <div className="form-actions-edit-user">
          <button type="submit" className="submit-button">
            Guardar Cambios
          </button>
          <button
            type="button"
            className="delete-user-button"
            onClick={handleDeleteBarco}
          >
            Borrar Barco
          </button>
        </div>
      </form>
    </div>
  );
}

export default BarcoEditPage;
