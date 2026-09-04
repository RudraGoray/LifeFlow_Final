import React from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Heart, Globe, Shield } from 'lucide-react';

export default function NGONetwork() {
  const ngos = [
    { name: "Red Cross Society India", region: "National", tier: "Platinum Partner", focus: "Disaster Relief & Regular Supply" },
    { name: "BloodConnect Foundation", region: "Karnataka / Delhi", tier: "Gold Partner", focus: "Youth & University Drives" },
    { name: "Sankalp India Foundation", region: "West Bengal", tier: "Gold Partner", focus: "Thalassemia Support" },
    { name: "Lions Club Blood Services", region: "Maharashtra", tier: "Silver Partner", focus: "Community Outreach" },
    { name: "Rotary Blood Bank", region: "Tamil Nadu", tier: "Silver Partner", focus: "Corporate Drives" }
  ];

  return (
    <div className="min-h-screen bg-off-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-charcoal mb-4">Our NGO Partner Network</h1>
          <p className="text-lg text-muted-gray max-w-3xl mx-auto">
            LifeFlow operates in collaboration with verified non-profit organizations across the country. 
            Together, we form a decentralized but highly coordinated web of life-saving supply lines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center border-t-4 border-t-primary-crimson">
            <Heart className="h-10 w-10 text-primary-crimson mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">120+ Active NGOs</h3>
            <p className="text-muted-gray text-sm">Working seamlessly on our platform to coordinate camps and dispatch units.</p>
          </Card>
          <Card className="text-center border-t-4 border-t-success-green">
            <Globe className="h-10 w-10 text-success-green mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Pan-India Reach</h3>
            <p className="text-muted-gray text-sm">Our partners operate across 18 states and over 150 critical districts.</p>
          </Card>
          <Card className="text-center border-t-4 border-t-info-blue">
            <Shield className="h-10 w-10 text-info-blue mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Verified Partners</h3>
            <p className="text-muted-gray text-sm">Every NGO on LifeFlow undergoes a strict compliance and cold-chain audit.</p>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-charcoal mb-6">Featured Partners</h2>
        <div className="bg-white rounded-xl shadow-sm border border-border-gray overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-50 border-b border-border-gray">
                <th className="px-6 py-4 text-xs font-semibold text-muted-gray uppercase tracking-wider">Organization</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-gray uppercase tracking-wider">Region</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-gray uppercase tracking-wider">Focus Area</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-gray uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gray">
              {ngos.map((ngo, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-charcoal">{ngo.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-gray">{ngo.region}</td>
                  <td className="px-6 py-4 text-sm text-muted-gray">{ngo.focus}</td>
                  <td className="px-6 py-4">
                    <Badge variant={ngo.tier.includes('Platinum') ? 'success' : ngo.tier.includes('Gold') ? 'warning' : 'default'}>
                      {ngo.tier}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
