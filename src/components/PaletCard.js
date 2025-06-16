// src/components/PaletCard.jsx
import React, { useState, useEffect } from "react"; // Subrayado: Importa useState y useEffect
import { useNavigate } from "react-router-dom"; // Para la navegación
import { db } from "../db/firebase-config"; // Subrayado: Importa la instancia de Firestore
import { doc, getDoc } from "firebase/firestore"; // Subrayado: Importa doc y getDoc
import "../App.css"; // Importa estilos generales, incluyendo los nuevos para la tarjeta

function PaletCard({ palet }) {
  const navigate = useNavigate();
  // Subrayado: Nuevo estado para almacenar el nombre de la carga asociada
  const [cargaNombre, setCargaNombre] = useState("");
  // Subrayado: Estado para controlar la carga del nombre de la carga
  const [loadingCargaNombre, setLoadingCargaNombre] = useState(true);

  // Efecto para obtener el nombre de la carga asociada
  useEffect(() => {
    const fetchCargaNombre = async () => {
      if (palet.cargaAsociadaId) {
        try {
          setLoadingCargaNombre(true);
          const cargaDocRef = doc(db, "Cargas", palet.cargaAsociadaId);
          const cargaDocSnap = await getDoc(cargaDocRef);
          if (cargaDocSnap.exists()) {
            setCargaNombre(
              cargaDocSnap.data().nombreCarga || "Carga sin nombre"
            );
          } else {
            setCargaNombre("Carga no encontrada");
          }
        } catch (error) {
          console.error("Error al obtener el nombre de la carga:", error);
          setCargaNombre("Error al cargar carga");
        } finally {
          setLoadingCargaNombre(false);
        }
      } else {
        // Si no hay carga asociada, establece un mensaje predeterminado
        setCargaNombre("No asociada");
        setLoadingCargaNombre(false);
      }
    };

    fetchCargaNombre();
  }, [palet.cargaAsociadaId]); // Re-ejecuta cuando la ID de la carga asociada cambia

  // Función para determinar el color de la franja según el tipo de género
  const getBorderColor = (tipoGenero) => {
    switch (tipoGenero) {
      case "Tecnico":
        return "#3498db"; // Azul para técnico
      case "Congelado":
        return "#27ae60"; // Verde para congelado
      case "Refrigerado":
        return "#f39c12"; // Naranja para refrigerado
      case "Seco":
        return "#e74c3c"; // Rojo para seco
      default:
        return "#95a5a6"; // Gris por defecto
    }
  };

  // Función para manejar el clic en el botón de Editar
  const handleEditClick = () => {
    // Aquí puedes redirigir a una página de edición específica para palets
    // Por ahora, solo un log. Deberías crear una ruta como '/editpalet/:paletId'
    console.log(`Editar palet con ID: ${palet.id}`);
    // navigate(`/editpalet/${palet.id}`); // Esto sería un paso futuro
  };

  return (
    <div
      className="palet-card"
      style={{ borderLeftColor: getBorderColor(palet.tipoGenero) }}
    >
      <div className="palet-card-header">
        <h3 className="palet-card-title">{palet.nombreBarco || "Barco N/A"}</h3>
        <span className="palet-card-number">
          Nº {palet.numeroPalet || "N/A"}
        </span>
      </div>
      <div className="palet-card-body">
        <p>
          <strong>Tipo:</strong> {palet.tipoPalet || "N/A"}
        </p>
        {/* Subrayado: Reemplazado Fecha Carga por Carga Asociada */}
        <p>
          <strong>Carga Asociada:</strong>{" "}
          {loadingCargaNombre ? "Cargando..." : cargaNombre}
        </p>
        <p>
          <strong>Género:</strong> {palet.tipoGenero || "N/A"}
        </p>
      </div>
      {/* Nuevo contenedor para el botón de acción */}
      <div className="palet-card-actions">
        <button className="palet-edit-button" onClick={handleEditClick}>
          Editar
        </button>
      </div>
    </div>
  );
}

export default PaletCard;
