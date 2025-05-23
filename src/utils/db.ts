import { createClient } from '@libsql/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Initialize SQLite client
const sqliteClient = createClient({
  url: 'file:local.db',
});

// Initialize Supabase client
const supabaseClient = createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Initialize database schema
export const initDatabase = async () => {
  await sqliteClient.execute(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      action TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      synced INTEGER DEFAULT 0
    )
  `);

  await sqliteClient.execute(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER,
      plate_number TEXT NOT NULL,
      chassis_number TEXT NOT NULL,
      vehicle_type TEXT NOT NULL,
      status TEXT NOT NULL,
      assigned_driver_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_synced INTEGER DEFAULT 0
    )
  `);

  await sqliteClient.execute(`
    CREATE TABLE IF NOT EXISTS passengers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nationality TEXT NOT NULL,
      identification_number TEXT NOT NULL,
      identification_type TEXT NOT NULL,
      from_location TEXT NOT NULL,
      destination TEXT NOT NULL,
      trip_date TEXT NOT NULL,
      driver_id TEXT NOT NULL,
      vehicle_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      report_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_synced INTEGER DEFAULT 0
    )
  `);
};

// Generic function to add item to sync queue
const addToSyncQueue = async (
  tableName: string,
  recordId: string,
  action: 'create' | 'update' | 'delete',
  data: any
) => {
  await sqliteClient.execute({
    sql: `INSERT INTO sync_queue (id, table_name, record_id, action, data) VALUES (?, ?, ?, ?, ?)`,
    args: [crypto.randomUUID(), tableName, recordId, action, JSON.stringify(data)]
  });
};

// Sync data with Supabase
export const syncWithServer = async () => {
  const { data: queueItems } = await sqliteClient.execute(
    'SELECT * FROM sync_queue WHERE synced = 0'
  );

  for (const item of queueItems) {
    try {
      const { table_name, record_id, action, data } = item;
      const parsedData = JSON.parse(data);

      switch (action) {
        case 'create':
          await supabaseClient.from(table_name).insert(parsedData);
          break;
        case 'update':
          await supabaseClient.from(table_name).update(parsedData).eq('id', record_id);
          break;
        case 'delete':
          await supabaseClient.from(table_name).delete().eq('id', record_id);
          break;
      }

      // Mark as synced
      await sqliteClient.execute({
        sql: 'UPDATE sync_queue SET synced = 1 WHERE id = ?',
        args: [item.id]
      });

      // Update record sync status
      await sqliteClient.execute({
        sql: `UPDATE ${table_name} SET is_synced = 1 WHERE id = ?`,
        args: [record_id]
      });
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);
    }
  }
};

// Vehicle operations
export const vehicleOperations = {
  create: async (vehicle: any) => {
    const id = crypto.randomUUID();
    await sqliteClient.execute({
      sql: `INSERT INTO vehicles (
        id, company_id, make, model, year, plate_number, 
        chassis_number, vehicle_type, status, assigned_driver_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        vehicle.company_id,
        vehicle.make,
        vehicle.model,
        vehicle.year,
        vehicle.plate_number,
        vehicle.chassis_number,
        vehicle.vehicle_type,
        vehicle.status,
        vehicle.assigned_driver_id
      ]
    });

    await addToSyncQueue('vehicles', id, 'create', vehicle);
    return { id, ...vehicle };
  },

  update: async (id: string, vehicle: any) => {
    await sqliteClient.execute({
      sql: `UPDATE vehicles SET 
        make = ?, model = ?, year = ?, plate_number = ?,
        chassis_number = ?, vehicle_type = ?, status = ?,
        assigned_driver_id = ?, updated_at = CURRENT_TIMESTAMP,
        is_synced = 0
        WHERE id = ?`,
      args: [
        vehicle.make,
        vehicle.model,
        vehicle.year,
        vehicle.plate_number,
        vehicle.chassis_number,
        vehicle.vehicle_type,
        vehicle.status,
        vehicle.assigned_driver_id,
        id
      ]
    });

    await addToSyncQueue('vehicles', id, 'update', vehicle);
    return { id, ...vehicle };
  },

  delete: async (id: string) => {
    await sqliteClient.execute({
      sql: 'DELETE FROM vehicles WHERE id = ?',
      args: [id]
    });

    await addToSyncQueue('vehicles', id, 'delete', { id });
    return true;
  },

  getAll: async () => {
    const { rows } = await sqliteClient.execute('SELECT * FROM vehicles');
    return rows;
  },

  getById: async (id: string) => {
    const { rows } = await sqliteClient.execute({
      sql: 'SELECT * FROM vehicles WHERE id = ?',
      args: [id]
    });
    return rows[0];
  }
};

// Passenger operations
export const passengerOperations = {
  create: async (passenger: any) => {
    const id = crypto.randomUUID();
    await sqliteClient.execute({
      sql: `INSERT INTO passengers (
        id, name, nationality, identification_number,
        identification_type, from_location, destination,
        trip_date, driver_id, vehicle_id, company_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        passenger.name,
        passenger.nationality,
        passenger.identification_number,
        passenger.identification_type,
        passenger.from_location,
        passenger.destination,
        passenger.trip_date,
        passenger.driver_id,
        passenger.vehicle_id,
        passenger.company_id
      ]
    });

    await addToSyncQueue('passengers', id, 'create', passenger);
    return { id, ...passenger };
  },

  update: async (id: string, passenger: any) => {
    await sqliteClient.execute({
      sql: `UPDATE passengers SET 
        name = ?, nationality = ?, identification_number = ?,
        identification_type = ?, from_location = ?, destination = ?,
        trip_date = ?, updated_at = CURRENT_TIMESTAMP,
        is_synced = 0
        WHERE id = ?`,
      args: [
        passenger.name,
        passenger.nationality,
        passenger.identification_number,
        passenger.identification_type,
        passenger.from_location,
        passenger.destination,
        passenger.trip_date,
        id
      ]
    });

    await addToSyncQueue('passengers', id, 'update', passenger);
    return { id, ...passenger };
  },

  getAll: async () => {
    const { rows } = await sqliteClient.execute('SELECT * FROM passengers');
    return rows;
  },

  getByDriver: async (driverId: string) => {
    const { rows } = await sqliteClient.execute({
      sql: 'SELECT * FROM passengers WHERE driver_id = ?',
      args: [driverId]
    });
    return rows;
  }
};

// Initialize database and start sync process
export const initializeDatabase = async () => {
  await initDatabase();

  // Set up periodic sync
  setInterval(async () => {
    if (navigator.onLine) {
      await syncWithServer();
    }
  }, 5000); // Sync every 5 seconds when online
};

// Listen for online status changes
window.addEventListener('online', syncWithServer);