// src/components/pages/UserEditPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Para obtener parámetros de la URL y navegar
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"; // Funciones de Firestore
import "../../App.css"; // Estilos generales
import useForm from "../../hooks/useForm"; // ¡CAMBIO! Importa el custom hook useForm

function UserEditPage() {
  const { userId } = useParams(); // Obtiene el userId de la URL
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
    email: "",
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    telefono: "",
    role: "Mozo de Almacén", // Valor por defecto
    imageUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // Efecto para cargar los datos del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null); // Limpiar errores previos
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // ¡CAMBIO! Usamos setFormData del hook para inicializar el formulario
          setFormData({
            email: userData.email || "",
            nombre: userData.nombre || "",
            primerApellido: userData.primerApellido || "",
            segundoApellido: userData.segundoApellido || "",
            telefono: userData.telefono || "",
            role: userData.role || "Mozo de Almacén",
            imageUrl: userData.imageUrl || "",
          });
          // ¡CAMBIO! Usamos setImagePreviewUrl del hook para la previsualización
          setImagePreviewUrl(userData.imageUrl || "");
          setSelectedFile(null); // Asegurarse de que no haya archivo seleccionado inicialmente
        } else {
          setError("Usuario no encontrado.");
        }
      } catch (err) {
        console.error("Error al cargar datos del usuario:", err);
        setError("Error al cargar los datos del usuario: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, setFormData, setImagePreviewUrl, setSelectedFile]); // Dependencias del efecto

  // ¡CAMBIO! La función handleChange ya viene del hook useForm y maneja archivos e inputs.
  // No necesitamos una implementación manual aquí.

  // Función para guardar los cambios del usuario
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      let finalImageUrl = formData.imageUrl; // Por defecto, mantenemos la que ya estaba en formData
      if (selectedFile) {
        // En una aplicación real, aquí subirías selectedFile a Firebase Storage
        // y asignarías la URL de descarga a finalImageUrl.
        finalImageUrl = imagePreviewUrl; // Usamos la URL de previsualización como la "final" por ahora
      }

      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        nombre: formData.nombre,
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido,
        telefono: formData.telefono,
        role: formData.role,
        imageUrl: finalImageUrl,
      });
      setMessage("Usuario actualizado exitosamente.");
      // Redirigir de nuevo a la lista de usuarios en la página de administración
      navigate("/admin");
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      setError("Error al actualizar usuario: " + err.message);
    }
  };

  // Función para borrar el usuario
  const handleDeleteUser = async () => {
    setMessage("");
    setError("");
    // Subrayado: Usar un modal personalizado en lugar de window.confirm
    // (Por ahora, mantenemos window.confirm para simplicidad, pero se recomienda un modal UI)
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible."
    );
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "users", userId));

        // NOTA: La eliminación de la cuenta de Firebase Authentication DEBE hacerse desde un backend
        // (ej. Cloud Function) para eliminar al usuario completamente. Eliminar desde el frontend
        // solo elimina el documento de Firestore.

        setMessage("Usuario eliminado exitosamente.");
        navigate("/admin");
      } catch (err) {
        console.error("Error al eliminar usuario:", err);
        setError("Error al eliminar usuario: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-content loading-profile">
        <div className="loading-app-message">Cargando datos del usuario...</div>
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
      <h1 className="main-title">Editar Usuario</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form
        onSubmit={handleSaveChanges}
        className="auth-form profile-edit-form"
      >
        {/* Campo de Email (generalmente no editable en Auth directamente, pero lo guardamos en Firestore) */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange} // Usamos handleChange del hook
            required
            aria-label="Correo electrónico"
            disabled // Email suele ser ineditable o requiere lógica de Auth diferente
          />
        </div>

        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange} // Usamos handleChange del hook
            required
            aria-label="Nombre del usuario"
          />
        </div>

        <div className="form-group">
          <label htmlFor="primerApellido">Primer Apellido:</label>
          <input
            type="text"
            id="primerApellido"
            name="primerApellido"
            value={formData.primerApellido}
            onChange={handleChange} // Usamos handleChange del hook
            required
            aria-label="Primer apellido del usuario"
          />
        </div>

        <div className="form-group">
          <label htmlFor="segundoApellido">Segundo Apellido:</label>
          <input
            type="text"
            id="segundoApellido"
            name="segundoApellido"
            value={formData.segundoApellido}
            onChange={handleChange} // Usamos handleChange del hook
            aria-label="Segundo apellido del usuario (opcional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange} // Usamos handleChange del hook
            required
            aria-label="Número de teléfono del usuario"
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Rol:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange} // Usamos handleChange del hook
            required
            aria-label="Rol del usuario"
          >
            <option value="Mozo de Almacén">Mozo de Almacén</option>
            <option value="Administración">Administración</option>
            <option value="Conductor">Conductor</option>{" "}
            {/* Subrayado: ¡NUEVA OPCIÓN DE ROL! */}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Imagen de Perfil:</label>
          <input
            type="file"
            id="imageUrl"
            name="imageUrl"
            accept="image/*"
            onChange={handleChange} // Usamos handleChange del hook (para files)
            aria-label="Seleccionar imagen de perfil"
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
            onClick={handleDeleteUser}
          >
            Borrar Usuario
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserEditPage;
