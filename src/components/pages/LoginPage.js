// src/pages/ProfilePage.jsx
import React from "react";
import LoginForm from "../LoginForm";

function LoginPage() {
  return (
    // Subrayado: Contenedor para alinear el contenido de la página
    <div className="page-content">
      <h1 className="main-title">Login</h1>
      <LoginForm />
    </div>
  );
}

export default LoginPage;
