import React from 'react';
import { Droplet } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border-gray py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="h-6 w-6 text-primary-crimson fill-primary-crimson" />
              <span className="text-lg font-bold text-charcoal tracking-tight">LifeFlow</span>
            </div>
            <p className="text-sm text-muted-gray">
              Connecting blood donors, NGOs, hospitals, and blood banks through real-time demand & supply matching.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-4">Partners</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-gray hover:text-charcoal cursor-pointer">Red Cross Global</span></li>
              <li><span className="text-sm text-muted-gray hover:text-charcoal cursor-pointer">St. Jude Hospital</span></li>
              <li><span className="text-sm text-muted-gray hover:text-charcoal cursor-pointer">Apollo Emergency</span></li>
              <li><span className="text-sm text-muted-gray hover:text-charcoal cursor-pointer">BloodConnect</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-4">Legal & Support</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-gray hover:text-charcoal cursor-pointer">Privacy Policy</span></li>
              <li><span className="text-sm text-muted-gray hover:text-charcoal cursor-pointer">Terms of Service</span></li>
              <li><span className="text-sm text-muted-gray hover:text-charcoal cursor-pointer">System Status</span></li>
              <li><span className="text-sm text-muted-gray hover:text-charcoal cursor-pointer">Help Center</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-sm text-muted-gray hover:text-charcoal">Login Portal</Link></li>
              <li><Link to="/register-donor" className="text-sm text-muted-gray hover:text-charcoal">Register as Donor</Link></li>
              <li><Link to="/statistics/overview" className="text-sm text-muted-gray hover:text-charcoal">Live Statistics</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border-gray flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-gray">
            &copy; {new Date().getFullYear()} LifeFlow Platform. All rights reserved.
          </p>
          <p className="text-sm text-muted-gray mt-4 sm:mt-0">
            Built by <span className="font-semibold text-charcoal">Team CRUDE-MAX</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
