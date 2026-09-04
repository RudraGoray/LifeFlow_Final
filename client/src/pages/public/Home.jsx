import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Heart } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import api from '../../utils/api';

export default function Home() {
  const [stats, setStats] = useState({ totalUnitsDonated: 0, livesSaved: 0, activeDonors: 0 });
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, campsRes] = await Promise.all([
          api.get('/stats/summary'),
          api.get('/camps/upcoming')
        ]);
        setStats(statsRes.data);
        setCamps(campsRes.data);
      } catch (err) {
        console.error('Failed to fetch home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-border-gray overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left flex flex-col justify-center">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-primary-crimson bg-red-50 mb-6 w-fit">
                Every donation saves three lives
              </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-charcoal sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block xl:inline">Empowering the chain of</span>{' '}
                <span className="block text-primary-crimson xl:inline">demand & donation</span>
              </h1>
              <p className="mt-3 text-base text-muted-gray sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                LifeFlow connects blood donors, NGOs, hospitals, and blood banks through real-time matching and predictive analytics to ensure blood is available when it matters most.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4">
                <Link to="/register-donor">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">Register as Donor</Button>
                </Link>
                <Link to="/find-camps">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto group">
                    View Live Demand Map
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-2xl shadow-xl lg:max-w-md overflow-hidden aspect-video lg:aspect-square bg-gray-100 flex items-center justify-center">
                 {/* Placeholder for Hero Image */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-primary-crimson/20 to-transparent mix-blend-multiply" />
                 <Heart className="h-32 w-32 text-primary-crimson opacity-50 animate-pulse" />
                 <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur rounded-xl p-4 shadow-sm border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-success-green/20 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-success-green" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-muted-gray uppercase">Live Match</div>
                        <div className="text-sm font-medium text-charcoal">Apollo Hospital matched with BloodConnect NGO</div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-primary-crimson text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-primary-crimson-dark">
            <div className="py-4 md:py-0">
              <div className="text-4xl font-extrabold mb-2">{loading ? '...' : stats.totalUnitsDonated.toLocaleString()}</div>
              <div className="text-red-100 font-medium uppercase tracking-wider text-sm">Total Units Donated</div>
            </div>
            <div className="py-4 md:py-0">
              <div className="text-4xl font-extrabold mb-2">{loading ? '...' : stats.livesSaved.toLocaleString()}</div>
              <div className="text-red-100 font-medium uppercase tracking-wider text-sm">Lives Positively Saved</div>
            </div>
            <div className="py-4 md:py-0">
              <div className="text-4xl font-extrabold mb-2">{loading ? '...' : stats.activeDonors.toLocaleString()}</div>
              <div className="text-red-100 font-medium uppercase tracking-wider text-sm">Active Regular Donors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Donation Drives */}
      <section className="py-20 bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-charcoal">Upcoming Donation Drives</h2>
              <p className="mt-2 text-muted-gray">Find a blood camp near you and make a difference.</p>
            </div>
            <Link to="/find-camps" className="hidden sm:block">
              <Button variant="secondary">View Calendar</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse h-48 bg-gray-100" />
              ))
            ) : camps.slice(0, 3).map((camp) => (
              <Card key={camp.id} className="flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-red-50 text-primary-crimson rounded-lg px-3 py-2 text-center border border-red-100">
                    <div className="text-sm font-bold">{new Date(camp.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="text-xl font-extrabold">{new Date(camp.date).getDate()}</div>
                  </div>
                  <Badge variant="info" className="capitalize">{camp.tagType || 'General'}</Badge>
                </div>
                <h3 className="text-lg font-bold text-charcoal mb-1">{camp.name}</h3>
                <p className="text-sm text-muted-gray mb-4 flex-grow">{camp.venue} • {camp.cityDistrict}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-gray">
                  <div className="text-xs font-medium text-muted-gray">
                    {camp.startTime} - {camp.endTime}
                  </div>
                  <span className="text-sm font-bold text-primary-crimson hover:text-primary-crimson-dark cursor-pointer">
                    Register Slot →
                  </span>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/find-camps">
              <Button variant="secondary" className="w-full">View Calendar</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white border-t border-border-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-10 lg:mb-0">
              <h2 className="text-3xl font-bold text-charcoal mb-4">Real Life Impact</h2>
              <p className="text-lg text-muted-gray mb-6">
                See how our network of donors and organizations are saving lives across the country, one drop at a time.
              </p>
              <Link to="/impact-stories">
                <Button variant="secondary">Read More Stories</Button>
              </Link>
            </div>
            
            <div className="grid gap-6">
              <Card className="bg-gray-50 border-none relative">
                <div className="text-4xl text-gray-300 absolute top-4 right-4">"</div>
                <p className="text-charcoal italic mb-4 relative z-10">
                  "During the dengue outbreak, our hospital faced critical shortages. The LifeFlow predictive model and NGO network helped us secure O- blood within hours."
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">DS</div>
                  <div>
                    <div className="text-sm font-bold text-charcoal">Dr. Shalini</div>
                    <div className="text-xs text-muted-gray">Emergency Ward, Apollo Hospital</div>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-gray-50 border-none relative ml-0 lg:ml-8">
                <div className="text-4xl text-gray-300 absolute top-4 right-4">"</div>
                <p className="text-charcoal italic mb-4 relative z-10">
                  "Organizing donation drives used to be a logistical nightmare. Now we track everything from donor turnouts to dispatch status in one clean dashboard."
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold">VP</div>
                  <div>
                    <div className="text-sm font-bold text-charcoal">Vikram Patel</div>
                    <div className="text-xs text-muted-gray">Coordinator, Red Cross NGO</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
