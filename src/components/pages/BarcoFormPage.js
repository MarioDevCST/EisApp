// src/components/pages/BarcoFormPage.jsx
import React, { useState, useEffect } from "react"; // Mantenemos useState para error/message
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import { collection, query, where, getDocs, addDoc } from "firebase/firestore"; // Funciones de Firestore
import { useNavigate } from "react-router-dom"; // Para la navegación
import "../../App.css"; // Estilos generales (reusaremos .auth-form-container, .form-group, etc.)
import useForm from "../../hooks/useForm"; // ¡CAMBIO! Importa el custom hook useForm

function BarcoFormPage() {
  const navigate = useNavigate();

  // ¡CAMBIO CLAVE! Usamos el custom hook useForm
  const {
    formData,
    handleChange,
    selectedFile,
    imagePreviewUrl,
    resetForm,
    setFormData, // ¡IMPORTANTE! Necesitamos setFormData para actualizar el responsableId
    setSelectedFile,
    setImagePreviewUrl,
  } = useForm({
    nombre: "",
    empresa: "",
    tipo: "Mercante", // Valor por defecto
    responsableId: "", // ID del usuario administrador seleccionado
    imageUrl: "",
    puerto: "BCN", // Valor por defecto
    terminal: "Adosados", // Valor por defecto
  });

  const [administrators, setAdministrators] = useState([]); // Lista de usuarios administradores
  const [loading, setLoading] = useState(true); // Estado de carga para los administradores y datos del formulario
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // Efecto para cargar los usuarios con rol "Administración" y establecer el responsableId inicial
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

        // Establecer el primer administrador como responsable por defecto si hay alguno,
        // usando setFormData del useForm hook
        if (adminList.length > 0) {
          setFormData((prevData) => ({
            ...prevData,
            responsableId: adminList[0].id,
          }));
        } else {
          // Si no hay administradores, asegúrate de que responsableId sea una cadena vacía
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
  }, [setFormData]); // Dependencia del setFormData para que el efecto se ejecute una vez y actualice el hook.

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
        puerto: formData.puerto,
        terminal: formData.terminal,
        createdAt: new Date(),
      });

      setMessage("Barco creado exitosamente.");
      // Limpiar formulario usando resetForm del hook
      resetForm();
      setSelectedFile(null); // Limpiar el archivo seleccionado
      setImagePreviewUrl(""); // Limpiar la URL de previsualización

      // Redirige a la ruta /admin y pasa un estado para activar la sección de barcos.
      navigate("/admin", { state: { fromBarcoAction: true } });
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

  if (error) {
    return (
      <div className="page-content error-profile">
        <div className="error-app-message">{error}</div>
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
            <option value="Ferry">Ferry</option>{" "}
            {/* Subrayado: Nueva opción "Ferry" */}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="puerto">Puerto:</label>
          <select
            id="puerto"
            name="puerto"
            value={formData.puerto}
            onChange={handleChange}
            required
            aria-label="Puerto del barco"
          >
            <option value="BCN">BCN</option>
            <option value="TGN">TGN</option>
            <option value="CDZ">CDZ</option>
            <option value="HAM">HAM</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="terminal">Terminal:</label>
          <select
            id="terminal"
            name="terminal"
            value={formData.terminal}
            onChange={handleChange}
            required
            aria-label="Terminal del barco"
          >
            <option value="Adosados">Adosados</option>
            <option value="APM">APM</option>
            <option value="Best">Best</option>
            <option value="San Beltrán">San Beltrán</option>
            <option value="CarGill">CarGill</option>
            <option value="Cruceros">Cruceros</option>
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
