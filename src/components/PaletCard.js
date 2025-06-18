// src/components/PaletCard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../db/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import "../App.css"; // Importa estilos generales
import { getPaletColor } from "../utils/colors"; // Importa la función de colores

function PaletCard({ palet }) {
  const navigate = useNavigate();
  const [cargaNombre, setCargaNombre] = useState("");
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
  }, [palet.cargaAsociadaId]);

  // Función para manejar el clic en el botón de Editar
  const handleEditClick = () => {
    // Redirigir a la página de detalle de palet para edición
    navigate(`/paletdetailpage/${palet.id}`);
  };

  // Determina si el palet no es europeo para aplicar la clase de borde
  const isNonEuropeo = palet.tipoPalet !== "Europeo";

  return (
    <div
      className={`palet-card ${isNonEuropeo ? "non-europeo-border" : ""}`} // ¡CAMBIO CLAVE! Clase condicional
      style={{ borderLeftColor: getPaletColor(palet.tipoGenero) }}
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
        <p>
          <strong>Carga Asociada:</strong>{" "}
          {loadingCargaNombre ? "Cargando..." : cargaNombre}
        </p>
        <p>
          <strong>Género:</strong> {palet.tipoGenero || "N/A"}
        </p>
      </div>
      <div className="palet-card-actions">
        <button className="palet-edit-button" onClick={handleEditClick}>
          Editar
        </button>
      </div>
    </div>
  );
}

export default PaletCard;
