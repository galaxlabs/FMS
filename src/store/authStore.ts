import { create } from 'zustand';
import { AuthState, User, Role } from '../types';

// Mock authentication for demo purposes
// In a real application, this would be connected to Supabase or another auth provider
interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<User | null>;
  register: (user: Partial<User>, password: string) => Promise<User | null>;
  logout: () => void;
  checkAuth: () => Promise<User | null>;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

// Mock users for demo
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password',
    name: 'Super Admin',
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'company@example.com',
    password: 'password',
    name: 'Company Admin',
    role: 'company',
    companyId: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'driver@example.com',
    password: 'password',
    name: 'John Driver',
    role: 'driver',
    companyId: '1',
    nationality: 'USA',
    identificationNumber: 'D123456',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  login: async (email, password) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching credentials
      const user = mockUsers.find(
        u => u.email === email && u.password === password
      );
      
      if (user) {
        // Omit password before storing in state
        const { password: _, ...userWithoutPassword } = user;
        
        // Save to localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        // Update state
        set({
          user: userWithoutPassword,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return userWithoutPassword;
      }
      
      set({ isLoading: false });
      return null;
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      return null;
    }
  },

  register: async (userData, password) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (mockUsers.some(u => u.email === userData.email)) {
        set({ isLoading: false });
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const newUser: User & { password: string } = {
        id: `${mockUsers.length + 1}`,
        email: userData.email!,
        name: userData.name!,
        role: userData.role as Role || 'driver',
        companyId: userData.companyId,
        nationality: userData.nationality,
        identificationNumber: userData.identificationNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        password,
      };
      
      // Add to mock users
      mockUsers.push(newUser);
      
      // Omit password before storing in state
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Update state
      set({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Registration error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    // Remove from localStorage
    localStorage.removeItem('user');
    
    // Reset state
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      // Check localStorage for existing user
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        return user;
      }
      
      set({ isLoading: false });
      return null;
    } catch (error) {
      console.error('Auth check error:', error);
      set({ isLoading: false });
      return null;
    }
  },
}));