import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import { Filter } from 'lucide-react';

export default function StatisticsLayout() {
  const [bloodType, setBloodType] = useState('ALL');
  const [region, setRegion] = useState('ALL');
  const [timeRange, setTimeRange] = useState('12M');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Analytics & Forecasting</h1>
        <p className="text-muted-gray text-sm">Deep dive into supply trends, regional gaps, and AI predictions.</p>
      </div>

      <Card className="bg-white p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex items-center gap-2 text-muted-gray mr-4">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-bold uppercase tracking-wider">Global Filters:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
            <Select 
              id="bloodType" 
              value={bloodType} 
              onChange={(e) => setBloodType(e.target.value)} 
              options={[
                { value: 'ALL', label: 'All Blood Types' },
                { value: 'A_POS', label: 'A+' }, { value: 'A_NEG', label: 'A-' },
                { value: 'B_POS', label: 'B+' }, { value: 'B_NEG', label: 'B-' },
                { value: 'O_POS', label: 'O+' }, { value: 'O_NEG', label: 'O-' },
                { value: 'AB_POS', label: 'AB+' }, { value: 'AB_NEG', label: 'AB-' }
              ]}
            />
            <Select 
              id="region" 
              value={region} 
              onChange={(e) => setRegion(e.target.value)} 
              options={[
                { value: 'ALL', label: 'Pan-India' },
                { value: 'Delhi', label: 'Delhi NCR' },
                { value: 'Maharashtra', label: 'Maharashtra' },
                { value: 'Karnataka', label: 'Karnataka' },
                { value: 'Tamil Nadu', label: 'Tamil Nadu' },
                { value: 'West Bengal', label: 'West Bengal' }
              ]}
            />
            <Select 
              id="timeRange" 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)} 
              options={[
                { value: '3M', label: 'Last 3 Months' },
                { value: '6M', label: 'Last 6 Months' },
                { value: '12M', label: 'Last 12 Months' }
              ]}
            />
          </div>
        </div>
      </Card>

      <div className="border-b border-border-gray overflow-x-auto">
        <nav className="flex whitespace-nowrap space-x-8">
          <NavLink
            to="/statistics/overview"
            className={({ isActive }) =>
              `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                isActive ? 'border-primary-crimson text-primary-crimson' : 'border-transparent text-muted-gray hover:text-charcoal hover:border-gray-300'
              }`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/statistics/forecast"
            className={({ isActive }) =>
              `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                isActive ? 'border-primary-crimson text-primary-crimson' : 'border-transparent text-muted-gray hover:text-charcoal hover:border-gray-300'
              }`
            }
          >
            AI Forecast
          </NavLink>
          <NavLink
            to="/statistics/gap-analysis"
            className={({ isActive }) =>
              `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                isActive ? 'border-primary-crimson text-primary-crimson' : 'border-transparent text-muted-gray hover:text-charcoal hover:border-gray-300'
              }`
            }
          >
            Gap Analysis
          </NavLink>
          <NavLink
            to="/statistics/regional"
            className={({ isActive }) =>
              `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                isActive ? 'border-primary-crimson text-primary-crimson' : 'border-transparent text-muted-gray hover:text-charcoal hover:border-gray-300'
              }`
            }
          >
            Regional Breakdown
          </NavLink>
        </nav>
      </div>

      <div className="mt-6">
        <Outlet context={{ bloodType, region, timeRange }} />
      </div>
    </div>
  );
}
