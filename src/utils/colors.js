// src/utils/colors.js

/**
 * Returns a background color based on the product type.
 * @param {string} tipo - The type of the product (e.g., 'Seco', 'Refrigerado').
 * @returns {string} The hexadecimal color code.
 */
export const getTypeCodeColor = (tipo) => {
  switch (tipo) {
    case "Seco":
      return "#f5cba7"; // Color for Dry
    case "Refrigerado":
      return "#abebc6"; // Color for Refrigerated
    case "Congelado":
      return "#aed6f1"; // Color for Frozen
    case "Tecnico":
      return "#d2b4de"; // Color for Technical
    default:
      return "#95a5a6"; // Default Gray
  }
};

/**
 * Returns a background color based on the pallet's genre type.
 * @param {string} tipoGenero - The genre type of the pallet (e.g., 'Tecnico', 'Congelado').
 * @returns {string} The hexadecimal color code.
 */
export const getPaletColor = (tipoGenero) => {
  switch (tipoGenero) {
    case "Tecnico":
      return "#d2b4de"; // Color for Technical
    case "Congelado":
      return "#aed6f1"; // Color for Frozen
    case "Refrigerado":
      return "#abebc6"; // Color for Refrigerated
    case "Seco":
      return "#f5cba7"; // Color for Dry
    default:
      return "#95a5a6"; // Default Gray
  }
};
