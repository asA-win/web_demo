import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Sparkles, Leaf, Clock, 
  Search, RefreshCw, X, AlertCircle, CheckCircle 
} from 'lucide-react';
import { menuService } from '../../services/api';
import { useToast } from '../../components/Toast';

export const MenuManager = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Item Form Fields
  const [itemName, setItemName] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isChefSpecial, setIsChefSpecial] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [prepTime, setPrepTime] = useState(20);
  const [allergens, setAllergens] = useState('');
  const [calories, setCalories] = useState('');

  // Category Form Fields
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catOrder, setCatOrder] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchMenuData = async () => {
    try {
      setIsLoading(true);
      const [cats, allItems] = await Promise.all([
        menuService.adminGetCategories(),
        menuService.adminGetItems()
      ]);
      setCategories(cats);
      setItems(allItems);
      if (!itemCategoryId && cats.length > 0) {
        setItemCategoryId(cats[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load menu data:', err);
      addToast('Error loading menu items.', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const openAddItemModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemPrice('');
    setItemDescription('');
    setItemImageUrl('');
    setIsVegetarian(false);
    setIsChefSpecial(false);
    setIsGlutenFree(false);
    setIsAvailable(true);
    setPrepTime(20);
    setAllergens('');
    setCalories('');
    if (categories.length > 0) {
      setItemCategoryId(categories[0].id.toString());
    }
    setShowItemModal(true);
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategoryId(item.category_id.toString());
    setItemPrice(item.price.toString());
    setItemDescription(item.description);
    setItemImageUrl(item.image_url || '');
    setIsVegetarian(item.is_vegetarian);
    setIsChefSpecial(item.is_chef_special);
    setIsGlutenFree(item.is_gluten_free);
    setIsAvailable(item.is_available);
    setPrepTime(item.preparation_time_minutes || 20);
    setAllergens(item.allergens || '');
    setCalories(item.calories?.toString() || '');
    setShowItemModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !itemPrice || !itemCategoryId || !itemDescription.trim()) {
      addToast('Please complete all required item fields.', 'warning', 'Missing Fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: itemName.trim(),
        category_id: parseInt(itemCategoryId, 10),
        price: parseFloat(itemPrice),
        description: itemDescription.trim(),
        image_url: itemImageUrl.trim() || null,
        is_vegetarian: isVegetarian,
        is_chef_special: isChefSpecial,
        is_gluten_free: isGlutenFree,
        is_available: isAvailable,
        preparation_time_minutes: prepTime ? parseInt(prepTime, 10) : null,
        allergens: allergens.trim() || null,
        calories: calories ? parseInt(calories, 10) : null,
      };

      if (editingItem) {
        await menuService.updateItem(editingItem.id, payload);
        addToast(`Dish "${payload.name}" updated. Connected customer menus updated live.`, 'success', 'Item Updated');
      } else {
        await menuService.createItem(payload);
        addToast(`Dish "${payload.name}" added to menu. Live broadcast dispatched.`, 'success', 'Item Created');
      }

      setShowItemModal(false);
      fetchMenuData();
    } catch (err) {
      console.error('Save item failed:', err);
      const detail = err.response?.data?.detail || 'Failed to save menu item.';
      addToast(detail, 'error', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete dish "${name}"?`)) return;
    try {
      await menuService.deleteItem(id);
      addToast(`"${name}" removed from the menu.`, 'info', 'Item Removed');
      fetchMenuData();
    } catch (err) {
      console.error('Delete item failed:', err);
      addToast('Failed to delete item.', 'error', 'Error');
    }
  };

  // Category Modal Handlers
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDescription('');
    setCatOrder(categories.length + 1);
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDescription(cat.description || '');
    setCatOrder(cat.display_order);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      addToast('Please enter category name.', 'warning', 'Missing Name');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: catName.trim(),
        description: catDescription.trim() || null,
        display_order: parseInt(catOrder, 10) || 0,
        is_active: true,
      };

      if (editingCategory) {
        await menuService.updateCategory(editingCategory.id, payload);
        addToast(`Category "${payload.name}" updated.`, 'success', 'Category Updated');
      } else {
        await menuService.createCategory(payload);
        addToast(`Category "${payload.name}" created.`, 'success', 'Category Created');
      }

      setShowCategoryModal(false);
      fetchMenuData();
    } catch (err) {
      console.error('Category save failed:', err);
      const detail = err.response?.data?.detail || 'Failed to save category.';
      addToast(detail, 'error', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}" and all associated items?`)) return;
    try {
      await menuService.deleteCategory(id);
      addToast(`Category "${name}" removed.`, 'info', 'Category Removed');
      fetchMenuData();
    } catch (err) {
      console.error('Delete category failed:', err);
      addToast('Failed to delete category.', 'error', 'Error');
    }
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (selectedCategoryTab !== 'all' && item.category_id.toString() !== selectedCategoryTab) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
            Menu Engineering & Delicacies
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Curate royal culinary offerings, update AED pricing, and broadcast changes live to customer browsers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddCategoryModal}
            className="btn-outline-gold text-xs font-semibold py-2 px-4 flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Category
          </button>
          <button
            onClick={openAddItemModal}
            className="btn-gold text-xs font-bold py-2 px-4 flex items-center gap-2 uppercase tracking-wider shadow-gold-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Dish
          </button>
        </div>
      </div>

      {/* Filter & Category Bar */}
      <div className="glass-panel p-4 rounded-xl border border-gold-400/20 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Total Dishes: {items.length}
          </span>
        </div>

        {/* Category Pills with Edit Actions */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800">
          <button
            onClick={() => setSelectedCategoryTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryTab === 'all'
                ? 'bg-gold-400 text-obsidian-950 font-bold'
                : 'text-slate-400 hover:text-white bg-obsidian-900 border border-slate-800'
            }`}
          >
            All Categories ({items.length})
          </button>

          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center group">
              <button
                onClick={() => setSelectedCategoryTab(cat.id.toString())}
                className={`px-3 py-1.5 rounded-l-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategoryTab === cat.id.toString()
                    ? 'bg-gold-400 text-obsidian-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-obsidian-900 border-y border-l border-slate-800'
                }`}
              >
                {cat.name}
              </button>
              <button
                onClick={() => openEditCategoryModal(cat)}
                className="px-2 py-1.5 rounded-r-lg bg-obsidian-850 border border-slate-800 text-slate-400 hover:text-gold-300"
                title="Edit Category"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items Table / Grid */}
      <div className="glass-panel rounded-2xl border border-gold-400/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-900 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Dish</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (AED)</th>
                <th className="py-3.5 px-4">Attributes</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No items found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const cat = categories.find((c) => c.id === item.category_id);
                  return (
                    <tr key={item.id} className="hover:bg-obsidian-850/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80'}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-white text-sm">{item.name}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-md">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {cat?.name || 'Category'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gold-300 text-sm">
                        {item.price.toFixed(2)} AED
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.is_chef_special && (
                            <span className="px-1.5 py-0.5 rounded bg-gold-400/20 text-gold-300 text-[10px] font-bold">
                              Special
                            </span>
                          )}
                          {item.is_vegetarian && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px]">
                              Veg
                            </span>
                          )}
                          {item.is_gluten_free && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 text-[10px]">
                              GF
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          item.is_available 
                            ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300' 
                            : 'bg-rose-950 border border-rose-500/40 text-rose-300'
                        }`}>
                          {item.is_available ? 'Available' : 'Sold Out'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditItemModal(item)}
                          className="p-1.5 rounded-lg bg-obsidian-800 border border-slate-700 text-slate-300 hover:text-white"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:bg-rose-900"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Create / Edit Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gold-400/40 max-w-xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                {editingItem ? 'Edit Culinary Creation' : 'Add New Royal Dish'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold uppercase tracking-wider text-slate-300">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                    placeholder="e.g. 24K Gold Leaf Wagyu Ribeye"
                    className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-slate-300">
                    Category *
                  </label>
                  <select
                    value={itemCategoryId}
                    onChange={(e) => setItemCategoryId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-slate-300">
                    Price in AED *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    required
                    placeholder="e.g. 240.00"
                    className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold uppercase tracking-wider text-slate-300">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={itemImageUrl}
                    onChange={(e) => setItemImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold uppercase tracking-wider text-slate-300">
                    Description & Flavor Profile *
                  </label>
                  <textarea
                    rows="3"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    required
                    placeholder="Artisanal description of ingredients, spices, and preparation..."
                    className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400 resize-none"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-slate-300">
                    Allergens (Optional)
                  </label>
                  <input
                    type="text"
                    value={allergens}
                    onChange={(e) => setAllergens(e.target.value)}
                    placeholder="Nuts, Dairy, Gluten"
                    className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-slate-300">
                    Prep Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChefSpecial}
                    onChange={(e) => setIsChefSpecial(e.target.checked)}
                    className="rounded text-gold-400 focus:ring-0"
                  />
                  <span className="text-slate-300">Chef's Special</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVegetarian}
                    onChange={(e) => setIsVegetarian(e.target.checked)}
                    className="rounded text-gold-400 focus:ring-0"
                  />
                  <span className="text-slate-300">Vegetarian</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGlutenFree}
                    onChange={(e) => setIsGlutenFree(e.target.checked)}
                    className="rounded text-gold-400 focus:ring-0"
                  />
                  <span className="text-slate-300">Gluten-Free</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="rounded text-gold-400 focus:ring-0"
                  />
                  <span className="text-slate-300">Available</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold py-2.5 px-6 font-bold uppercase tracking-wider"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Dish' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gold-400/40 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-slate-300">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                  placeholder="e.g. Royal Caviar & Raw Bar"
                  className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-slate-300">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Category subtitle for guests..."
                  className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400 resize-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-slate-300">
                  Display Order
                </label>
                <input
                  type="number"
                  value={catOrder}
                  onChange={(e) => setCatOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {editingCategory ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(editingCategory.id, editingCategory.name)}
                    className="text-rose-400 hover:text-rose-300 text-xs"
                  >
                    Delete Category
                  </button>
                ) : <div></div>}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-3 py-2 rounded-lg text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold py-2 px-5 font-bold uppercase tracking-wider"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
