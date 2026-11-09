import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Calendar, Utensils, Star, Clock, MapPin, 
  ChevronRight, Award, ShieldCheck, Flame, Compass, ArrowRight 
} from 'lucide-react';
import { menuService, settingsService } from '../services/api';

export const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categories, restaurantSettings] = await Promise.all([
          menuService.getCategories(),
          settingsService.getSettings()
        ]);
        setSettings(restaurantSettings);

        // Gather all chef's specials or featured items across categories
        const featured = [];
        categories.forEach(cat => {
          (cat.items || []).forEach(item => {
            if (item.is_chef_special || featured.length < 4) {
              featured.push({ ...item, categoryName: cat.name });
            }
          });
        });
        setFeaturedItems(featured.slice(0, 4));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24 overflow-hidden">
        {/* Background image with luxury overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform animate-fade-in"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=85')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/75 to-obsidian-950/60"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0,transparent_70%)]"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10">
          {/* Announcement Banner */}
          {settings?.announcement_banner && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-300 text-xs tracking-wider uppercase backdrop-blur-md animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>{settings.announcement_banner}</span>
            </div>
          )}

          <div className="space-y-4">
            <span className="text-gold-400 font-serif tracking-[0.3em] uppercase text-xs sm:text-sm font-semibold block">
              Downtown Dubai • Burj Khalifa Vistas
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-slate-100 tracking-wide uppercase leading-tight">
              {settings?.restaurant_name || "Layali Dubai"}
            </h1>
            <p className="text-gold-gradient font-serif text-lg sm:text-2xl font-semibold italic max-w-3xl mx-auto">
              "{settings?.tagline || "Haute Emirati & Mediterranean Culinary Symphony"}"
            </p>
          </div>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
            An extraordinary gastronomic haven where ancient Arabian spice trails converge with Michelin-honed innovation, perched directly in front of the Dubai Fountain.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/reserve"
              className="btn-gold text-sm font-bold uppercase tracking-wider py-4 px-8 w-full sm:w-auto shadow-gold-glow flex items-center justify-center gap-3"
            >
              <Calendar className="w-4 h-4" />
              Reserve Your Table
            </Link>
            <Link
              to="/menu"
              className="btn-outline-gold text-sm font-bold uppercase tracking-wider py-4 px-8 w-full sm:w-auto flex items-center justify-center gap-3 backdrop-blur-md"
            >
              <Utensils className="w-4 h-4" />
              Explore A La Carte Menu
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gold-400/20 max-w-4xl mx-auto text-left">
            <div className="space-y-1">
              <span className="text-gold-400 font-serif text-2xl font-bold">24K</span>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Gold Flake Wagyu</p>
            </div>
            <div className="space-y-1">
              <span className="text-gold-400 font-serif text-2xl font-bold">100%</span>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Halal Gourmet Cuts</p>
            </div>
            <div className="space-y-1">
              <span className="text-gold-400 font-serif text-2xl font-bold">VIP</span>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Burj Fountain Terrace</p>
            </div>
            <div className="space-y-1">
              <span className="text-gold-400 font-serif text-2xl font-bold">4.9 ★</span>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Guest Distinction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Delicacies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-gold-400 font-serif uppercase tracking-[0.25em] text-xs font-semibold">
            Culinary Highlights
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide uppercase">
            Signature Royal Creations
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Each masterwork is seasoned with rare spices and finished tableside for an unforgettable sensory spectacle.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-80 rounded-xl bg-obsidian-900 border border-gold-400/10 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <div
                key={item.id}
                className="glass-panel glass-panel-hover rounded-xl overflow-hidden flex flex-col group border border-gold-400/20"
              >
                <div className="relative h-48 overflow-hidden bg-obsidian-900">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent"></div>
                  
                  {item.is_chef_special && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-gold-400 text-obsidian-950 text-[10px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Chef's Special
                    </span>
                  )}
                  {item.is_vegetarian && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
                      Vegetarian
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] text-gold-400 font-serif uppercase tracking-wider block">
                      {item.categoryName}
                    </span>
                    <h3 className="font-serif text-base font-bold text-white group-hover:text-gold-300 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-gold-400 font-serif font-bold text-lg">
                      {item.price.toFixed(2)} <span className="text-xs text-gold-300/80">AED</span>
                    </span>
                    <Link
                      to="/reserve"
                      className="text-xs font-semibold text-slate-300 group-hover:text-gold-300 flex items-center gap-1 transition-colors"
                    >
                      Reserve <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold-300 hover:text-gold-200 uppercase tracking-widest border-b border-gold-400/40 pb-1 hover:border-gold-300 transition-all"
          >
            Explore Complete 30+ Dish Menu <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* About The Experience Section */}
      <section className="relative overflow-hidden bg-obsidian-900/60 py-20 border-y border-gold-400/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-gold-400 font-serif uppercase tracking-[0.25em] text-xs font-semibold block">
                The Royal Legacy
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide uppercase leading-tight">
                Where Dubai’s Golden Era Meets Haute Cuisine
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Founded under the culinary direction of Executive Chef Tariq Al-Mansoor, Layali Dubai is an homage to Arabian hospitality. Overlooking the majestic Downtown skyline, each evening unveils bespoke tasting menus, binchotan-fired charcoal steaks, and artisanal non-alcoholic mixology infused with aged oud wood smoke.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="border-l-2 border-gold-400 pl-4 space-y-1">
                  <h4 className="font-serif font-bold text-white text-base">Terrace Panoramas</h4>
                  <p className="text-slate-400 text-xs">Unobstructed views of the Burj Khalifa and the Dubai Fountain shows.</p>
                </div>
                <div className="border-l-2 border-gold-400 pl-4 space-y-1">
                  <h4 className="font-serif font-bold text-white text-base">Royal Majlis VIP</h4>
                  <p className="text-slate-400 text-xs">Private air-conditioned dining salons for dignitaries and private parties.</p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/reserve"
                  className="btn-gold text-xs font-bold uppercase tracking-wider py-3.5 px-7"
                >
                  Reserve an Intimate Table
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80"
                  alt="Restaurant interior"
                  className="rounded-xl shadow-2xl object-cover h-64 w-full border border-gold-400/20"
                />
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80"
                  alt="Atmosphere"
                  className="rounded-xl shadow-2xl object-cover h-44 w-full border border-gold-400/20"
                />
              </div>
              <div className="space-y-4 pt-6">
                <img
                  src="https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=700&q=80"
                  alt="Wagyu beef"
                  className="rounded-xl shadow-2xl object-cover h-44 w-full border border-gold-400/20"
                />
                <img
                  src="https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=700&q=80"
                  alt="Golden Kunafa"
                  className="rounded-xl shadow-2xl object-cover h-64 w-full border border-gold-400/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-gold-400 font-serif uppercase tracking-[0.25em] text-xs font-semibold">
            Guest Distinction
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide uppercase">
            Testimonials & Accolades
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "The 24K Gold Wagyu Ribeye and the Burj View terrace at sunset was arguably the most breathtaking dining experience my family has enjoyed in Dubai.",
              author: "H.E. Tariq Al-Suwaidi",
              title: "Downtown Dubai Resident",
              stars: 5
            },
            {
              quote: "Outstanding authenticity! The lamb ouzi and black truffle hummus were rich with heritage yet refined to Michelin elegance. Service is impeccable.",
              author: "Lady Eleanor Vance",
              title: "International Food Critic",
              stars: 5
            },
            {
              quote: "We hosted our corporate anniversary in the Royal Majlis VIP suite. The table reservation workflow and real-time confirmation was flawless.",
              author: "Kareem Al-Husseini",
              title: "Managing Director, Gulf Capital",
              stars: 5
            }
          ].map((testi, i) => (
            <div
              key={i}
              className="glass-panel p-6 rounded-xl border border-gold-400/20 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-gold-400">
                  {[...Array(testi.stars)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-gold-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed">
                  "{testi.quote}"
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="font-serif text-white font-bold text-sm">{testi.author}</h4>
                <p className="text-xs text-gold-400/80">{testi.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Location & Hours Quick Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-8 sm:p-12 border border-gold-400/30 bg-gradient-to-r from-obsidian-900/90 to-obsidian-850/90 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="space-y-3 lg:col-span-2">
              <span className="text-gold-400 font-serif uppercase tracking-[0.2em] text-xs font-semibold">
                An Unforgettable Evening Awaits
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white uppercase">
                Plan Your Royal Dubai Dining Experience
              </h3>
              <p className="text-slate-300 text-sm max-w-xl">
                Open daily from 12:00 PM to 01:00 AM. Advance reservations are strongly recommended for the Burj View Terrace and Royal Majlis suites.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold-400" />
                  <span>Downtown Dubai Blvd</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold-400" />
                  <span>12:00 PM – 01:00 AM Daily</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                to="/reserve"
                className="btn-gold text-xs font-bold uppercase tracking-wider py-4 px-6 text-center shadow-gold-glow"
              >
                Book Table Now
              </Link>
              <Link
                to="/contact"
                className="btn-outline-gold text-xs font-bold uppercase tracking-wider py-3.5 px-6 text-center"
              >
                Inquire For Private Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
