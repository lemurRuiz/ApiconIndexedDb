import React, { useEffect, useState } from 'react';
import { getPeople, getPersonDetails } from './api';
import './App.css';

function App() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Obtener los datos de personajes (primero busca en IndexedDB)
        const data = await getPeople();
        
        // Agregar detalles específicos de cada personaje
        const detailedPeople = await Promise.all(
          data.map(async (person) => {
            const details = await getPersonDetails(person.uid);
            return { ...person, ...details };
          })
        );

        // Actualizar el estado de la aplicación con los datos obtenidos
        setPeople(detailedPeople);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="App">Cargando...</div>;
  }

  return (
    <div className="App">
      <h1>Personajes de Star Wars</h1>
      <div className="grid">
        {people.map((person) => (
          <div key={person.uid} className="card">
            <div className="card-content">
              <h3>{person.name}</h3>
              <h4>{person.gender}</h4> 
              <p>
                <strong>Altura:</strong> {person.height} cm<br />
                <strong>Nacimiento:</strong> {person.birth_year}<br />
                <strong>Creado el:</strong> {new Date(person.created).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
