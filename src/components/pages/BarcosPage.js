// src/components/pages/BarcosPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import { collection, getDocs, doc, getDoc } from "firebase/firestore"; // Importa funciones para obtener documentos y un solo documento
import "../../App.css"; // Importa estilos generales

function BarcosPage() {
  const navigate = useNavigate();
  const [barcos, setBarcos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener la lista de barcos de Firestore
  const fetchBarcos = async () => {
    try {
      setLoading(true);
      const barcosSnapshot = await getDocs(collection(db, "Barcos"));
      const barcosList = [];

      for (const barcoDoc of barcosSnapshot.docs) {
        const barcoData = {
          id: barcoDoc.id,
          ...barcoDoc.data(),
        };

        // Si el barco tiene un responsableId, intenta obtener el nombre y la imagen del administrador
        if (barcoData.responsableId) {
          try {
            const adminDocRef = doc(db, "users", barcoData.responsableId);
            const adminDocSnap = await getDoc(adminDocRef);
            if (adminDocSnap.exists()) {
              const adminData = adminDocSnap.data();
              barcoData.responsableNombre = `${adminData.nombre || ""} ${
                adminData.primerApellido || ""
              }`.trim();
              barcoData.responsableEmail = adminData.email;
              barcoData.responsableImageUrl = adminData.imageUrl || ""; // Obtener la URL de la imagen del responsable
            } else {
              barcoData.responsableNombre = "Responsable no encontrado";
              barcoData.responsableImageUrl = ""; // Asegurarse de que esté vacío si no se encuentra
            }
          } catch (adminErr) {
            console.warn(
              `Error al obtener responsable para barco ${barcoData.id}:`,
              adminErr
            );
            barcoData.responsableNombre = "Error al cargar responsable";
            barcoData.responsableImageUrl = ""; // Asegurarse de que esté vacío en caso de error
          }
        } else {
          barcoData.responsableNombre = "No asignado";
          barcoData.responsableImageUrl = ""; // Asegurarse de que esté vacío si no está asignado
        }
        barcosList.push(barcoData);
      }

      setBarcos(barcosList);
      setLoading(false);
    } catch (err) {
      setError("Error al cargar los barcos: " + err.message);
      setLoading(false);
      console.error("Error fetching barcos:", err);
    }
  };

  useEffect(() => {
    fetchBarcos();
  }, []);

  const handleCreateBarcoClick = () => {
    navigate("/createbarco"); // Redirige al formulario de creación de barcos
  };

  // Función para manejar el clic en el botón de Editar
  const handleEditBarcoClick = (barcoId) => {
    navigate(`/editbarco/${barcoId}`); // Navega a la ruta de edición de barcos, pasando el ID del barco
  };

  if (loading) {
    return <div className="loading">Cargando barcos...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="page-content">
      <h1 className="main-title">Gestión de Barcos</h1>

      <div className="button-container" style={{ justifyContent: "flex-end" }}>
        <button
          className="create-palet-button"
          onClick={handleCreateBarcoClick} // Abre el modal al hacer clic
        >
          Crear Barco
        </button>
      </div>

      {barcos.length > 0 ? (
        <div className="user-list-container">
          {" "}
          {/* Reutiliza el contenedor de lista de usuarios para el estilo */}
          <table className="users-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Empresa</th>
                <th>Tipo</th>
                <th>Responsable</th>
                <th>Acciones</th> {/* Botón de Editar */}
              </tr>
            </thead>
            <tbody>
              {barcos.map((barco) => (
                <tr key={barco.id}>
                  <td className="user-image-cell">
                    {" "}
                    {/* Centrado de la celda de imagen */}
                    {barco.imageUrl ? (
                      <img
                        src={barco.imageUrl}
                        alt="Foto de barco"
                        className="user-table-image"
                      />
                    ) : (
                      <div className="user-table-image-placeholder">
                        {" "}
                        {/* Reutiliza la clase de placeholder de imagen de usuario */}
                        ⚓ {/* Icono simple para barco si no hay imagen */}
                      </div>
                    )}
                  </td>
                  <td>{barco.nombre || "N/A"}</td>
                  <td>{barco.empresa || "N/A"}</td>
                  <td>{barco.tipo || "N/A"}</td>
                  {/* Mostrar la imagen y el nombre del responsable */}
                  <td className="user-image-cell">
                    {" "}
                    {/* Se alinea al centro para la imagen */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                      }}
                    >
                      {barco.responsableImageUrl ? (
                        <img
                          src={barco.responsableImageUrl}
                          alt="Foto de Responsable"
                          className="user-table-image"
                        />
                      ) : (
                        <div
                          className="user-table-image-placeholder"
                          style={{ fontSize: "0.8em" }}
                        >
                          {barco.responsableNombre
                            ? barco.responsableNombre[0].toUpperCase()
                            : "?"}
                        </div>
                      )}
                      <span>{barco.responsableNombre || "N/A"}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {/* Subrayado: Llama a handleEditBarcoClick con el ID del barco */}
                    <button
                      className="action-button edit-button"
                      onClick={() => handleEditBarcoClick(barco.id)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <p>No hay barcos registrados.</p>
        </div>
      )}
    </div>
  );
}

export default BarcosPage;
