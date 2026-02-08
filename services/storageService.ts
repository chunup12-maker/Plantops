import { Plant, PlantEntry } from '../types';

const STORAGE_KEY = 'plantops_data_v1';

export const getPlants = (): Plant[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load plants", e);
    return [];
  }
};

export const savePlant = (plant: Plant): void => {
  const plants = getPlants();
  const existingIndex = plants.findIndex(p => p.id === plant.id);
  if (existingIndex >= 0) {
    plants[existingIndex] = plant;
  } else {
    plants.push(plant);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
};

export const deletePlant = (plantId: string): void => {
  const plants = getPlants().filter(p => p.id !== plantId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
};

export const addEntryToPlant = (plantId: string, entry: PlantEntry, newSignature: string): void => {
  const plants = getPlants();
  const plant = plants.find(p => p.id === plantId);
  if (plant) {
    plant.entries.push(entry);
    plant.thoughtSignature = newSignature; // Update long-term memory
    savePlant(plant);
  }
};