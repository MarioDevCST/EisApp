// src/components/PaletCard.jsx
import React from "react";
import "./PaletCard.css";

function PaletCard({ palet }) {
  // Función para obtener el color de la franja según el tipo de género
  const getBorderColorClass = (tipoGenero) => {
    switch (tipoGenero) {
      case "Tecnico":
        return "border-tecnico"; // Clase CSS para el color Técnico
      case "Congelado":
        return "border-congelado"; // Clase CSS para el color Congelado
      case "Refrigerado":
        return "border-refrigerado"; // Clase CSS para el color Refrigerado
      case "Seco":
        return "border-seco"; // Clase CSS para el color Seco
      default:
        return "border-default"; // Clase por defecto si no coincide
    }
  };

  // Construimos la clase completa para el borde dinámico
  const cardBorderClass = getBorderColorClass(palet.tipoGenero);

  return (
    // Agregamos la clase de borde dinámico aquí
    <div className={`palet-card ${cardBorderClass}`}>
      {/* Nuevo div para el color de fondo de la imagen, por ahora solo un color */}
      <div className="palet-card-image-placeholder">
        {/* Aquí iría la imagen. Por ahora, solo un div de color */}
      </div>

      <div className="palet-card-content">
        {/* Aquí se parece a la imagen de la tarjeta que me adjuntaste, con un "Post One" */}
        <div className="palet-card-header">
          <span className="palet-card-date">{palet.fechaCarga}</span>{" "}
          {/* Fecha arriba a la derecha */}
        </div>
        <h3 className="palet-card-title">{palet.nombreBarco}</h3>

        <p>
          <strong>Tipo de Palet:</strong> {palet.tipoPalet}
        </p>
        <p>
          <strong>Número de Palet:</strong> {palet.numeroPalet}
        </p>
        {/* Mostramos el nuevo campo tipoGenero */}
        <p>
          <strong>Tipo de Género:</strong> {palet.tipoGenero}
        </p>
      </div>

      {/* Franja inferior con el color de género */}
      <div className={`palet-card-footer-strip ${cardBorderClass}`}>
        {/* Aquí puedes añadir información si lo deseas, o dejarlo vacío para que sea solo la franja de color */}
      </div>
    </div>
  );
}

export default PaletCard;
