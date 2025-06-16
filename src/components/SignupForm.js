// src/components/SignupForm.jsx
import React, { useState } from "react";
// Importar las funciones necesarias para crear una nueva instancia de Firebase
import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db, firebaseConfig } from "../db/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

function SignupForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    telefono: "",
    role: "Mozo de Almacén",
    imageUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    let tempAppInstance = null;
    let tempAuthInstance;
    const appName = "tempUserCreationApp"; // Define appName constante aquí

    try {
      const existingApp = getApps().find((app) => app.name === appName);

      // Intentar eliminar cualquier instancia existente con el mismo nombre antes de crear una nueva.
      if (existingApp) {
        try {
          await deleteApp(existingApp);
          console.log(
            `Instancia temporal preexistente '${appName}' eliminada antes de la creación.`
          );
        } catch (deleteErr) {
          // Si el error es que la app ya está eliminada, lo ignoramos, de lo contrario, advertimos.
          if (deleteErr.code !== "app/app-deleted") {
            console.warn(
              `Advertencia: No se pudo eliminar la instancia temporal preexistente '${appName}':`,
              deleteErr
            );
          }
        }
      }

      // Siempre inicializar una nueva instancia aquí después de la limpieza.
      tempAppInstance = initializeApp(firebaseConfig, appName);
      tempAuthInstance = getAuth(tempAppInstance);

      const userCredential = await createUserWithEmailAndPassword(
        tempAuthInstance,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      let finalImageUrl = "";
      if (selectedFile) {
        finalImageUrl =
          imagePreviewUrl || "https://placehold.co/100x100?text=No+Image";
      }

      await setDoc(doc(db, "users", user.uid), {
        email: formData.email,
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
      setFormData({
        email: "",
        password: "",
        nombre: "",
        primerApellido: "",
        segundoApellido: "",
        telefono: "",
        role: "Mozo de Almacén",
        imageUrl: "",
      });
      setSelectedFile(null);
      setImagePreviewUrl("");

      navigate("/admin");
    } catch (err) {
      console.error("Error al registrar:", err);
      setError("Error al registrar: " + err.message);
    } finally {
      // Subrayado: Siempre intentar eliminar la instancia temporal que acabamos de crear/usar
      // en este bloque `finally` para asegurar una limpieza.
      // Usamos la variable 'appName' definida al principio del scope para los logs.
      if (tempAppInstance) {
        try {
          await deleteApp(tempAppInstance);
          console.log(
            `Instancia temporal '${appName}' eliminada en finally block.`
          );
        } catch (deleteErr) {
          // Captura específicamente el error "app/app-deleted" para evitar mostrarlo
          // ya que si la app ya no existe, el objetivo de limpieza se cumplió.
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
          // Subrayado: Asegura que tempAppInstance se establezca en null después de cualquier intento de eliminación.
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
            value={formData.email}
            onChange={handleChange}
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
            value={formData.password}
            onChange={handleChange}
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

        <button type="submit" className="submit-button">
          Registrar
        </button>
      </form>
    </div>
  );
}

export default SignupForm;
