// src/components/pages/PaletsPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import { collection, onSnapshot } from "firebase/firestore"; // Importa onSnapshot
import { useNavigate } from "react-router-dom"; // Importa useNavigate
import "../../App.css"; // Importa estilos generales

function PaletsPage() {
  // Estados para los datos brutos de las colecciones
  const [rawCargas, setRawCargas] = useState([]);
  const [rawPalets, setRawPalets] = useState([]);

  // Estado que se usará para renderizar (cargas ya enriquecidas)
  const [cargasParaMostrar, setCargasParaMostrar] = useState([]);

  // Estados para controlar si la carga inicial de cada colección ha finalizado
  const [initialCargasLoaded, setInitialCargasLoaded] = useState(false);
  const [initialPaletsLoaded, setInitialPaletsLoaded] = useState(false);

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para determinar el color del palet según el tipo de género (reutilizada de PaletCard)
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

  // useEffect 1: Listener para la colección "Cargas"
  useEffect(() => {
    setError(null);
    const unsubscribeCargas = onSnapshot(
      collection(db, "Cargas"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRawCargas(data);
        setInitialCargasLoaded(true); // Marca que las cargas iniciales se han cargado
        console.log("Raw Cargas actualizadas:", data);
      },
      (cargasError) => {
        console.error("Error al escuchar las cargas:", cargasError);
        setError("Error al cargar las cargas: " + cargasError.message);
        setInitialCargasLoaded(true); // Marca como cargado incluso si hay error
      }
    );

    return () => unsubscribeCargas();
  }, []);

  // useEffect 2: Listener para la colección "Palets"
  useEffect(() => {
    setError(null);
    const unsubscribePalets = onSnapshot(
      collection(db, "Palets"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRawPalets(data);
        setInitialPaletsLoaded(true); // Marca que los palets iniciales se han cargado
        console.log("Raw Palets actualizados:", data);
      },
      (paletsError) => {
        console.error("Error al escuchar los palets:", paletsError);
        setError("Error al cargar los palets: " + paletsError.message);
        setInitialPaletsLoaded(true); // Marca como cargado incluso si hay error
      }
    );

    return () => unsubscribePalets();
  }, []);

  // useEffect 3: Lógica para enriquecer las cargas y actualizar el estado de renderizado
  // Este efecto solo se ejecutará cuando ambos estados de datos brutos y sus flags de carga inicial cambien.
  useEffect(() => {
    if (initialCargasLoaded && initialPaletsLoaded) {
      const enriched = rawCargas.map((carga) => {
        const rawPaletsAsociados = carga.paletsAsociados || [];
        const associatedPaletsData = Array.isArray(rawPaletsAsociados)
          ? rawPaletsAsociados
              .map((paletId) => rawPalets.find((p) => p.id === paletId))
              .filter(Boolean) // Filtra los palets que no se encuentren
          : [];
        return {
          ...carga,
          associatedPaletsData,
        };
      });
      setCargasParaMostrar(enriched);
      console.log("Cargas enriquecidas para mostrar:", enriched);
    }
  }, [rawCargas, rawPalets, initialCargasLoaded, initialPaletsLoaded]); // Dependencias clave

  // Función para manejar el clic en una tarjeta de carga
  const handleCargaClick = (cargaId) => {
    navigate(`/cargadetailpage/${cargaId}`);
  };

  // Control de carga global
  if (!initialCargasLoaded || !initialPaletsLoaded) {
    return <div className="loading">Cargando cargas y palets asociados...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="page-content">
      <h1 className="main-title">Gestión de Cargas de Palets</h1>

      {cargasParaMostrar.length > 0 ? (
        <div className="cargas-cards-container">
          {cargasParaMostrar.map((carga) => {
            // CAMBIO CLAVE: Aquí se usa 'associatedPaletsData' (sin la 'l' extra)
            // para que coincida con la propiedad establecida en el useEffect de enriquecimiento.
            const currentAssociatedPallets = Array.isArray(
              carga.associatedPaletsData
            )
              ? carga.associatedPaletsData
              : [];

            return (
              <div
                key={carga.id}
                className="carga-card-large clickable-card"
                onClick={() => handleCargaClick(carga.id)}
              >
                <span className="carga-card-name">
                  {carga.nombreCarga || "Nombre de Carga No Disponible"}
                </span>

                {/* Contenedor para los IDs de los palets asociados */}
                <div className="associated-pallets-display">
                  {currentAssociatedPallets.length > 0 ? (
                    <>
                      {/* Muestra la cantidad total de palets */}
                      <span
                        className="associated-pallet-id"
                        style={{
                          backgroundColor: "#7f8c8d", // Un gris neutro para el conteo
                          color: "white",
                          fontSize: "1.2em",
                          fontWeight: "bold",
                          marginRight: "10px", // Espacio a la derecha del conteo
                        }}
                      >
                        Total: {currentAssociatedPallets.length}
                      </span>
                      {/* Mapea solo los primeros 3 palets */}
                      {currentAssociatedPallets.slice(0, 3).map((palet) => (
                        <span
                          key={palet.id}
                          className="associated-pallet-id"
                          title={`Palet Nº: ${palet.numeroPalet} (${palet.tipoGenero})`}
                          style={{
                            backgroundColor: getPaletColor(palet.tipoGenero),
                            color: "black", // Color de letra a negro
                            fontSize: "1.2em",
                            fontWeight: "bold",
                          }}
                        >
                          Nº {palet.numeroPalet || "N/A"}
                        </span>
                      ))}
                      {/* Muestra puntos suspensivos si hay más de 3 palets */}
                      {currentAssociatedPallets.length > 3 && (
                        <span
                          className="associated-pallet-id"
                          style={{
                            backgroundColor: "#ccc",
                            color: "black",
                            fontSize: "1.2em",
                            fontWeight: "bold",
                          }}
                        >
                          {" "}
                          {/* Color de letra a negro */}
                          ...
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="no-palets-message">
                      No hay palets asociados.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="user-list-container"
          style={{
            minHeight: "150px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p>No hay cargas registradas.</p>
        </div>
      )}
    </div>
  );
}

export default PaletsPage;
