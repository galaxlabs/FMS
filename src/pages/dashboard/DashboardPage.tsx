import React from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, Truck, FileText, Map } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useVehicleStore } from '../../store/vehicleStore';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { vehicles, fetchVehicles } = useVehicleStore();

  React.useEffect(() => {
    fetchVehicles(user?.companyId);
  }, [fetchVehicles, user?.companyId]);

  // Stat cards for demo
  const stats = [
    {
      title: 'Total Drivers',
      value: '12',
      change: '+2',
      changeType: 'increase',
      icon: <Users size={24} className="text-primary-600" />,
    },
    {
      title: 'Active Vehicles',
      value: vehicles.filter(v => v.status === 'active').length.toString(),
      change: '0',
      changeType: 'neutral',
      icon: <Truck size={24} className="text-secondary-600" />,
    },
    {
      title: 'Reports Generated',
      value: '156',
      change: '+24',
      changeType: 'increase',
      icon: <FileText size={24} className="text-accent-600" />,
    },
    {
      title: 'Active Routes',
      value: '8',
      change: '+1',
      changeType: 'increase',
      icon: <Map size={24} className="text-success-600" />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.name}! Here's what's happening today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                  <div className="p-2 rounded-full bg-gray-50">{stat.icon}</div>
                </div>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <span className={`ml-2 text-sm ${
                    stat.changeType === 'increase' 
                      ? 'text-success-600' 
                      : stat.changeType === 'decrease' 
                        ? 'text-danger-600' 
                        : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent activity and charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reports */}
          <Card className="lg:col-span-2 animate-slide-up">
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium">Passenger Transport Report #{item}</p>
                      <p className="text-xs text-gray-500">Generated {item} hour{item !== 1 ? 's' : ''} ago</p>
                    </div>
                    <div className="text-xs font-medium text-primary-600">View</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Status */}
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle>Vehicle Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Active</span>
                  <span className="text-sm font-medium">{vehicles.filter(v => v.status === 'active').length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-success-500 h-2.5 rounded-full" style={{ 
                    width: `${(vehicles.filter(v => v.status === 'active').length / Math.max(vehicles.length, 1)) * 100}%` 
                  }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Maintenance</span>
                  <span className="text-sm font-medium">{vehicles.filter(v => v.status === 'maintenance').length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-warning-500 h-2.5 rounded-full" style={{ 
                    width: `${(vehicles.filter(v => v.status === 'maintenance').length / Math.max(vehicles.length, 1)) * 100}%` 
                  }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Inactive</span>
                  <span className="text-sm font-medium">{vehicles.filter(v => v.status === 'inactive').length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-danger-500 h-2.5 rounded-full" style={{ 
                    width: `${(vehicles.filter(v => v.status === 'inactive').length / Math.max(vehicles.length, 1)) * 100}%` 
                  }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;