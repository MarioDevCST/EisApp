// src/components/PaletList.jsx
import React, { useEffect, useState } from "react";
import { db } from "../db/firebase-config"; // Asegúrate de que la ruta sea correcta
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore"; // Subrayado: addDoc, doc, updateDoc, arrayUnion son necesarios
import PaletCard from "./PaletCard";
import PaletFormModal from "./PaletFormModal"; // Importa el componente del modal

function PaletList() {
  const [palets, setPalets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  // Subrayado: Función para manejar la creación de un nuevo palet y vincularlo a la carga
  const handleCreatePalet = async (newPaletData) => {
    try {
      // 1. Guardar el nuevo palet en la colección 'Palets'
      const docRef = await addDoc(collection(db, "Palets"), newPaletData);
      const newPaletId = docRef.id; // Obtener el ID del palet recién creado

      // 2. Asociar el palet con la carga correspondiente en la colección 'Cargas'
      if (newPaletData.cargaAsociadaId) {
        const cargaDocRef = doc(db, "Cargas", newPaletData.cargaAsociadaId);
        await updateDoc(cargaDocRef, {
          // Utiliza arrayUnion para añadir el ID del palet al array 'paletsAsociados'
          paletsAsociados: arrayUnion(newPaletId),
        });
        console.log(
          `Palet ${newPaletId} asociado a la carga ${newPaletData.cargaAsociadaId} con éxito.`
        );
      }

      console.log("Palet añadido con éxito!");
      setShowModal(false); // Cierra el modal después de guardar
      fetchPalets(); // Vuelve a cargar los palets para ver el nuevo
    } catch (err) {
      console.error("Error al añadir el palet o asociarlo a la carga:", err);
      // Aquí podrías usar un estado para mostrar un mensaje de error en la UI del PaletList
      setError(
        "Hubo un error al guardar el palet o asociarlo a la carga: " +
          err.message
      );
    }
  };

  if (loading) {
    return <div className="loading">Cargando palets...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <>
      {" "}
      {/* Usamos un Fragmento para agrupar múltiples elementos */}
      {/* Botón "Crear Palet" y su contenedor */}
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
      {/* Componente del formulario modal, ahora renderizado por PaletList */}
      <PaletFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleCreatePalet}
      />
    </>
  );
}

export default PaletList;
