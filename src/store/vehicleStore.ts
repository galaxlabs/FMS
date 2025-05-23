import { create } from 'zustand';
import { Vehicle } from '../types';
import { LocalStorageManager } from '../utils/storage';

// Initialize local storage manager
const vehicleStorage = new LocalStorageManager<Vehicle>('vehicles');

// Mock vehicles for demo
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    companyId: '1',
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2022,
    plateNumber: 'ABC123',
    chassisNumber: 'JTMHV05J504123456',
    vehicleType: 'suv',
    status: 'active',
    assignedDriverId: '3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    companyId: '1',
    make: 'Toyota',
    model: 'HiAce',
    year: 2021,
    plateNumber: 'XYZ789',
    chassisNumber: 'JTFSS22P0H0123456',
    vehicleType: 'van',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    companyId: '2',
    make: 'Mercedes-Benz',
    model: 'Sprinter',
    year: 2023,
    plateNumber: 'DEF456',
    chassisNumber: 'WD3PE7CC1KP123456',
    vehicleType: 'van',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Populate local storage with mock data
vehicleStorage.replaceAllData(mockVehicles);

interface VehicleState {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
}

interface VehicleStore extends VehicleState {
  fetchVehicles: (companyId?: string) => Promise<Vehicle[]>;
  getVehicleById: (id: string) => Promise<Vehicle | undefined>;
  getVehiclesByCompany: (companyId: string) => Promise<Vehicle[]>;
  createVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => Promise<Vehicle>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<Vehicle | undefined>;
  deleteVehicle: (id: string) => Promise<boolean>;
  assignDriver: (vehicleId: string, driverId: string) => Promise<Vehicle | undefined>;
  unassignDriver: (vehicleId: string) => Promise<Vehicle | undefined>;
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: [],
  isLoading: false,
  error: null,

  fetchVehicles: async (companyId?: string) => {
    set({ isLoading: true, error: null });

    try {
      const vehicles = vehicleStorage.getAll();
      const filteredVehicles = companyId 
        ? vehicles.filter(v => v.companyId === companyId)
        : vehicles;
      
      set({ vehicles: filteredVehicles, isLoading: false });
      return filteredVehicles;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      set({ error: 'Failed to fetch vehicles', isLoading: false });
      return [];
    }
  },

  getVehicleById: async (id: string) => {
    try {
      return vehicleStorage.getById(id);
    } catch (error) {
      console.error('Error getting vehicle:', error);
      set({ error: 'Failed to get vehicle' });
      return undefined;
    }
  },

  getVehiclesByCompany: async (companyId: string) => {
    set({ isLoading: true, error: null });

    try {
      const vehicles = vehicleStorage.getAll();
      const companyVehicles = vehicles.filter(v => v.companyId === companyId);
      
      set({ isLoading: false });
      return companyVehicles;
    } catch (error) {
      console.error('Error getting company vehicles:', error);
      set({ error: 'Failed to get company vehicles', isLoading: false });
      return [];
    }
  },

  createVehicle: async (vehicleData) => {
    set({ isLoading: true, error: null });

    try {
      const timestamp = new Date().toISOString();
      const newVehicle = {
        ...vehicleData,
        id: crypto.randomUUID(),
        created_at: timestamp,
        updated_at: timestamp,
      };
      
      const createdVehicle = vehicleStorage.create(newVehicle);
      
      set(state => ({
        vehicles: [...state.vehicles, createdVehicle],
        isLoading: false,
      }));
      
      return createdVehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      set({ error: 'Failed to create vehicle', isLoading: false });
      throw error;
    }
  },

  updateVehicle: async (id, data) => {
    set({ isLoading: true, error: null });

    try {
      const vehicle = vehicleStorage.getById(id);
      
      if (!vehicle) {
        set({ error: 'Vehicle not found', isLoading: false });
        return undefined;
      }
      
      const updatedVehicle = {
        ...vehicle,
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      const result = vehicleStorage.update(updatedVehicle);
      
      set(state => ({
        vehicles: state.vehicles.map(v => v.id === id ? updatedVehicle : v),
        isLoading: false,
      }));
      
      return result;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      set({ error: 'Failed to update vehicle', isLoading: false });
      return undefined;
    }
  },

  deleteVehicle: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const result = vehicleStorage.delete(id);
      
      if (result) {
        set(state => ({
          vehicles: state.vehicles.filter(v => v.id !== id),
          isLoading: false,
        }));
      } else {
        set({ error: 'Vehicle not found', isLoading: false });
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      set({ error: 'Failed to delete vehicle', isLoading: false });
      return false;
    }
  },

  assignDriver: async (vehicleId, driverId) => {
    return get().updateVehicle(vehicleId, { assignedDriverId: driverId });
  },

  unassignDriver: async (vehicleId) => {
    return get().updateVehicle(vehicleId, { assignedDriverId: undefined });
  },
}));