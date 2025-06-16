// src/components/pages/CargasPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import { collection, getDocs } from "firebase/firestore"; // Importa funciones para obtener documentos
import "../../App.css"; // Importa estilos generales

function CargasPage() {
  const navigate = useNavigate();
  const [cargas, setCargas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener la lista de cargas de Firestore
  const fetchCargas = async () => {
    try {
      setLoading(true);
      const cargasSnapshot = await getDocs(collection(db, "Cargas")); // Consulta la colección 'Cargas'
      const cargasList = cargasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCargas(cargasList);
      setLoading(false);
    } catch (err) {
      setError("Error al cargar las cargas: " + err.message);
      setLoading(false);
      console.error("Error fetching cargas:", err);
    }
  };

  useEffect(() => {
    fetchCargas();
    // Puedes implementar un listener con onSnapshot aquí para actualizaciones en tiempo real
    // const unsubscribe = onSnapshot(collection(db, "Cargas"), (snapshot) => { ... });
    // return () => unsubscribe();
  }, []);

  const handleCreateCargaClick = () => {
    navigate("/createcarga"); // Navega a la ruta del formulario de creación de carga
  };

  // Función para manejar el clic en el botón de Editar (pendiente de implementar la página de edición)
  const handleEditCargaClick = (cargaId) => {
    navigate(`/editcarga/${cargaId}`); // Redirige al nuevo formulario de edición de cargas
  };

  if (loading) {
    return <div className="loading">Cargando cargas...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="page-content">
      {/* Botón para crear carga */}
      <div className="button-container" style={{ justifyContent: "flex-end" }}>
        <button
          className="create-palet-button"
          onClick={handleCreateCargaClick}
        >
          Crear Carga
        </button>
      </div>

      {cargas.length > 0 ? (
        <div className="user-list-container">
          {" "}
          {/* Reutiliza el contenedor de lista de usuarios para el estilo */}
          <table className="users-table">
            {" "}
            {/* Reutiliza la clase de tabla de usuarios */}
            <thead>
              <tr>
                <th>Nombre de Carga</th>
                <th>Nombre de Barco</th>
                <th>Fecha de Carga</th>
                <th>Palets Asociados</th> {/* Nuevo encabezado de columna */}
                <th>Acciones</th> {/* Botón de Editar */}
              </tr>
            </thead>
            <tbody>
              {cargas.map((carga) => (
                <tr key={carga.id}>
                  <td>{carga.nombreCarga || "N/A"}</td>
                  <td>{carga.nombreBarco || "N/A"}</td>
                  <td>{carga.fechaCarga || "N/A"}</td>
                  <td>
                    {/* Muestra el array paletsAsociados o un mensaje si está vacío */}
                    {carga.paletsAsociados && carga.paletsAsociados.length > 0
                      ? carga.paletsAsociados.join(", ")
                      : "Ninguno"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="action-button edit-button"
                      onClick={() => handleEditCargaClick(carga.id)}
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
          <p>No hay cargas registradas.</p>
        </div>
      )}
    </div>
  );
}

export default CargasPage;
