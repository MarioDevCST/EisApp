// src/pages/CargaDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../db/firebase-config";
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore"; // Importa addDoc, updateDoc, arrayUnion
import CargaPaletFormModal from "../../components/CargaPaletFormModal"; // Subrayado: Importa el nuevo modal
import "../../App.css"; // Asegúrate de importar tus estilos generales

function CargaDetailPage() {
  // Subrayado: Renombrado a CargaDetailPage
  const { cargaId } = useParams(); // Obtiene el ID de la carga de la URL
  const navigate = useNavigate();
  const [carga, setCarga] = useState(null);
  const [palets, setPalets] = useState([]); // Estado para todos los palets (para el enriquecimiento)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCargaPaletModal, setShowCargaPaletModal] = useState(false); // Subrayado: Estado para controlar el modal

  // Función para determinar el color del palet según el tipo de género (reutilizado)
  const getPaletColor = (tipoGenero) => {
    switch (tipoGenero) {
      case "Tecnico":
        return "#d2b4de"; // Azul para técnico
      case "Congelado":
        return "#aed6f1"; // Verde para congelado
      case "Refrigerado":
        return "#abebc6"; // Naranja para refrigerado
      case "Seco":
        return "#f5cba7"; // Rojo para seco
      default:
        return "#95a5a6"; // Gris por defecto
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    let currentLoadedCarga = null; // Para almacenar la carga más reciente
    let currentLoadedPalets = []; // Para almacenar todos los palets más recientes

    // Función para enriquecer la carga con sus datos de palets y actualizar el estado
    const enrichCargaData = () => {
      // Solo intenta enriquecer si tenemos datos de carga y palets
      if (currentLoadedCarga && currentLoadedPalets) {
        const rawPaletsAsociados = currentLoadedCarga.paletsAsociados || [];
        const associatedPaletsData = Array.isArray(rawPaletsAsociados)
          ? rawPaletsAsociados
              .map((paletId) =>
                currentLoadedPalets.find((p) => p.id === paletId)
              )
              .filter(Boolean) // Filtra los IDs de palet que no se encuentren
          : [];
        setCarga({ ...currentLoadedCarga, associatedPaletsData });

        if (currentLoadedCarga && currentLoadedPalets) {
          setLoading(false);
        }
      } else if (!currentLoadedCarga && !loading) {
        // Si no se encontró la carga y ya no estamos cargando, entonces es un error
        setError("La carga solicitada no existe.");
        setLoading(false);
      }
    };

    // Listener para la carga específica
    const unsubscribeCarga = onSnapshot(
      doc(db, "Cargas", cargaId),
      (docSnap) => {
        if (docSnap.exists()) {
          currentLoadedCarga = { id: docSnap.id, ...docSnap.data() };
          console.log(
            "Datos de la carga actualizados (CargaDetailPage):",
            currentLoadedCarga
          );
          enrichCargaData(); // Intenta enriquecer con los datos de palets actuales
        } else {
          setError("La carga solicitada no existe.");
          setLoading(false);
          currentLoadedCarga = null; // Asegura que la carga esté nula
          setCarga(null); // Limpia el estado de carga
        }
      },
      (err) => {
        console.error("Error al escuchar la carga en CargaDetailPage:", err);
        setError("Error al cargar los detalles de la carga: " + err.message);
        setLoading(false);
      }
    );

    // Listener para todos los palets (necesarios para el enriquecimiento)
    const unsubscribePalets = onSnapshot(
      collection(db, "Palets"),
      (snapshot) => {
        currentLoadedPalets = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(
          "Palets actualizados (desde listener en CargaDetailPage):",
          currentLoadedPalets
        );
        enrichCargaData(); // Intenta enriquecer con los datos de carga actuales
      },
      (err) => {
        console.error("Error al escuchar los palets en CargaDetailPage:", err);
        // No necesariamente es un error crítico si la carga existe, pero los palets fallan.
        // Podrías decidir cómo manejarlo. Por ahora, solo log.
      }
    );

    // Función de limpieza para desuscribirse de ambos listeners
    return () => {
      unsubscribeCarga();
      unsubscribePalets();
    };
  }, [cargaId]); // Se re-ejecuta si el ID de la carga cambia en la URL

  // Subrayado: Función para manejar el guardado de un nuevo palet desde el modal
  const handleSavePaletForCarga = async (newPaletData) => {
    try {
      // 1. Guardar el nuevo palet en la colección 'Palets'
      const paletsCollectionRef = collection(db, "Palets");
      const docRef = await addDoc(paletsCollectionRef, newPaletData);
      const newPaletId = docRef.id;

      // 2. Actualizar el documento de la carga para añadir el ID del nuevo palet
      const cargaDocRef = doc(db, "Cargas", cargaId);
      await updateDoc(cargaDocRef, {
        paletsAsociados: arrayUnion(newPaletId), // Usa arrayUnion para añadir el ID al array
      });

      console.log(
        "Palet creado y asociado a la carga con éxito! ID del palet:",
        newPaletId
      );
      setShowCargaPaletModal(false); // Cierra el modal
      // La página se actualizará automáticamente gracias a los listeners de onSnapshot
    } catch (err) {
      console.error("Error al crear y asociar el palet:", err);
      setError("Error al crear y asociar el palet: " + err.message);
    }
  };

  // Subrayado: Nueva función para manejar el clic en un palet individual
  const handlePaletClick = (paletId) => {
    navigate(`/paletdetailpage/${paletId}`);
  };

  if (loading) {
    return <div className="loading">Cargando detalles de la carga...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button
          className="create-palet-button"
          onClick={() => navigate("/palets")}
        >
          Volver a Cargas
        </button>
      </div>
    );
  }

  if (!carga) {
    return <div className="loading">No se encontró la carga.</div>; // Este caso ya debería ser manejado por el error
  }

  return (
    <div className="page-content">
      <h1 className="main-title">
        Detalles de Carga: {carga.nombreCarga || "N/A"}
      </h1>

      {/* Botón para abrir el modal de creación de palet */}
      <div
        className="button-container"
        style={{
          justifyContent: "flex-end",
          paddingLeft: 0,
          marginTop: "20px",
        }}
      >
        <button
          className="create-palet-button"
          onClick={() => setShowCargaPaletModal(true)}
        >
          Crear Palet para esta Carga
        </button>
      </div>

      <div className="detail-card">
        <p>
          <strong>Nombre del Barco:</strong> {carga.nombreBarco || "N/A"}
        </p>
        <p>
          <strong>Fecha de Carga:</strong> {carga.fechaCarga || "N/A"}
        </p>
        {/* Aquí puedes añadir más detalles de la carga */}

        <h3>Palets Asociados:</h3>
        <div className="associated-pallets-detail-display">
          {Array.isArray(carga.associatedPaletsData) &&
          carga.associatedPaletsData.length > 0 ? (
            carga.associatedPaletsData.map((palet) => (
              <div
                key={palet.id}
                className="associated-pallet-div-detail clickable-palet" // Añade la clase 'clickable-palet'
                style={{ backgroundColor: getPaletColor(palet.tipoGenero) }}
                title={`Palet Nº ${palet.numeroPalet} (${palet.tipoGenero})`}
                onClick={() => handlePaletClick(palet.id)} // Agrega el evento onClick
              >
                Nº {palet.numeroPalet || "N/A"} - Tipo:{" "}
                {palet.tipoPalet || "N/A"}
              </div>
            ))
          ) : (
            <p className="no-palets-message">
              No hay palets asociados a esta carga.
            </p>
          )}
        </div>
      </div>
      <button
        className="create-palet-button"
        onClick={() => navigate("/palets")}
        style={{ marginTop: "20px" }}
      >
        Volver a Cargas
      </button>

      {/* Modal para crear un nuevo palet asociado a esta carga */}
      <CargaPaletFormModal
        show={showCargaPaletModal}
        onClose={() => setShowCargaPaletModal(false)}
        onSave={handleSavePaletForCarga}
        cargaId={carga.id}
        cargaNombreBarco={carga.nombreBarco}
        cargaFecha={carga.fechaCarga}
      />
    </div>
  );
}

export default CargaDetailPage;
