// src/components/pages/PaletDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../db/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import "../../App.css"; // Estilos generales

function PaletDetailPage() {
  const { paletId } = useParams(); // Obtiene el ID del palet de la URL
  const navigate = useNavigate();
  const [palet, setPalet] = useState(null);
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
          setPalet({ id: paletDocSnap.id, ...paletDocSnap.data() });
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
  }, [paletId]); // Se re-ejecuta si el paletId cambia en la URL

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

  if (!palet) {
    return <div className="loading">No se encontró el palet.</div>;
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
          {/* Puedes añadir más detalles si los tienes en tu documento de palet */}
          <p>
            <strong>Fecha de Creación:</strong>{" "}
            {palet.createdAt
              ? new Date(palet.createdAt.toDate()).toLocaleDateString()
              : "N/A"}
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
    </div>
  );
}

export default PaletDetailPage;
