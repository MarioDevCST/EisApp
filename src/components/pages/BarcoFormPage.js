// src/components/pages/BarcoFormPage.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import { collection, query, where, getDocs, addDoc } from "firebase/firestore"; // Funciones de Firestore
import { useNavigate } from "react-router-dom"; // Para la navegación
import "../../App.css"; // Estilos generales (reusaremos .auth-form-container, .form-group, etc.)

function BarcoFormPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    tipo: "Mercante", // Valor por defecto
    responsableId: "", // ID del usuario administrador seleccionado
    imageUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [administrators, setAdministrators] = useState([]); // Lista de usuarios administradores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // Efecto para cargar los usuarios con rol "Administración"
  useEffect(() => {
    const fetchAdministrators = async () => {
      try {
        setLoading(true);
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
        // Establecer el primer administrador como responsable por defecto si hay alguno
        if (adminList.length > 0) {
          setFormData((prevData) => ({
            ...prevData,
            responsableId: adminList[0].id,
          }));
        } else {
          // Si no hay administradores, asegúrate de que el responsableId sea una cadena vacía
          setFormData((prevData) => ({
            ...prevData,
            responsableId: "",
          }));
        }
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar administradores:", err);
        setError("Error al cargar la lista de administradores: " + err.message);
        setLoading(false);
      }
    };

    fetchAdministrators();
  }, []); // Se ejecuta solo una vez al montar el componente

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

  // Función para manejar el envío del formulario y crear el barco
  const handleCreateBarco = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (administrators.length === 0) {
      setError(
        "No se puede crear el barco: No hay usuarios con rol 'Administración' disponibles para asignar como responsable."
      );
      return;
    }
    if (!formData.responsableId) {
      setError("Debe seleccionar un responsable para el barco.");
      return;
    }

    try {
      let finalImageUrl = "";
      if (selectedFile) {
        // En una aplicación real, aquí subirías selectedFile a Firebase Storage
        // y asignarías la URL de descarga a finalImageUrl.
        // Por ahora, usamos la URL de previsualización como la "final".
        finalImageUrl =
          imagePreviewUrl || "https://placehold.co/100x100?text=No+Image";
      }

      // Añadir el nuevo barco a la colección "Barcos" en Firestore
      await addDoc(collection(db, "Barcos"), {
        nombre: formData.nombre,
        empresa: formData.empresa,
        tipo: formData.tipo,
        responsableId: formData.responsableId,
        imageUrl: finalImageUrl,
        createdAt: new Date(),
      });

      setMessage("Barco creado exitosamente.");
      // Limpiar formulario
      setFormData({
        nombre: "",
        empresa: "",
        tipo: "Mercante",
        responsableId: administrators.length > 0 ? administrators[0].id : "",
        imageUrl: "",
      });
      setSelectedFile(null);
      setImagePreviewUrl("");

      // Subrayado: Redirige a la ruta /admin.
      // Luego, en AdminPage, tendremos que asegurarnos de que la sección activa sea 'barcos'.
      navigate("/admin");
    } catch (err) {
      console.error("Error al crear barco:", err);
      setError("Error al crear barco: " + err.message);
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
      <h1 className="main-title">Crear Nuevo Barco</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form
        onSubmit={handleCreateBarco}
        className="auth-form profile-edit-form"
      >
        {" "}
        {/* Reutilizamos estilos */}
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
            // Deshabilita si no hay administradores o si están cargando
            disabled={administrators.length === 0 && !loading}
          >
            {loading ? ( // Mostrar "Cargando..." mientras se cargan
              <option value="">Cargando administradores...</option>
            ) : administrators.length === 0 ? ( // Si no hay administradores después de cargar
              <option value="">No hay administradores disponibles</option>
            ) : (
              // Si hay administradores
              <>
                {/* Puedes añadir una opción vacía si no quieres que el primero sea por defecto */}
                {/* <option value="">Selecciona un responsable</option> */}
                {administrators.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.fullName}
                  </option>
                ))}
              </>
            )}
          </select>
          {administrators.length === 0 && !loading && (
            <p className="error-message">
              No hay usuarios con rol "Administración" disponibles para asignar
              como responsable.
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
        <div
          className="form-actions-edit-user"
          style={{ justifyContent: "center" }}
        >
          <button type="submit" className="submit-button">
            Crear Barco
          </button>
        </div>
      </form>
    </div>
  );
}

export default BarcoFormPage;
