// src/components/UserListPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../db/firebase-config"; // Importa la instancia de Firestore
import { collection, getDocs } from "firebase/firestore"; // Importa funciones para obtener documentos
import { useNavigate } from "react-router-dom"; // Para la navegación
import "../../App.css"; // Importa estilos generales como .loading, .error, .button-container

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para la navegación

  // Función para obtener la lista de usuarios de Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users")); // Consulta la colección 'users'
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // El UID del usuario es el ID del documento
        ...doc.data(), // Datos del usuario (email, role, etc.)
      }));
      setUsers(usersList);
      setLoading(false);
    } catch (err) {
      setError("Error al cargar los usuarios: " + err.message);
      setLoading(false);
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Puedes implementar un listener con onSnapshot aquí para actualizaciones en tiempo real
    // const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => { ... });
    // return () => unsubscribe();
  }, []);

  // Subrayado: Eliminado handleCreateUserClick y su botón del render.
  // La navegación a '/createuser' ahora se gestionará exclusivamente desde AdminPage.jsx.

  // Función para manejar el clic en el botón de Editar
  const handleEditUserClick = (userId) => {
    navigate(`/edituser/${userId}`); // Navega a la ruta de edición, pasando el ID del usuario
  };

  if (loading) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="user-list-container">
      {/* Subrayado: Eliminado el botón "Crear Usuario" de aquí. */}
      {/* La gestión del botón "Crear Usuario" se ha movido completamente a AdminPage.jsx */}

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
        <p>No hay usuarios registrados.</p>
      )}
    </div>
  );
}

export default UserListPage;
