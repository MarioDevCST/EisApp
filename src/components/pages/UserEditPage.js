// src/components/pages/UserEditPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Para obtener parámetros de la URL y navegar
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"; // Funciones de Firestore
import "../../App.css"; // Estilos generales

function UserEditPage() {
  const { userId } = useParams(); // Obtiene el userId de la URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    telefono: "",
    role: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  // Efecto para cargar los datos del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setFormData({
            email: userData.email || "",
            nombre: userData.nombre || "",
            primerApellido: userData.primerApellido || "",
            segundoApellido: userData.segundoApellido || "",
            telefono: userData.telefono || "",
            role: userData.role || "Mozo de Almacén", // Asegura un valor por defecto
            imageUrl: userData.imageUrl || "",
          });
          setImagePreviewUrl(userData.imageUrl || ""); // Establece la URL de previsualización
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
  }, [userId]); // Se re-ejecuta si el userId cambia

  // Manejador de cambios para los campos del formulario
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageUrl" && files && files[0]) {
      const file = files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Función para guardar los cambios del usuario
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      // Aquí se implementaría la lógica para subir la imagen a Firebase Storage si selectedFile no es nulo
      // Por ahora, solo actualizamos la URL de la imagen si se seleccionó una nueva,
      // o mantenemos la existente si no se cambió.
      let finalImageUrl = formData.imageUrl; // Por defecto, mantenemos la que ya estaba en formData
      if (selectedFile) {
        // En una aplicación real, aquí subirías selectedFile a Firebase Storage
        // y asignarías la URL de descarga a finalImageUrl.
        // Ejemplo: finalImageUrl = await uploadImageToFirebaseStorage(selectedFile);
        finalImageUrl = imagePreviewUrl; // Usamos la URL de previsualización como la "final" por ahora
      }

      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        // El email no suele ser editable directamente vía este método en Auth, pero lo guardamos en Firestore
        // Si el email se edita aquí, recuerda que no cambia el email de la cuenta de Firebase Authentication.
        // Para cambiar el email de Firebase Auth, se necesita updateEmail() con reautenticación.
        // email: formData.email,
        nombre: formData.nombre,
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido,
        telefono: formData.telefono,
        role: formData.role,
        imageUrl: finalImageUrl,
      });
      setMessage("Usuario actualizado exitosamente.");
      // Redirigir de nuevo a la lista de usuarios
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
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible."
    );
    if (confirmDelete) {
      try {
        // Subrayado: Elimina el documento del usuario de Firestore
        await deleteDoc(doc(db, "users", userId));

        // IMPORTANTE: Para eliminar el usuario de Firebase Authentication (no solo el documento de Firestore),
        // normalmente necesitarías un proceso más seguro:
        // 1. Reautenticación del administrador.
        // 2. Uso del Admin SDK de Firebase en un entorno de backend (Cloud Functions, Node.js server)
        // para llamar a admin.auth().deleteUser(userId).
        // Eliminar directamente con deleteUser() en el frontend solo funciona para el usuario actualmente logueado.

        setMessage("Usuario eliminado exitosamente.");
        // Subrayado: Redirigir a la lista de usuarios en la página de administración
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
            required
            aria-label="Rol del usuario"
          >
            <option value="Mozo de Almacén">Mozo de Almacén</option>
            <option value="Administración">Administración</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Imagen de Perfil:</label>
          <input
            type="file"
            id="imageUrl"
            name="imageUrl"
            accept="image/*"
            onChange={handleChange}
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
