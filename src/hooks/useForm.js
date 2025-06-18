// src/hooks/useForm.js
import { useState, useCallback } from "react"; // ¡CAMBIO! Importa useCallback

// Custom Hook para gestionar el estado de formularios, incluyendo carga de archivos/imágenes.
// initialData: El objeto de estado inicial del formulario.
function useForm(initialData) {
  const [formData, setFormData] = useState(initialData); // Estado para los datos del formulario
  const [selectedFile, setSelectedFile] = useState(null); // Estado para el archivo de imagen seleccionado
  const [imagePreviewUrl, setImagePreviewUrl] = useState(""); // Estado para la URL de previsualización de la imagen

  // ¡CAMBIO! useCallback para estabilizar setFormData, setSelectedFile, setImagePreviewUrl
  const setFormDataStable = useCallback((value) => setFormData(value), []);
  const setSelectedFileStable = useCallback(
    (value) => setSelectedFile(value),
    []
  );
  const setImagePreviewUrlStable = useCallback(
    (value) => setImagePreviewUrl(value),
    []
  );

  // Manejador genérico para cambios en los inputs del formulario
  // ¡CAMBIO! Envuelve handleChange con useCallback
  const handleChange = useCallback(
    (e) => {
      const { name, value, files } = e.target;
      console.log(`handleChange called for: ${name}, value: ${value}`); // Log de depuración

      // Si el input es de tipo 'file' y se ha seleccionado un archivo
      if (e.target.type === "file" && files && files[0]) {
        const file = files[0];
        setSelectedFileStable(file); // Usa la versión estable

        // Crea una URL para previsualizar la imagen seleccionada
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviewUrlStable(reader.result); // Usa la versión estable
        };
        reader.readAsDataURL(file); // Lee el archivo como una URL de datos (base64)
      } else {
        // Para todos los demás tipos de inputs (texto, número, select, etc.)
        setFormDataStable((prevData) => {
          // Usa la versión estable
          const newState = {
            ...prevData,
            [name]: value,
          };
          console.log(
            `useForm: Updating formData. New state for ${name}:`,
            newState
          ); // Log de depuración
          return newState;
        });
      }
    },
    [setFormDataStable, setSelectedFileStable, setImagePreviewUrlStable]
  ); // Dependencias de handleChange

  // Función para resetear el formulario a su estado inicial
  // ¡CAMBIO! Envuelve resetForm con useCallback
  const resetForm = useCallback(
    (newInitialData = initialData) => {
      console.log(
        "useForm: Resetting form with new initial data:",
        newInitialData
      ); // Log de depuración
      setFormDataStable(newInitialData); // Usa la versión estable
      setSelectedFileStable(null); // Usa la versión estable
      setImagePreviewUrlStable(""); // Usa la versión estable
    },
    [
      initialData,
      setFormDataStable,
      setSelectedFileStable,
      setImagePreviewUrlStable,
    ]
  ); // Dependencias de resetForm

  return {
    formData,
    setFormData: setFormDataStable, // Exporta la versión estable
    handleChange,
    selectedFile,
    setSelectedFile: setSelectedFileStable, // Exporta la versión estable
    imagePreviewUrl,
    setImagePreviewUrl: setImagePreviewUrlStable, // Exporta la versión estable
    resetForm,
  };
}

export default useForm;
