// src/App.jsx
import React, { useState, useEffect } from "react";
import "./App.css";
// Importaciones de Firebase Auth y Firestore
import { auth, db } from "./db/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Importaciones de componentes de diseño y formulario
import Header from "./components/Header";
import SideMenu from "./components/SideMenu";

// Importaciones de React Router DOM
// CAMBIO CLAVE: BrowserRouter ha sido eliminado de aquí.
// Se asume que tu archivo main.jsx o index.js ya envuelve App en un BrowserRouter.
import { Routes, Route, Navigate } from "react-router-dom";

// Importaciones de componentes de página (desde src/components/pages)
import DashboardPage from "./components/pages/DashboardPage";
import ProfilePage from "./components/pages/ProfilePage";
import AdminPage from "./components/pages/AdminPage";
import LoginPage from "./components/pages/LoginPage";
import SignupPage from "./components/pages/SignupPage";
import UserEditPage from "./components/pages/UserEditPage";
import BarcoFormPage from "./components/pages/BarcoFormPage";
import BarcoEditPage from "./components/pages/BarcoEditPage";
import CargaFormPage from "./components/pages/CargaFormPage";
import CargaEditPage from "./components/pages/CargaEditPage";
import PaletsPage from "./components/pages/PaletsPage";
// ¡IMPORTANTE! Importa el componente CargaDetailPage
import CargaDetailPage from "./components/pages/CargaDetailPage";

import PaletList from "./components/PaletList";

function App() {
  const [user, setUser] = useState(null); // Estado para el usuario autenticado (de Firebase Auth)
  const [userProfile, setUserProfile] = useState(null); // Estado para los datos del perfil (de Firestore)
  const [loadingAuth, setLoadingAuth] = useState(true); // Estado para saber si la autenticación está cargando

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser); // Actualiza el estado 'user'
      if (currentUser) {
        // Si hay un usuario, intenta obtener su perfil de Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data());
          } else {
            // Si no se encuentra el documento del perfil, al menos usa los datos básicos del usuario de Auth
            setUserProfile({
              email: currentUser.email,
              nombre: "Usuario",
              primerApellido: "",
            });
          }
        } catch (error) {
          console.error("Error al obtener el perfil de usuario:", error);
          setUserProfile({
            email: currentUser.email,
            nombre: "Error",
            primerApellido: "",
          });
        }
      } else {
        setUserProfile(null); // Si no hay usuario, el perfil es nulo
      }
      setLoadingAuth(false); // La carga de autenticación ha terminado
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Sesión cerrada con éxito!");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      console.log("Error al cerrar sesión: " + err.message);
    }
  };

  if (loadingAuth) {
    return (
      <div className="App">
        <Header user={null} userProfile={null} />
        <div className="loading-app-message">
          Cargando aplicación y autenticación...
        </div>
      </div>
    );
  }

  return (
    // CAMBIO CLAVE: El div App ahora contiene directamente los componentes y las rutas.
    // El BrowserRouter debe estar en un nivel superior (main.jsx/index.js).
    <div className="App">
      {/* Pasa el objeto 'user' y 'userProfile' al Header */}
      <Header user={user} userProfile={userProfile} />

      {/* El SideMenu se mostrará solo si el usuario está logueado */}
      {user && <SideMenu onLogout={handleLogout} />}

      <Routes>
        {/* Rutas Públicas: Accesibles si NO hay usuario logueado */}
        {!user ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/createuser" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          // Rutas Protegidas: Accesibles si el usuario SÍ está logueado
          <>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/createuser" element={<SignupPage />} />
            <Route path="/edituser/:userId" element={<UserEditPage />} />
            <Route path="/createbarco" element={<BarcoFormPage />} />
            <Route path="/editbarco/:barcoId" element={<BarcoEditPage />} />
            <Route path="/createcarga" element={<CargaFormPage />} />
            <Route path="/editcarga/:cargaId" element={<CargaEditPage />} />
            <Route path="/palets" element={<PaletsPage />} />
            <Route path="/prueba" element={<PaletList />} />
            {/* ¡NUEVA RUTA! para la página de detalle de carga */}
            <Route
              path="/cargadetailpage/:cargaId"
              element={<CargaDetailPage />}
            />

            <Route
              path="/logout"
              element={
                <div className="page-content logout-container">
                  <p>
                    ¿Estás seguro de que quieres cerrar sesión, {user.email}?
                  </p>
                  <button className="submit-button" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </div>
              }
            />

            <Route path="/login" element={<Navigate to="/" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
