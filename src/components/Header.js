// src/components/Header.jsx
import React from "react";
import "./Header.css"; // Importa los estilos para la cabecera

// Header ahora acepta las props user y userProfile
function Header({ user, userProfile }) {
  // Función para obtener las iniciales del nombre si no hay imagen de perfil
  const getInitials = (name, lastName) => {
    let initials = "";
    if (name) {
      initials += name[0];
    }
    if (lastName) {
      initials += lastName[0];
    }
    return initials.toUpperCase();
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Reemplazado el div placeholder por una etiqueta <img> */}
        <img src="/logo.png" alt="EisApp Logo" className="app-logo" />{" "}
        {/* Asegúrate de que tu logo se llame logo.png y esté en la carpeta public */}
        {/* Nombre de la aplicación */}
        <span className="app-name">EisApp</span>
      </div>
      <div className="header-right">
        {user ? (
          <>
            <span className="user-name-placeholder">
              {/* Lógica mejorada para mostrar el nombre completo o email */}
              {userProfile && (userProfile.nombre || userProfile.primerApellido)
                ? `${userProfile.nombre || ""} ${
                    userProfile.primerApellido || ""
                  }`.trim()
                : user
                ? user.email
                : ""}
            </span>
            {/* Muestra la foto de perfil o un placeholder de iniciales */}
            {userProfile && userProfile.imageUrl ? (
              <img
                src={userProfile.imageUrl}
                alt="Foto de Perfil"
                className="user-profile-image"
              />
            ) : (
              <div className="user-initials-placeholder">
                {/* Lógica mejorada para mostrar iniciales */}
                {userProfile &&
                (userProfile.nombre || userProfile.primerApellido)
                  ? getInitials(userProfile.nombre, userProfile.primerApellido)
                  : user
                  ? user.email[0].toUpperCase()
                  : "U"}
              </div>
            )}
          </>
        ) : (
          // Mostrar placeholder si no hay usuario logueado
          <>
            <span className="user-name-placeholder">Invitado</span>
            <div className="user-initials-placeholder">U</div>{" "}
            {/* Usamos el mismo estilo para placeholder */}
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
