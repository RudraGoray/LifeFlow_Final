import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { MapPin, Phone } from 'lucide-react';

export default function BloodAvailability() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodType, setBloodType] = useState('O_POS');

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/bloodbanks?type=${bloodType}`);
        setBanks(response.data);
      } catch (err) {
        console.error('Failed to fetch blood availability', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [bloodType]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Regional Blood Availability</h1>
        <p className="text-muted-gray text-sm">Check real-time inventory levels across nearby blood banks.</p>
      </div>

      <Card className="bg-gray-50">
        <div className="max-w-xs">
          <Select 
            label="Filter by Blood Type" 
            id="bloodType" 
            value={bloodType} 
            onChange={(e) => setBloodType(e.target.value)} 
            options={[
              { value: 'A_POS', label: 'A+' }, { value: 'A_NEG', label: 'A-' },
              { value: 'B_POS', label: 'B+' }, { value: 'B_NEG', label: 'B-' },
              { value: 'AB_POS', label: 'AB+' }, { value: 'AB_NEG', label: 'AB-' },
              { value: 'O_POS', label: 'O+' }, { value: 'O_NEG', label: 'O-' }
            ]}
          />
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <Card key={i} className="h-40 animate-pulse bg-gray-100" />)}
        </div>
      ) : banks.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-gray">No blood banks found with the selected filters.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banks.map(bank => (
            <Card key={bank.bloodBankId} className="flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-charcoal">{bank.name}</h3>
                <Badge variant={
                  bank.inventory.some(i => i.statusLevel === 'CRITICAL') ? 'danger' :
                  bank.inventory.some(i => i.statusLevel === 'LOW') ? 'warning' : 'success'
                }>
                  {bank.inventory.length === 0 ? 'Unknown' : 'Active Stock'}
                </Badge>
              </div>
              <div className="text-sm text-muted-gray flex flex-col gap-1 mb-4">
                <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {bank.address}, {bank.cityDistrict}</span>
                <span className="flex items-center"><Phone className="h-3 w-3 mr-1" /> {bank.contactNumber}</span>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border-gray">
                <h4 className="text-xs font-semibold text-charcoal uppercase mb-2">Target Inventory: {bloodType.replace('_POS','+').replace('_NEG','-')}</h4>
                {bank.inventory.length === 0 ? (
                  <p className="text-sm text-muted-gray italic">No records for this type.</p>
                ) : (
                  <div className="flex gap-2">
                    {bank.inventory.map((inv, idx) => (
                      <div key={idx} className={`px-3 py-1.5 rounded-lg border flex flex-col items-center min-w-[60px] ${
                        inv.statusLevel === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-800' :
                        inv.statusLevel === 'LOW' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                        'bg-green-50 border-green-200 text-green-800'
                      }`}>
                        <span className="text-lg font-bold">{inv.units}</span>
                        <span className="text-[10px] uppercase font-semibold">{inv.statusLevel}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
