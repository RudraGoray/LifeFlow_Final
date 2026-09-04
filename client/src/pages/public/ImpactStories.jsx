import React from 'react';
import Card from '../../components/ui/Card';

export default function ImpactStories() {
  const stories = [
    {
      quote: "The predictive alerts on LifeFlow warned us about an impending shortage of AB- blood during the monsoon fever spike. We ran targeted drives three weeks in advance. Not a single patient had to wait.",
      author: "Dr. A. Rahman",
      role: "Head of Hematology, AIIMS Delhi",
      color: "bg-blue-50 border-blue-200 text-blue-900"
    },
    {
      quote: "Before this platform, our volunteers would make dozens of phone calls just to find one pint of rare blood. Now, we just look at the real-time availability map and dispatch instantly.",
      author: "Meera Reddy",
      role: "Operations Manager, BloodConnect",
      color: "bg-pink-50 border-pink-200 text-pink-900"
    },
    {
      quote: "My daughter needed emergency surgery, and our hospital's blood bank was out of O-. A LifeFlow alert instantly matched our demand ticket with a nearby NGO drive that had just collected 15 units. It literally saved her life.",
      author: "Rakesh Sharma",
      role: "Patient's Father, Mumbai",
      color: "bg-green-50 border-green-200 text-green-900"
    },
    {
      quote: "The platform's analytics helped us realize we had a surplus of A+ in North Bangalore while South Bangalore was in deficit. We completely reorganized our transport logistics based on this data.",
      author: "Suresh Nair",
      role: "Director, Karnataka Regional Blood Centre",
      color: "bg-purple-50 border-purple-200 text-purple-900"
    }
  ];

  return (
    <div className="min-h-screen bg-off-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-charcoal mb-4">Stories of Impact</h1>
          <p className="text-lg text-muted-gray max-w-2xl mx-auto">
            Beyond the code and the logistics, LifeFlow is about human lives. Read how efficient supply chain matching makes the ultimate difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stories.map((story, i) => (
            <Card key={i} className={`border p-8 ${story.color} bg-opacity-30`}>
              <div className="text-5xl font-serif text-charcoal opacity-20 mb-[-20px]">"</div>
              <p className="text-lg italic mb-6 relative z-10 leading-relaxed font-medium">
                {story.quote}
              </p>
              <div className="flex items-center gap-4 border-t border-black/10 pt-4">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center font-bold shadow-sm">
                  {story.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-bold">{story.author}</div>
                  <div className="text-sm opacity-80">{story.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
