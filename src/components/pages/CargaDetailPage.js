// src/pages/CargaDetailPage.jsx
import React, { useEffect, useState, useMemo } from "react"; // Importa useMemo
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
import CargaPaletFormModal from "../../components/CargaPaletFormModal"; // Importa el nuevo modal
import "../../App.css"; // Asegúrate de importar tus estilos generales

function CargaDetailPage() {
  const { cargaId } = useParams(); // Obtiene el ID de la carga de la URL
  const navigate = useNavigate();
  const [carga, setCarga] = useState(null); // Estado para la carga específica
  const [allPalets, setAllPalets] = useState([]); // Estado para todos los palets
  const [loading, setLoading] = useState(true); // Estado para controlar el proceso de carga
  const [error, setError] = useState(null);
  const [showCargaPaletModal, setShowCargaPaletModal] = useState(false); // Estado para controlar el modal

  // Estados para rastrear si los listeners han devuelto datos al menos una vez
  const [hasLoadedCargaOnce, setHasLoadedCargaOnce] = useState(false);
  const [hasLoadedPaletsOnce, setHasLoadedPaletsOnce] = useState(false);

  // Función para determinar el color del palet según el tipo de género
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

  // useEffect 1: Listener para la carga específica por su ID
  useEffect(() => {
    // Restablecemos el error y ponemos loading a true al inicio de la carga de la página
    setError(null);
    setLoading(true); // Se pone a true aquí y el tercer useEffect lo pondrá a false

    const unsubscribeCarga = onSnapshot(
      doc(db, "Cargas", cargaId),
      (docSnap) => {
        if (docSnap.exists()) {
          setCarga({ id: docSnap.id, ...docSnap.data() }); // Actualiza el estado 'carga'
          console.log("Datos de la carga actualizados (CargaDetailPage):", {
            id: docSnap.id,
            ...docSnap.data(),
          });
        } else {
          setError("La carga solicitada no existe.");
          setCarga(null); // Limpia el estado de carga si no se encuentra
        }
        setHasLoadedCargaOnce(true); // Marca que el listener de carga ha respondido al menos una vez
      },
      (err) => {
        console.error("Error al escuchar la carga en CargaDetailPage:", err);
        setError("Error al cargar los detalles de la carga: " + err.message);
        setHasLoadedCargaOnce(true); // Marca que el listener de carga ha respondido (con error)
      }
    );

    // Función de limpieza para desuscribirse del listener de carga
    return () => unsubscribeCarga();
  }, [cargaId]); // Se re-ejecuta si el ID de la carga cambia

  // useEffect 2: Listener para obtener TODOS los palets (necesarios para el enriquecimiento)
  useEffect(() => {
    setError(null); // Restablecemos el error para esta fuente de datos

    const unsubscribePalets = onSnapshot(
      collection(db, "Palets"),
      (snapshot) => {
        const paletsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllPalets(paletsData); // Actualiza el estado 'allPalets'
        console.log(
          "Palets actualizados (desde listener en CargaDetailPage):",
          paletsData
        );
        setHasLoadedPaletsOnce(true); // Marca que el listener de palets ha respondido al menos una vez
      },
      (err) => {
        console.error("Error al escuchar los palets en CargaDetailPage:", err);
        // No necesariamente es un error crítico para la carga de la página,
        // pero registramos el error y marcamos como cargado.
        setHasLoadedPaletsOnce(true); // Marca que el listener de palets ha respondido (con error)
      }
    );

    // Función de limpieza para desuscribirse del listener de palets
    return () => unsubscribePalets();
  }, []); // Se ejecuta solo una vez al montar

  // useEffect 3: Controla el estado de 'loading'
  // Este efecto se ejecuta cuando ambos listeners han respondido al menos una vez.
  useEffect(() => {
    if (hasLoadedCargaOnce && hasLoadedPaletsOnce) {
      setLoading(false); // Una vez que ambos datos están disponibles, la carga ha terminado
    }
  }, [hasLoadedCargaOnce, hasLoadedPaletsOnce]);

  // useMemo para calcular los palets asociados de forma eficiente
  // Esto se recalcula solo cuando 'carga' o 'allPalets' cambian.
  const associatedPaletsData = useMemo(() => {
    if (!carga || !Array.isArray(carga.paletsAsociados) || !allPalets) {
      return []; // Devuelve un array vacío si los datos no están listos o no hay palets asociados
    }
    return carga.paletsAsociados
      .map((paletId) => allPalets.find((p) => p.id === paletId))
      .filter(Boolean); // Filtra los palets que no se encuentren en 'allPalets'
  }, [carga, allPalets]); // Dependencias para la memorización

  // Función para manejar el guardado de un nuevo palet desde el modal
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

  // Nueva función para manejar el clic en un palet individual
  const handlePaletClick = (paletId) => {
    navigate(`/paletdetailpage/${paletId}`);
  };

  // Renderizado condicional basado en el estado de carga y error
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
          {/* Usa los 'associatedPaletsData' calculados con useMemo */}
          {associatedPaletsData.length > 0 ? (
            associatedPaletsData.map((palet) => (
              <div
                key={palet.id}
                // Clase condicional para el borde negro
                className={`associated-pallet-div-detail clickable-palet ${
                  palet.tipoPalet !== "Europeo" ? "non-europeo-border" : ""
                }`}
                style={{
                  backgroundColor: getPaletColor(palet.tipoGenero),
                  color: "black", // Color de letra a negro
                }}
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
