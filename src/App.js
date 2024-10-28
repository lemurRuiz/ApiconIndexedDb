import React, { useEffect, useState } from 'react';
import { getPeople, getPersonDetails } from './api';
import './App.css';

function App() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener personajes desde IndexedDB
  const getPeopleFromIndexedDB = async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('StarWarsDB', 1);

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction('people', 'readonly');
        const store = transaction.objectStore('people');
        const allPeople = store.getAll();

        allPeople.onsuccess = () => {
          resolve(allPeople.result);
        };
        allPeople.onerror = () => {
          reject('Error al obtener los personajes desde IndexedDB');
        };
      };

      request.onerror = () => {
        reject('Error al abrir IndexedDB');
      };
    });
  };

  // Función para almacenar personajes en IndexedDB
  const storePeopleInIndexedDB = async (peopleData) => {
    const request = indexedDB.open('StarWarsDB', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('people', 'readwrite');
      const store = transaction.objectStore('people');

      peopleData.forEach((person) => {
        store.put(person);
      });
    };
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Intenta obtener los datos desde IndexedDB
        const cachedPeople = await getPeopleFromIndexedDB();
        if (cachedPeople.length > 0) {
          setPeople(cachedPeople);
          setLoading(false);
        } else {
          // Si no hay datos en IndexedDB, obtén los datos de la API
          const data = await getPeople();
          const detailedPeople = await Promise.all(
            data.map(async (person) => {
              const details = await getPersonDetails(person.uid);
              return { ...person, ...details };
            })
          );
          // Guarda los datos en IndexedDB
          storePeopleInIndexedDB(detailedPeople);
          setPeople(detailedPeople);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
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
