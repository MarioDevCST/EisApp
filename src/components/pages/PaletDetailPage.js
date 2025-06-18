// src/components/pages/PaletDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../db/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import "../../App.css"; // Estilos generales
import useForm from "../../hooks/useForm"; // ¡CAMBIO! Importa el custom hook useForm

function PaletDetailPage() {
  const { paletId } = useParams(); // Obtiene el ID del palet de la URL
  const navigate = useNavigate();

  // ¡CAMBIO CLAVE! Usamos el custom hook useForm
  // Aunque actualmente solo es una página de detalle, la integración de useForm
  // prepara el componente para futuras funcionalidades de edición sin reescribir mucho código.
  const {
    formData, // formData contendrá los datos del palet
    setFormData, // setFormData se usa para inicializar el formulario con los datos cargados
    // handleChange, selectedFile, imagePreviewUrl, resetForm no son necesarios para solo visualización,
    // pero serían útiles si se añadiera un formulario de edición aquí.
  } = useForm({
    cargaAsociadaId: "",
    nombreBarco: "",
    fechaCarga: "",
    numeroPalet: null,
    tipoPalet: "",
    tipoGenero: "",
    createdAt: null, // Para manejar la fecha de creación
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para determinar el color de fondo según el tipo de género (reutilizada de PaletCard)
  const getPaletColor = (tipoGenero) => {
    switch (tipoGenero) {
      case "Tecnico":
        return "#d2b4de";
      case "Congelado":
        return "#aed6f1";
      case "Refrigerado":
        return "#abebc6";
      case "Seco":
        return "#f5cba7";
      default:
        return "#95a5a6";
    }
  };

  // Efecto para cargar los datos del palet
  useEffect(() => {
    const fetchPaletData = async () => {
      setLoading(true);
      setError(null);
      try {
        const paletDocRef = doc(db, "Palets", paletId);
        const paletDocSnap = await getDoc(paletDocRef);

        if (paletDocSnap.exists()) {
          const paletData = paletDocSnap.data();
          // ¡CAMBIO! Usamos setFormData del hook para poblar el formulario
          setFormData({
            cargaAsociadaId: paletData.cargaAsociadaId || "",
            nombreBarco: paletData.nombreBarco || "",
            fechaCarga: paletData.fechaCarga || "",
            numeroPalet: paletData.numeroPalet || null,
            tipoPalet: paletData.tipoPalet || "",
            tipoGenero: paletData.tipoGenero || "",
            // Convierte el Timestamp de Firestore a un objeto Date de JS
            createdAt: paletData.createdAt
              ? paletData.createdAt.toDate()
              : null,
          });
        } else {
          setError("Palet no encontrado.");
        }
      } catch (err) {
        console.error("Error al cargar los datos del palet:", err);
        setError("Error al cargar los detalles del palet: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaletData();
  }, [paletId, setFormData]); // Dependencias: paletId para re-fetch, setFormData para el hook

  if (loading) {
    return <div className="loading">Cargando detalles del palet...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button className="submit-button" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    );
  }

  // Usamos formData como nuestro objeto de palet para renderizar
  const palet = formData;

  if (!palet || (!palet.numeroPalet && !palet.tipoPalet && !palet.tipoGenero)) {
    // Si formData está vacío o no tiene datos clave después de la carga
    return (
      <div className="loading">No se encontraron datos para el palet.</div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="main-title">
        Detalles del Palet: Nº {palet.numeroPalet || "N/A"}
      </h1>

      <div className="detail-card">
        <div
          className="palet-detail-header"
          style={{ backgroundColor: getPaletColor(palet.tipoGenero) }}
        >
          <p>
            <strong>Número:</strong> {palet.numeroPalet || "N/A"}
          </p>
          <p>
            <strong>Tipo de Palet:</strong> {palet.tipoPalet || "N/A"}
          </p>
          <p>
            <strong>Tipo de Género:</strong> {palet.tipoGenero || "N/A"}
          </p>
        </div>
        <div className="palet-detail-body">
          <p>
            <strong>Asociado a Carga ID:</strong>{" "}
            {palet.cargaAsociadaId || "N/A"}
          </p>
          <p>
            <strong>Nombre del Barco:</strong> {palet.nombreBarco || "N/A"}
          </p>
          <p>
            <strong>Fecha de Carga:</strong> {palet.fechaCarga || "N/A"}
          </p>
          {/* Muestra la fecha de creación en un formato legible */}
          <p>
            <strong>Fecha de Creación:</strong>{" "}
            {palet.createdAt ? palet.createdAt.toLocaleDateString() : "N/A"}
          </p>
        </div>
      </div>

      <button
        className="submit-button"
        onClick={() => navigate(-1)}
        style={{ marginTop: "20px" }}
      >
        Volver
      </button>
      {/* En el futuro, aquí podría ir un botón para editar: */}
      {/* <button className="submit-button" onClick={() => navigate(`/editpalet/${paletId}`)} style={{ marginTop: '20px', marginLeft: '10px' }}>
        Editar Palet
      </button> */}
    </div>
  );
}

export default PaletDetailPage;
