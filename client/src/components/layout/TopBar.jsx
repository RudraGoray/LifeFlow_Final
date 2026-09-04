import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../ui/Badge';
import { Bell, Search, Menu } from 'lucide-react';

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="h-16 bg-white border-b border-border-gray flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md text-muted-gray hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center">
          <Badge variant={user.role === 'HOSPITAL' ? 'danger' : user.role === 'NGO' ? 'info' : 'success'}>
            {user.orgName || user.role}
          </Badge>
          <span className="ml-3 text-sm font-medium text-muted-gray">
            {user.cityDistrict}, {user.state}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-1.5 bg-gray-50 border border-border-gray rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-crimson focus:bg-white transition-all w-64"
          />
        </div>
        
        <button className="relative p-2 text-muted-gray hover:text-charcoal hover:bg-gray-50 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-crimson ring-2 ring-white"></span>
        </button>
        
        <div className="flex items-center gap-2 ml-2">
          <div className="h-8 w-8 rounded-full bg-primary-crimson text-white flex items-center justify-center font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden lg:block">
            <div className="text-sm font-semibold text-charcoal leading-tight">{user.name}</div>
            <div className="text-xs text-muted-gray leading-tight capitalize">{user.role.toLowerCase()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
