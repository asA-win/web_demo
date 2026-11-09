import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Sparkles, Leaf, Flame, Clock, Filter, Utensils, 
  RefreshCw, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { menuService } from '../services/api';
import { useWebSocket } from '../context/WebSocketContext';
import { useToast } from '../components/Toast';

export const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // all, veg, chef
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { subscribe } = useWebSocket();
  const { addToast } = useToast();

  const fetchMenu = async (showNotice = false) => {
    try {
      setIsLoading(true);
      const data = await menuService.getCategories();
      setCategories(data);
      setError(null);
      if (showNotice) {
        addToast('The menu was updated in real-time by the restaurant.', 'info', 'Menu Live Updated');
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
      setError('Unable to load menu. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();

    // Subscribe to WebSocket real-time menu updates!
    const unsubscribe = subscribe('MENU_UPDATED', (payload) => {
      console.log('Real-time MENU_UPDATED event received:', payload);
      fetchMenu(true);
    });

    return () => unsubscribe();
  }, []);

  // Filtered Items logic
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => selectedCategory === 'all' || cat.id.toString() === selectedCategory.toString())
      .map((cat) => {
        const filteredItems = (cat.items || []).filter((item) => {
          // Dietary filter
          if (dietaryFilter === 'veg' && !item.is_vegetarian) return false;
          if (dietaryFilter === 'chef' && !item.is_chef_special) return false;

          // Search query
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchesName = item.name.toLowerCase().includes(q);
            const matchesDesc = item.description.toLowerCase().includes(q);
            const matchesAllergens = (item.allergens || '').toLowerCase().includes(q);
            return matchesName || matchesDesc || matchesAllergens;
          }
          return true;
        });

        return { ...cat, items: filteredItems };
      })
      .filter((cat) => cat.items.length > 0);
  }, [categories, selectedCategory, searchQuery, dietaryFilter]);

  const totalFilteredCount = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-gold-400 font-serif uppercase tracking-[0.3em] text-xs font-semibold block">
          Haute Gastronomy • Prices in AED
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-wide uppercase">
          The Royal Menu
        </h1>
        <p className="text-slate-300 text-sm font-light leading-relaxed">
          Savor an opulent collection of charcoal-seared meats, heritage Emirati stews, and delicate Mediterranean mezze prepared by master chefs using the finest global ingredients.
        </p>
      </div>

      {/* Search & Dietary Filters Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-gold-400/20 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, ingredients, or allergens..."
              className="w-full pl-10 pr-4 py-2.5 bg-obsidian-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-gold-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dietary Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                dietaryFilter === 'all'
                  ? 'bg-gold-400 text-obsidian-950 shadow-gold-glow'
                  : 'bg-obsidian-900 border border-slate-700 text-slate-300 hover:border-gold-400/40'
              }`}
            >
              All Dishes
            </button>
            <button
              onClick={() => setDietaryFilter('veg')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-obsidian-900 border border-slate-700 text-slate-300 hover:border-emerald-500/40'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              Vegetarian Only
            </button>
            <button
              onClick={() => setDietaryFilter('chef')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                dietaryFilter === 'chef'
                  ? 'bg-amber-500 text-obsidian-950 shadow-lg'
                  : 'bg-obsidian-900 border border-slate-700 text-slate-300 hover:border-amber-500/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Chef's Specials
            </button>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-gold-400/20 text-gold-300 border border-gold-400/50'
                : 'text-slate-400 hover:text-white hover:bg-obsidian-850'
            }`}
          >
            All Categories ({categories.reduce((a, c) => a + (c.items?.length || 0), 0)})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id.toString())}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id.toString()
                  ? 'bg-gold-400/20 text-gold-300 border border-gold-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-obsidian-850'
              }`}
            >
              {cat.name} ({cat.items?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gold-300 font-serif tracking-widest text-sm uppercase">Curating Royal Dishes...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-rose-200 text-sm">{error}</p>
          <button
            onClick={() => fetchMenu()}
            className="px-4 py-2 rounded-lg bg-rose-900/50 text-rose-200 text-xs font-semibold hover:bg-rose-900"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty Filter State */}
      {!isLoading && !error && filteredCategories.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <Utensils className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-white">No Dishes Match Your Selection</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Try adjusting your search query or dietary filters to view our culinary collection.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setDietaryFilter('all');
              setSelectedCategory('all');
            }}
            className="btn-outline-gold text-xs font-semibold py-2.5 px-6 uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Menu Categories & Items List */}
      {!isLoading && !error && filteredCategories.map((category) => (
        <section key={category.id} className="space-y-6">
          {/* Category Banner */}
          <div className="border-b border-gold-400/20 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-serif font-bold text-gold-300 tracking-wide uppercase">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-slate-400 text-xs mt-1 max-w-2xl font-light">
                  {category.description}
                </p>
              )}
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {category.items.length} {category.items.length === 1 ? 'Dish' : 'Dishes'}
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.items.map((item) => (
              <div
                key={item.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group border border-gold-400/15"
              >
                {/* Food Image */}
                <div className="relative h-52 bg-obsidian-900 overflow-hidden">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {item.is_chef_special && (
                      <span className="px-2.5 py-1 rounded-md bg-gold-400 text-obsidian-950 text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Chef's Signature
                      </span>
                    )}
                    {item.is_vegetarian && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                        <Leaf className="w-3 h-3" /> Vegetarian
                      </span>
                    )}
                    {item.is_gluten_free && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-950/90 border border-sky-500/50 text-sky-300 text-[10px] font-semibold">
                        GF
                      </span>
                    )}
                  </div>

                  {/* Price Tag in Image */}
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-obsidian-950/90 border border-gold-400/40 backdrop-blur-md">
                    <span className="font-serif text-gold-300 font-bold text-base">
                      {item.price.toFixed(2)} <span className="text-xs text-gold-400">AED</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-gold-300 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>

                  {/* Allergens & Prep metadata */}
                  <div className="space-y-2 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    {item.allergens && (
                      <p className="text-slate-400">
                        <span className="text-slate-500">Allergens:</span> {item.allergens}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-slate-500">
                      {item.preparation_time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gold-400/70" />
                          ~{item.preparation_time_minutes} mins
                        </span>
                      )}
                      {item.calories && (
                        <span>{item.calories} kcal</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
