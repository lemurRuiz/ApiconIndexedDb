import axios from 'axios';
import { openDB } from 'idb';

const API_URL = 'https://www.swapi.tech/api';
const DB_NAME = 'StarWarsDB';
const STORE_NAME = 'people';

// Inicializa la base de datos de IndexedDB
async function initDB() {
  try {
    console.log('Inicializando IndexedDB...');
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'uid' });
          console.log('Object store creado:', STORE_NAME);
        }
      },
    });
  } catch (error) {
    console.error('Error al inicializar IndexedDB:', error);
    throw error;
  }
}

// Obtiene los personajes desde IndexedDB o desde la API si no están en la base de datos
export const getPeople = async () => {
  try {
    const db = await initDB();
    const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
    const cachedData = await store.getAll();
    console.log('Datos en cache:', cachedData);

    if (cachedData.length) {
      console.log('Usando datos de IndexedDB');
      return cachedData;
    } else {
      console.log('Obteniendo datos desde la API...');
      const response = await axios.get(`${API_URL}/people`);
      const people = response.data.results;
      console.log('Datos obtenidos de la API:', people);

      // Almacenar cada personaje en IndexedDB
      const tx = db.transaction(STORE_NAME, 'readwrite');
      for (const person of people) {
        tx.store.put(person);
      }
      await tx.done;

      return people;
    }
  } catch (error) {
    console.error('Error al obtener personajes de la API o desde IndexedDB:', error);
    throw error;
  }
};

// Obtiene los detalles específicos de cada personaje
export const getPersonDetails = async (personId) => {
  try {
    const db = await initDB();
    const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
    const cachedPerson = await store.get(personId);
    console.log(`Detalles en cache para el personaje ${personId}:`, cachedPerson);

    if (cachedPerson && cachedPerson.details) {
      console.log(`Usando detalles en cache para el personaje ${personId}`);
      return cachedPerson.details;
    } else {
      console.log(`Obteniendo detalles desde la API para el personaje ${personId}...`);
      const response = await axios.get(`${API_URL}/people/${personId}`);
      const details = response.data.result.properties;

      // Abrir una nueva transacción para guardar detalles
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const person = await tx.store.get(personId);
      tx.store.put({ ...person, details });
      await tx.done;

      return details;
    }
  } catch (error) {
    console.error('Error al obtener detalles del personaje desde la API o IndexedDB:', error);
    throw error;
  }
};
