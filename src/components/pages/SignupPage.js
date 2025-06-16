import React from "react";
import SignupForm from "../SignupForm";

function SignupPage() {
  return (
    // Subrayado: Contenedor para alinear el contenido de la página
    <div className="page-content">
      <h1 className="main-title">Login</h1>
      <SignupForm />
    </div>
  );
}

export default SignupPage;
