// src/components/pages/PruebaPage.jsx
import React from "react";
import PaletList from "../PaletList"; // Importa el componente PaletList
import "../../App.css"; // Importa estilos generales

function PruebaPage() {
  return (
    <div className="page-content">
      <h1 className="main-title">Página de Prueba de Palets</h1>
      {/* El componente PaletList se renderiza aquí para tus pruebas */}
      <PaletList />
    </div>
  );
}

export default PruebaPage;
