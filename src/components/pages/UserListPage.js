// src/components/UserListPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import { collection, onSnapshot } from "firebase/firestore"; // Importa onSnapshot para actualizaciones en tiempo real
import { useNavigate } from "react-router-dom"; // Para la navegación
import "../../App.css"; // Importa estilos generales como .loading, .error, .button-container

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para la navegación

  // Función para obtener la lista de usuarios de Firestore en tiempo real
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Usa onSnapshot para escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id, // El UID del usuario es el ID del documento
          ...doc.data(), // Datos del usuario (email, role, etc.)
        }));
        setUsers(usersList);
        setLoading(false);
      },
      (err) => {
        // Manejo de errores para el listener
        setError("Error al cargar los usuarios: " + err.message);
        setLoading(false);
        console.error("Error fetching users with onSnapshot:", err);
      }
    );

    // Función de limpieza: desuscribe el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, []); // Dependencias vacías para que se ejecute una vez al montar

  // Función para manejar el clic en el botón de Editar
  const handleEditUserClick = (userId) => {
    navigate(`/edituser/${userId}`); // Navega a la ruta de edición, pasando el ID del usuario
  };

  if (loading) {
    return (
      <div className="user-list-container loading-profile">
        <div className="loading-app-message">Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list-container error-profile">
        <div className="error-app-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      {users.length > 0 ? (
        <table className="users-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Rol</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="user-image-cell">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="Foto de perfil"
                      className="user-table-image"
                    />
                  ) : (
                    <div className="user-table-image-placeholder">
                      {user.nombre
                        ? user.nombre[0].toUpperCase()
                        : user.email
                        ? user.email[0].toUpperCase()
                        : ""}
                    </div>
                  )}
                </td>
                <td>{user.nombre || "N/A"}</td>
                <td>
                  {`${user.primerApellido || ""} ${
                    user.segundoApellido || ""
                  }`.trim() || "N/A"}
                </td>
                <td>{user.role || "N/A"}</td>
                <td>{user.telefono || "N/A"}</td>
                <td>{user.email}</td>
                <td style={{ textAlign: "center" }}>
                  <button
                    className="action-button edit-button"
                    onClick={() => handleEditUserClick(user.id)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div
          style={{
            minHeight: "150px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p>No hay usuarios registrados.</p>
        </div>
      )}
    </div>
  );
}

export default UserListPage;
