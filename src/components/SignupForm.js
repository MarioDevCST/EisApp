// src/components/SignupForm.jsx
import React, { useState } from "react"; // Mantenemos useState para error/message
// Importar las funciones necesarias para crear una nueva instancia de Firebase
import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db, firebaseConfig } from "../db/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";
import useForm from "../hooks/useForm"; // ¡CAMBIO! Importa el custom hook useForm

function SignupForm() {
  // ¡CAMBIO CLAVE! Usamos el custom hook useForm
  // Los campos de email y password no se gestionan con formData directamente para Auth,
  // pero el resto de datos del perfil sí.
  const {
    formData,
    handleChange,
    selectedFile,
    imagePreviewUrl,
    resetForm,
    setSelectedFile, // ¡CORRECCIÓN! Desestructuramos setSelectedFile
    setImagePreviewUrl, // ¡CORRECCIÓN! Desestructuramos setImagePreviewUrl
  } = useForm({
    email: "", // Aunque gestionaremos email y password aparte para Auth, los incluimos para el reset
    password: "",
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    telefono: "",
    role: "Mozo de Almacén",
    imageUrl: "",
  });

  // Mantenemos estados separados para email y password, ya que son directamente para `createUserWithEmailAndPassword`
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Modificamos el handleChange para los campos que no son email/password para usar el hook
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // Si el campo es email o password, los gestionamos con sus propios estados
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    } else {
      // Para el resto de campos (nombre, apellido, etc.), usamos el handleChange del hook
      handleChange(e);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    let tempAppInstance = null;
    let tempAuthInstance;
    const appName = "tempUserCreationApp";

    try {
      const existingApp = getApps().find((app) => app.name === appName);

      if (existingApp) {
        try {
          await deleteApp(existingApp);
          console.log(
            `Instancia temporal preexistente '${appName}' eliminada antes de la creación.`
          );
        } catch (deleteErr) {
          if (deleteErr.code !== "app/app-deleted") {
            console.warn(
              `Advertencia: No se pudo eliminar la instancia temporal preexistente '${appName}':`,
              deleteErr
            );
          }
        }
      }

      tempAppInstance = initializeApp(firebaseConfig, appName);
      tempAuthInstance = getAuth(tempAppInstance);

      // Usamos los estados `email` y `password` directos para la autenticación
      const userCredential = await createUserWithEmailAndPassword(
        tempAuthInstance,
        email,
        password
      );
      const user = userCredential.user;

      let finalImageUrl = "";
      if (selectedFile) {
        finalImageUrl =
          imagePreviewUrl || "https://placehold.co/100x100?text=No+Image";
      }

      await setDoc(doc(db, "users", user.uid), {
        email: email, // Usamos el estado email
        nombre: formData.nombre,
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido,
        telefono: formData.telefono,
        role: formData.role,
        imageUrl: finalImageUrl,
        createdAt: new Date(),
      });

      setMessage(
        "Registro exitoso. ¡Usuario creado sin afectar la sesión actual del administrador!"
      );
      // Reiniciamos los estados del formulario y del hook
      setEmail("");
      setPassword("");
      resetForm(); // Resetea los campos gestionados por useForm
      setSelectedFile(null); // Asegura que el archivo seleccionado se limpie
      setImagePreviewUrl(""); // Asegura que la URL de previsualización se limpie

      navigate("/admin");
    } catch (err) {
      console.error("Error al registrar:", err);
      setError("Error al registrar: " + err.message);
    } finally {
      if (tempAppInstance) {
        try {
          await deleteApp(tempAppInstance);
          console.log(
            `Instancia temporal '${appName}' eliminada en finally block.`
          );
        } catch (deleteErr) {
          if (deleteErr.code === "app/app-deleted") {
            console.warn(
              `Instancia temporal '${appName}' ya estaba eliminada.`
            );
          } else {
            console.error(
              `Error inesperado al eliminar instancia temporal '${appName}':`,
              deleteErr
            );
          }
        } finally {
          tempAppInstance = null;
        }
      }
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSignup} className="auth-form">
        <h2>Registrar Nuevo Usuario</h2>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email} // ¡CAMBIO! Usa el estado `email`
            onChange={handleFormChange} // ¡CAMBIO! Usa el nuevo manejador
            required
            aria-label="Correo electrónico"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password} // ¡CAMBIO! Usa el estado `password`
            onChange={handleFormChange} // ¡CAMBIO! Usa el nuevo manejador
            required
            aria-label="Contraseña"
          />
        </div>

        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange} // ¡CAMBIO! Usa handleChange del hook
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
            onChange={handleChange} // ¡CAMBIO! Usa handleChange del hook
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
            onChange={handleChange} // ¡CAMBIO! Usa handleChange del hook
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
            onChange={handleChange} // ¡CAMBIO! Usa handleChange del hook
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
            onChange={handleChange} // ¡CAMBIO! Usa handleChange del hook
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
            onChange={handleChange} // ¡CAMBIO! Usa handleChange del hook (para files)
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

        <button type="submit" className="submit-button">
          Registrar
        </button>
      </form>
    </div>
  );
}

export default SignupForm;
