import axios from 'axios';
import { openDB } from 'idb';

const API_URL = 'https://www.swapi.tech/api';
const DB_NAME = 'StarWarsDB';
const STORE_NAME = 'people';

async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'uid' });
    },
  });
}

// Función para obtener personajes de Star Wars desde IndexedDB o API
export const getPeople = async () => {
  const db = await initDB();
  const store = db.transaction(STORE_NAME).objectStore(STORE_NAME);
  const cachedData = await store.getAll();

  if (cachedData.length) {
    return cachedData;
  } else {
    try {
      const response = await axios.get(`${API_URL}/people`);
      const people = response.data.results;

      // Almacena los datos en IndexedDB
      const tx = db.transaction(STORE_NAME, 'readwrite');
      for (const person of people) {
        tx.store.put(person);
      }
      await tx.done;

      return people;
    } catch (error) {
      console.error('Error al obtener personajes', error);
      throw error;
    }
  }
};

// Función para obtener detalles de cada personaje
export const getPersonDetails = async (personId) => {
  const db = await initDB();
  const store = db.transaction(STORE_NAME).objectStore(STORE_NAME);
  const cachedPerson = await store.get(personId);

  if (cachedPerson && cachedPerson.details) {
    return cachedPerson.details;
  } else {
    try {
      const response = await axios.get(`${API_URL}/people/${personId}`);
      const details = response.data.result.properties;

      // Guarda los detalles en IndexedDB
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const person = await store.get(personId);
      tx.store.put({ ...person, details });
      await tx.done;

      return details;
    } catch (error) {
      console.error('Error al obtener detalles del personaje', error);
      throw error;
    }
  }
};
