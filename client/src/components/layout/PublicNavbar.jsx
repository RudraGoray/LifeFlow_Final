import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Menu, X } from 'lucide-react';
import Button from '../ui/Button';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/find-camps', label: 'Find Camps' },
  { to: '/ngo-network', label: 'NGO Network' },
  { to: '/impact-stories', label: 'Impact Stories' },
];

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-border-gray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              <Droplet className="h-8 w-8 text-primary-crimson fill-primary-crimson" />
              <span className="text-xl font-bold text-charcoal tracking-tight">LifeFlow</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="text-muted-gray hover:text-charcoal px-3 py-2 rounded-md text-sm font-medium">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/camp-registration" className="text-sm font-medium text-primary-crimson hover:text-primary-crimson-dark hidden sm:block">
              Camp Registration
            </Link>
            <Link to="/login">
              <Button variant="primary" size="sm">Login Portal</Button>
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md text-muted-gray hover:bg-gray-100"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border-gray bg-white">
          <div className="px-4 py-3 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-3 rounded-md text-sm font-medium text-muted-gray hover:text-charcoal hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/camp-registration"
              onClick={() => setMenuOpen(false)}
              className="sm:hidden px-3 py-3 rounded-md text-sm font-medium text-primary-crimson hover:bg-red-50"
            >
              Camp Registration
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}