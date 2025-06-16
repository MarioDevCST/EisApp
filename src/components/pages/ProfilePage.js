// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "../../db/firebase-config"; // Importa auth y db
import { doc, getDoc } from "firebase/firestore"; // Importa doc y getDoc de Firestore
import { onAuthStateChanged } from "firebase/auth"; // Para obtener el usuario actual
import "../../App.css"; // Importa estilos generales, incluyendo .page-content y los estilos de perfil

function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null); // Estado para almacenar los datos del perfil
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(""); // Estado de error

  useEffect(() => {
    // Listener para el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Si hay un usuario logueado, intenta obtener sus datos de Firestore
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            // Si el documento existe, establece los datos del perfil
            setUserProfile({ id: userDocSnap.id, ...userDocSnap.data() });
          } else {
            // Si el documento de perfil no existe en Firestore, muestra los datos básicos de Auth
            setError(
              "No se encontraron datos de perfil adicionales en Firestore. Mostrando información básica."
            );
            setUserProfile({
              id: user.uid,
              email: user.email,
              nombre: "N/A", // Placeholders
              primerApellido: "N/A",
              segundoApellido: "N/A",
              telefono: "N/A",
              role: "N/A",
              imageUrl: "",
            });
          }
        } catch (err) {
          console.error(
            "Error al obtener el perfil de usuario desde Firestore:",
            err
          );
          setError("Error al cargar los datos del perfil: " + err.message);
        } finally {
          setLoading(false); // La carga ha terminado
        }
      } else {
        // Si no hay usuario logueado
        setLoading(false);
        setError("No hay usuario autenticado para mostrar el perfil.");
        setUserProfile(null);
      }
    });

    // Función de limpieza: se desuscribe del listener cuando el componente se desmonta
    return () => unsubscribe();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Renderizado condicional basado en el estado de carga y error
  if (loading) {
    return (
      <div className="page-content loading-profile">
        <div className="loading-app-message">
          Cargando perfil del usuario...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content error-profile">
        <div className="error-app-message">{error}</div>
      </div>
    );
  }

  // Si no hay userProfile (y no hay error de carga), significa que no hay usuario logueado
  if (!userProfile) {
    return (
      <div className="page-content">
        <h1 className="main-title">Mi Perfil</h1>
        <p>Por favor, inicia sesión para ver tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="main-title">Mi Perfil</h1>

      <div className="profile-card">
        {userProfile.imageUrl ? (
          // Muestra la imagen de perfil si hay una URL
          <img
            src={userProfile.imageUrl}
            alt="Foto de Perfil"
            className="profile-image"
          />
        ) : (
          // Muestra un placeholder con las iniciales si no hay imagen
          <div className="profile-image-placeholder">
            {/* Si el nombre no está disponible, usa la primera letra del email */}
            {userProfile.nombre
              ? userProfile.nombre[0].toUpperCase()
              : userProfile.email
              ? userProfile.email[0].toUpperCase()
              : ""}
          </div>
        )}

        <div className="profile-details">
          <p>
            <strong>Nombre:</strong> {userProfile.nombre || "No proporcionado"}
          </p>
          <p>
            <strong>Primer Apellido:</strong>{" "}
            {userProfile.primerApellido || "No proporcionado"}
          </p>
          <p>
            <strong>Segundo Apellido:</strong>{" "}
            {userProfile.segundoApellido || "No proporcionado"}
          </p>
          <p>
            <strong>Email:</strong> {userProfile.email || "No proporcionado"}
          </p>
          <p>
            <strong>Teléfono:</strong>{" "}
            {userProfile.telefono || "No proporcionado"}
          </p>
          <p>
            <strong>Rol:</strong> {userProfile.role || "No proporcionado"}
          </p>
          {/* Puedes añadir más datos aquí si los tienes, como fecha de creación, etc. */}
        </div>
      </div>

      {/* Subrayado: Ahora usa la clase 'profile-edit-button' */}
      <button className="profile-edit-button">Editar Perfil</button>
    </div>
  );
}

export default ProfilePage;
