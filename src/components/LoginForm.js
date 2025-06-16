// src/components/LoginForm.jsx
import React, { useState } from "react";
import { auth } from "../db/firebase-config"; // Importa la instancia de autenticación de Firebase
import { signInWithEmailAndPassword } from "firebase/auth"; // Importa la función de inicio de sesión por email/password
import { useNavigate } from "react-router-dom"; // Para redirigir al usuario después del login
import "./AuthForm.css"; // Estilos compartidos para formularios de autenticación

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Estado para mensajes de error
  const navigate = useNavigate(); // Hook para la navegación programática

  // Función que se ejecuta al enviar el formulario de inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario (recarga de página)
    setError(""); // Limpia cualquier error previo

    try {
      // Intenta iniciar sesión con el email y la contraseña proporcionados
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Sesión iniciada con éxito!");
      // Si el inicio de sesión es exitoso, redirige al usuario a la página principal (Dashboard)
      navigate("/");
    } catch (err) {
      // Captura y muestra cualquier error que ocurra durante el inicio de sesión
      console.error("Error al iniciar sesión:", err);
      // Actualiza el estado de error con un mensaje amigable para el usuario
      setError("Error al iniciar sesión: " + err.message);
    }
  };

  return (
    <div className="auth-form-container">
      {" "}
      {/* Contenedor principal del formulario */}
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Iniciar Sesión</h2>
        {/* Muestra el mensaje de error si existe */}
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="login-email">Email:</label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Correo electrónico para iniciar sesión"
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Contraseña:</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Contraseña para iniciar sesión"
          />
        </div>

        <button type="submit" className="submit-button">
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
