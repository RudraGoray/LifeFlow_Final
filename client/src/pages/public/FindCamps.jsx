import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function FindCamps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const response = await api.get('/camps/upcoming');
        setCamps(response.data);
      } catch (err) {
        console.error('Failed to fetch camps', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCamps();
  }, []);

  const filteredCamps = camps.filter(camp => {
    const matchesSearch = camp.name.toLowerCase().includes(search.toLowerCase()) || 
                          camp.venue.toLowerCase().includes(search.toLowerCase());
    const matchesState = stateFilter ? camp.state === stateFilter : true;
    return matchesSearch && matchesState;
  });

  return (
    <div className="min-h-screen bg-off-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-charcoal mb-4">Find a Donation Camp</h1>
          <p className="text-lg text-muted-gray max-w-2xl mx-auto">
            Discover upcoming blood donation drives in your area. Every drop counts.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative col-span-1 md:col-span-2">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by camp name or venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-crimson"
              />
            </div>
            
            <select 
              value={stateFilter} 
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-crimson text-charcoal"
            >
              <option value="">All Regions</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="West Bengal">West Bengal</option>
            </select>

            <select 
              value={bloodType} 
              onChange={(e) => setBloodType(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-crimson text-charcoal"
            >
              <option value="">Any Blood Type Needed</option>
              <option value="O-">O Negative (Universal)</option>
              <option value="A-">A Negative</option>
              <option value="B-">B Negative</option>
            </select>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[...Array(6)].map((_, i) => <Card key={i} className="animate-pulse h-64 bg-gray-100" />)}
          </div>
        ) : filteredCamps.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-border-gray">
            <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal">No camps found</h3>
            <p className="text-muted-gray mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCamps.map((camp) => (
              <Card key={camp.id} className="flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-red-50 text-primary-crimson rounded-lg px-3 py-2 text-center border border-red-100">
                    <div className="text-sm font-bold">{new Date(camp.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="text-xl font-extrabold">{new Date(camp.date).getDate()}</div>
                  </div>
                  <Badge variant="info" className="capitalize">{camp.tagType || 'General'}</Badge>
                </div>
                
                <h3 className="text-xl font-bold text-charcoal mb-2">{camp.name}</h3>
                
                <div className="space-y-2 mb-6 flex-grow">
                  <div className="flex items-start text-sm text-muted-gray">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{camp.venue}, {camp.cityDistrict}, {camp.state}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-gray">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{camp.startTime} - {camp.endTime}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border-gray flex justify-between items-center">
                  <span className="text-xs text-muted-gray">Org: {camp.organizer}</span>
                  <Button variant="secondary" size="sm">Register</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
