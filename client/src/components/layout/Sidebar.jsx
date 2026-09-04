import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Droplet, LayoutDashboard, BarChart3, Ticket, Users, Settings, LogOut, Activity } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const role = user.role.toLowerCase();
  
  const getNavItems = () => {
    const commonItems = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Settings', path: '/settings', icon: Settings },
    ];

    if (role === 'hospital') {
      return [
        commonItems[0],
        { name: 'Demand Tickets', path: '/hospital/demand-tickets', icon: Ticket },
        { name: 'Blood Availability', path: '/hospital/blood-availability', icon: Droplet },
        { name: 'Analytics', path: '/statistics/overview', icon: BarChart3 },
        commonItems[1]
      ];
    }
    
    if (role === 'ngo') {
      return [
        commonItems[0],
        { name: 'Donation Batches', path: '/ngo/donation-batches', icon: Ticket },
        { name: 'Volunteers', path: '/ngo/volunteers', icon: Users },
        { name: 'Regional Demand', path: '/statistics/regional', icon: Activity },
        commonItems[1]
      ];
    }
    
    if (role === 'bloodbank') {
      return [
        commonItems[0],
        { name: 'Ticket Management', path: '/bloodbank/tickets', icon: Ticket },
        { name: 'Inventory', path: '/bloodbank/inventory', icon: Droplet },
        { name: 'Analytics', path: '/statistics/overview', icon: BarChart3 },
        commonItems[1]
      ];
    }
    
    return commonItems;
  };

  const navItems = getNavItems();

  const alertConfig = {
    hospital: { type: 'hospital', title: 'System Alert Mode', text: 'Hospital critical operations active' },
    ngo: { type: 'ngo', title: 'NGO Workspace Active', text: 'Managing regional drives' },
    bloodbank: { type: 'bloodbank', title: 'Regional Blood Bank', text: 'Inventory operations' },
  };
  const alertInfo = alertConfig[role] || { type: 'default', title: 'System Active', text: 'Standard operations' };

  return (
    <div className="flex flex-col h-full bg-charcoal text-white w-64 flex-shrink-0">
      <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-800">
        <Droplet className="h-6 w-6 text-primary-crimson fill-primary-crimson" />
        <span className="text-xl font-bold tracking-tight">LifeFlow</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-crimson/10 text-primary-crimson border-l-4 border-primary-crimson'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>

      <div className="p-4">
        <div className={`p-4 rounded-lg border text-sm font-medium ${
            alertInfo.type === 'hospital' ? 'bg-red-900/30 text-red-200 border-red-800' :
            alertInfo.type === 'ngo' ? 'bg-pink-900/30 text-pink-200 border-pink-800' :
            alertInfo.type === 'bloodbank' ? 'bg-blue-900/30 text-blue-200 border-blue-800' :
            'bg-gray-800 text-gray-300 border-gray-700'
          }`}>
          <div className="font-bold mb-1">{alertInfo.title}</div>
          <div className="text-xs opacity-80">{alertInfo.text}</div>
        </div>
      </div>
    </div>
  );
}
