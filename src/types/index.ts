// User types
export type Role = 'driver' | 'company' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  companyId?: string;
  nationality?: string;
  identificationNumber?: string;
  created_at: string;
  updated_at: string;
}

// Company types
export interface Company {
  id: string;
  name: string;
  logo?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

// Vehicle types
export type VehicleType = 'sedan' | 'suv' | 'van' | 'bus' | 'truck' | 'other';

export interface Vehicle {
  id: string;
  companyId: string;
  make: string;
  model: string;
  year?: number;
  plateNumber: string;
  chassisNumber: string;
  vehicleType: VehicleType;
  status: 'active' | 'maintenance' | 'inactive';
  assignedDriverId?: string;
  created_at: string;
  updated_at: string;
}

// Assignment types
export interface Assignment {
  id: string;
  vehicleId: string;
  driverId: string;
  companyId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Passenger types
export interface Passenger {
  id: string;
  name: string;
  nationality: string;
  identificationNumber: string;
  identificationType: 'passport' | 'id' | 'other';
  fromLocation: string;
  destination: string;
  tripDate: string;
  driverId: string;
  vehicleId: string;
  companyId: string;
  reportId?: string;
  created_at: string;
  updated_at: string;
}

// Report types
export interface Report {
  id: string;
  driverId: string;
  vehicleId: string;
  companyId: string;
  passengerId: string;
  reportUrl: string;
  qrCodeUrl: string;
  status: 'generated' | 'verified' | 'invalid';
  created_at: string;
  updated_at: string;
}

// Form and Report Template types
export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: string;
}

export interface FormTemplate {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  fields: FormField[];
  created_at: string;
  updated_at: string;
}

export interface ReportTemplate {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  header?: string;
  footer?: string;
  logo?: string;
  fields: string[];
  created_at: string;
  updated_at: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Dashboard types
export interface DashboardStats {
  totalDrivers: number;
  totalVehicles: number;
  totalPassengers: number;
  totalReports: number;
  activeDrivers: number;
  activeVehicles: number;
  recentReports: Report[];
  recentPassengers: Passenger[];
}