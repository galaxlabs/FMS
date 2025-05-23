import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../ui/Card';
import { User, Lock } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      
      if (user) {
        // Redirect based on role
        if (user.role === 'driver') {
          navigate('/driver/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample login credentials for demo
  const sampleLogins = [
    { role: 'Super Admin', email: 'admin@example.com', password: 'password' },
    { role: 'Company Admin', email: 'company@example.com', password: 'password' },
    { role: 'Driver', email: 'driver@example.com', password: 'password' },
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
          Enter your credentials below to access the system
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            fullWidth
            required
            leftIcon={<User size={18} className="text-gray-400" />}
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            fullWidth
            required
            leftIcon={<Lock size={18} className="text-gray-400" />}
          />
          
          {error && (
            <div className="bg-danger-50 text-danger-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex-col space-y-4">
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
          >
            Sign in
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="/register" className="text-primary-600 hover:text-primary-700">
              Register
            </a>
          </div>
        </CardFooter>
      </form>
      
      {/* Demo credentials */}
      <div className="px-6 pb-6">
        <div className="border-t border-gray-200 mt-2 pt-4">
          <p className="text-sm text-gray-500 mb-2">Demo Accounts (Click to autofill):</p>
          <div className="space-y-2">
            {sampleLogins.map((login, index) => (
              <button
                key={index}
                onClick={() => {
                  setEmail(login.email);
                  setPassword(login.password);
                }}
                className="text-left w-full px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <span className="font-medium">{login.role}</span>: {login.email} / {login.password}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};