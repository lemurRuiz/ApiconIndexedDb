import axios from 'axios';
import { openDB } from 'idb';

const API_URL = 'https://www.swapi.tech/api';
const DB_NAME = 'StarWarsDB';
const STORE_NAME = 'people';

// Inicializa la base de datos de IndexedDB
async function initDB() {
  try {
    console.log('Inicializando IndexedDB...');
    
    // Incrementa la versión para forzar la creación del objeto store si no existe
    return openDB(DB_NAME, 2, {
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

// Guarda datos en IndexedDB
async function savePeopleToDB(people) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await Promise.all(people.map(person => store.put(person)));
  await tx.done;
}

// Obtiene datos de IndexedDB
async function getPeopleFromDB() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return await store.getAll();
}

// Obtiene datos de la API y los guarda en IndexedDB
export async function fetchAndCachePeople() {
  try {
    const response = await axios.get(`${API_URL}/people`);
    const people = response.data.results;

    await savePeopleToDB(people);
    return people;
  } catch (error) {
    console.error('Error fetching people from API:', error);
    return [];
  }
}

// Obtiene personas, priorizando los datos en IndexedDB
export async function getPeople() {
  const peopleFromDB = await getPeopleFromDB();

  if (peopleFromDB.length > 0) {
    return peopleFromDB;
  } else {
    return await fetchAndCachePeople();
  }
}
