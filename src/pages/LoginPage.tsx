import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-secondary-800 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Transport Management System</h1>
        <p className="text-primary-100">Manage drivers, vehicles, and passenger data efficiently</p>
      </div>
      
      <LoginForm />
      
      <div className="mt-8 text-center text-primary-100 text-sm">
        <p>© 2025 Transport Management System. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LoginPage;