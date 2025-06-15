// src/App.jsx
import React, { useEffect, useState } from "react";
import "./App.css";
import { db } from "./db/firebase-config"; // Asegúrate de que esta ruta sea correcta
import { collection, getDocs, addDoc } from "firebase/firestore";
import PaletCard from "./components/PaletCard";
import PaletFormModal from "./components/PaletFormModal";
import Header from "./components/Header"; // Importa el componente Header
import SideMenu from "./components/SideMenu";

function App() {
  const [palets, setPalets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // NOTA: El estado 'showSideMenu' y la función 'toggleSideMenu' NO están aquí,
  // ya que esta es la versión anterior a la integración del menú lateral.

  const fetchPalets = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "Palets"));
      const paletsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPalets(paletsList);
      setLoading(false);
    } catch (err) {
      setError("Error al cargar los datos de palets: " + err.message);
      setLoading(false);
      console.error("Error fetching palets:", err);
    }
  };

  useEffect(() => {
    fetchPalets();
  }, []);

  const handleCreatePalet = async (newPaletData) => {
    try {
      await addDoc(collection(db, "Palets"), newPaletData);
      console.log("Palet añadido con éxito!");
      setShowModal(false);
      fetchPalets();
    } catch (err) {
      console.error("Error al añadir el palet:", err);
      alert("Hubo un error al guardar el palet: " + err.message);
    }
  };

  // NOTA: La función 'toggleSideMenu' NO está definida aquí.

  if (loading) {
    return (
      <div className="App">
        <Header /> {/* Renderiza el Header */}
        <div className="loading">Cargando palets...</div>
        {/* El SideMenu NO se renderiza aquí */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <Header /> {/* Renderiza el Header */}
        <div className="error">Error: {error}</div>
        {/* El SideMenu NO se renderiza aquí */}
      </div>
    );
  }

  return (
    <div className="App">
      {/* Renderiza el componente Header al inicio del App */}
      {/* NOTA: No se le pasa la prop 'onMenuToggle' al Header en esta versión. */}
      <Header />
      <SideMenu />
      {/* El resto del contenido de la app */}
      <h1 className="main-title">Inventario de Palets</h1>
      <div className="button-container">
        <button
          className="create-palet-button"
          onClick={() => setShowModal(true)}
        >
          Crear Palet
        </button>
      </div>
      <div className="palets-grid">
        {palets.length > 0 ? (
          palets.map((palet) => <PaletCard key={palet.id} palet={palet} />)
        ) : (
          <p>No hay palets registrados en la base de datos.</p>
        )}
      </div>

      <PaletFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleCreatePalet}
      />
      {/* El SideMenu NO se renderiza aquí en esta versión. */}
    </div>
  );
}

export default App;
