'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Pencil, Trash2, Plus, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATS_PER_PAGE = 4;
const ITEMS_PER_PAGE = 4;

// ─── Reusable Pagination Controls ─────────────────────────────────────────────
function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-bottle/5">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="p-1.5 rounded-lg text-ink/60 hover:text-turmeric hover:bg-turmeric/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-sm font-bold text-ink/70 min-w-[80px] text-center">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="p-1.5 rounded-lg text-ink/60 hover:text-turmeric hover:bg-turmeric/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminMenu() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

  // ── Pagination: categories chips ──────────────────────────────────────────
  const [catPage, setCatPage] = useState(1);

  // ── Pagination: dishes per category (keyed by category.id) ───────────────
  const [itemPages, setItemPages] = useState<Record<string, number>>({});

  const getItemPage = (catId: string) => itemPages[catId] ?? 1;
  const setItemPage = (catId: string, page: number) =>
    setItemPages(prev => ({ ...prev, [catId]: page }));

  // ── Reset item page for a specific category ───────────────────────────────
  const resetItemPage = (catId: string) => setItemPage(catId, 1);

  // ─────────────────────────────────────────────────────────────────────────
  const fetchMenu = useCallback(async () => {
    try {
      const res = await api.get('/menu');
      if (res.data.success) {
        setCategories(res.data.data);
        // Reset category chips page if the number of categories changed
        const totalCatPages = Math.ceil(res.data.data.length / CATS_PER_PAGE);
        setCatPage(p => Math.min(p, Math.max(1, totalCatPages)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // ─── Category actions ──────────────────────────────────────────────────────
  const openCategoryModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (category: any) => {
    if (category.items && category.items.length > 0) {
      toast.error(
        `Cannot delete category "${category.name}": There are still ${category.items.length} items attached to it. Please delete or move those items first.`
      );
      return;
    }
    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) return;
    try {
      const res = await api.delete(`/menu/category/${category.id}`);
      if (res.data.success) {
        toast.success("Category deleted successfully!");
        fetchMenu();
        // Reset chips page if it becomes out of range
        setCatPage(1);
      } else {
        toast.error(res.data.message || 'Failed to delete category');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'An error occurred while deleting the category.');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setIsCategorySubmitting(true);
    try {
      if (editingCategory) {
        const res = await api.put(`/menu/category/${editingCategory.id}`, { name: categoryName });
        if (res.data.success) {
          setIsCategoryModalOpen(false);
          toast.success("Category updated successfully!");
          fetchMenu();
        }
      } else {
        const res = await api.post('/menu/category', { name: categoryName });
        if (res.data.success) {
          setIsCategoryModalOpen(false);
          toast.success("Category created successfully!");
          fetchMenu();
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  // ─── Image preview ─────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(editingItem?.imageUrl || null);
    }
  };

  // ─── Item actions ──────────────────────────────────────────────────────────
  const handleToggleAvailability = async (itemId: string) => {
    try {
      await api.patch(`/menu/item/${itemId}/toggle-availability`);
      toast.success("Dish availability updated!");
      fetchMenu();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update availability");
    }
  };

  const handleDelete = async (itemId: string, catId: string) => {
    if (!confirm('Are you sure you want to delete this exquisite dish? This cannot be undone.')) return;
    try {
      await api.delete(`/menu/item/${itemId}`);
      toast.success("Dish deleted successfully!");
      resetItemPage(catId); // reset to page 1 so no empty page shows
      fetchMenu();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete dish");
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        categoryId: item.categoryId,
        available: item.available,
      });
      setImagePreview(item.imageUrl || null);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: categories[0]?.id || '',
        available: true,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('categoryId', formData.categoryId);
    data.append('available', String(formData.available));
    if (imageFile) data.append('image', imageFile);
    try {
      if (editingItem) {
        await api.put(`/menu/item/${editingItem.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success("Dish updated successfully!");
      } else {
        await api.post(`/menu/item`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success("Dish created successfully!");
        // Reset the target category's item page so newly-added item is visible
        resetItemPage(formData.categoryId);
      }
      setIsModalOpen(false);
      fetchMenu();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Derived: paginated categories for chips ───────────────────────────────
  const totalCatPages = Math.max(1, Math.ceil(categories.length / CATS_PER_PAGE));
  const visibleCategories = categories.slice(
    (catPage - 1) * CATS_PER_PAGE,
    catPage * CATS_PER_PAGE
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-bottle">Menu Management</h1>
          <p className="text-ink/60 mt-1 font-medium">Add, update, or remove dishes from your active menu.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => openCategoryModal()}
            className="px-6 py-3.5 bg-bottle text-basmati border border-bottle/10 font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-bottle/90 hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} />
            Add Category
          </button>
          <button
            onClick={() => openModal()}
            className="px-6 py-3.5 bg-turmeric text-ink font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-turmeric/90 hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} />
            Add New Dish
          </button>
        </div>
      </div>

      {/* ── Category Chips ──────────────────────────────────────────────────── */}
      <div className="bg-basmati p-6 rounded-2xl shadow-sm border border-bottle/10 mb-8 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-ink/60 uppercase tracking-wider">
          Manage Categories
          {categories.length > 0 && (
            <span className="ml-2 text-turmeric font-bold">({categories.length})</span>
          )}
        </h3>

        <div className="flex flex-wrap gap-3">
          {visibleCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 bg-bottle/5 hover:bg-bottle/10 border border-bottle/10 text-bottle px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            >
              <span>{category.name}</span>
              <div className="flex items-center gap-1.5 ml-2 border-l border-bottle/20 pl-2">
                <button
                  onClick={() => openCategoryModal(category)}
                  className="text-bottle/60 hover:text-turmeric transition-colors cursor-pointer"
                  title="Edit Category"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="text-chili/80 hover:text-chili transition-colors cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-ink/50 italic font-medium">No categories created yet.</p>
          )}
        </div>

        {/* Categories pagination */}
        <PaginationControls
          page={catPage}
          totalPages={totalCatPages}
          onPrev={() => setCatPage(p => Math.max(1, p - 1))}
          onNext={() => setCatPage(p => Math.min(totalCatPages, p + 1))}
        />
      </div>

      {/* ── Dishes Tables ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-turmeric" />
        </div>
      ) : (
        <div className="space-y-10">
          {categories.map((category) => {
            const allItems: any[] = category.items ?? [];
            const totalItemPages = Math.max(1, Math.ceil(allItems.length / ITEMS_PER_PAGE));
            const currentItemPage = Math.min(getItemPage(category.id), totalItemPages);
            const pagedItems = allItems.slice(
              (currentItemPage - 1) * ITEMS_PER_PAGE,
              currentItemPage * ITEMS_PER_PAGE
            );

            return (
              <div key={category.id} className="bg-basmati rounded-2xl shadow-sm border border-bottle/10 overflow-hidden">
                {/* Category header */}
                <div className="bg-bottle text-basmati p-5 flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-bold">{category.name}</h2>
                  <span className="text-sm bg-white/10 px-3 py-1 rounded-full font-bold">
                    {allItems.length} Items
                  </span>
                </div>

                {/* Table */}
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-basmati/30 text-ink/70 text-xs uppercase tracking-widest border-b border-bottle/10">
                        <th className="p-5 font-bold w-24">Image</th>
                        <th className="p-5 font-bold min-w-[200px]">Dish Info</th>
                        <th className="p-5 font-bold">Price</th>
                        <th className="p-5 font-bold">Status</th>
                        <th className="p-5 font-bold text-right pr-8">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bottle/5">
                      {pagedItems.length > 0 ? (
                        pagedItems.map((item: any) => (
                          <tr key={item.id} className="hover:bg-basmati/20 transition-colors group">
                            <td className="p-5">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-16 h-16 rounded-xl object-cover shadow-sm border border-bottle/5"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-xl bg-basmati flex flex-col items-center justify-center text-bottle/40 border border-bottle/10 shadow-inner">
                                  <ImageIcon size={20} />
                                </div>
                              )}
                            </td>
                            <td className="p-5">
                              <p className="font-bold text-ink text-lg">{item.name}</p>
                              <p className="text-sm text-ink/60 truncate max-w-sm mt-0.5">{item.description}</p>
                            </td>
                            <td className="p-5 font-bold text-chili text-lg">
                              ${Number(item.price).toFixed(2)}
                            </td>
                            <td className="p-5">
                              <button
                                onClick={() => handleToggleAvailability(item.id)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg border-2 transition-all cursor-pointer ${
                                  item.available
                                    ? 'bg-bottle/5 border-bottle/20 text-bottle hover:bg-bottle/10'
                                    : 'bg-chili/5 border-chili/20 text-chili hover:bg-chili/10'
                                }`}
                              >
                                {item.available ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>
                            <td className="p-5 text-right space-x-2">
                              <button
                                onClick={() => openModal(item)}
                                className="p-2.5 bg-bottle/5 text-bottle hover:bg-turmeric hover:text-bottle rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                                title="Edit Item"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, category.id)}
                                className="p-2.5 bg-chili/5 text-chili hover:bg-chili hover:text-white rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                                title="Delete Item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-ink/50 font-medium italic">
                            No dishes found in this category.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Per-category pagination */}
                {allItems.length > ITEMS_PER_PAGE && (
                  <div className="px-6 pb-5">
                    <PaginationControls
                      page={currentItemPage}
                      totalPages={totalItemPages}
                      onPrev={() => setItemPage(category.id, Math.max(1, currentItemPage - 1))}
                      onNext={() => setItemPage(category.id, Math.min(totalItemPages, currentItemPage + 1))}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Item Modal ────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-basmati rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 border-b border-bottle/10 flex justify-between items-center bg-basmati/50 shrink-0">
              <h2 className="text-3xl font-serif font-bold text-bottle">
                {editingItem ? 'Edit Dish' : 'Add New Dish'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink/40 hover:text-chili hover:bg-chili/10 w-10 h-10 rounded-full flex items-center justify-center text-3xl leading-none transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-2">Item Name</label>
                  <input
                    required type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 bg-basmati/30 border-2 border-bottle/10 rounded-xl focus:bg-basmati focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 outline-none font-bold text-ink transition-all"
                    placeholder="e.g. Chicken Biryani"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-2">Price ($)</label>
                  <input
                    required type="number" step="0.01" min="0"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-4 bg-basmati/30 border-2 border-bottle/10 rounded-xl focus:bg-basmati focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 outline-none font-bold text-ink transition-all"
                    placeholder="12.99"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-2">Category</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full p-4 bg-basmati/30 border-2 border-bottle/10 rounded-xl focus:bg-basmati focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 outline-none font-bold text-ink transition-all cursor-pointer"
                >
                  <option value="" disabled>Select a category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-4 bg-basmati/30 border-2 border-bottle/10 rounded-xl focus:bg-basmati focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 outline-none font-medium text-ink transition-all resize-none"
                  placeholder="Delicious slow-cooked chicken..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-2">Dish Image</label>
                <div className="flex items-center gap-6">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-xl object-cover border-2 border-bottle/10 shadow-sm shrink-0" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-bottle/20 flex items-center justify-center text-bottle/30 shrink-0">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file" accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-ink file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-turmeric/10 file:text-bottle hover:file:bg-turmeric/20 file:cursor-pointer file:transition-colors cursor-pointer"
                    />
                    <p className="text-xs text-ink/50 mt-2">Recommended: 800x800px or higher, JPG/PNG format.</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-basmati/50 border border-bottle/10 rounded-xl">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={e => setFormData({ ...formData, available: e.target.checked })}
                    className="w-6 h-6 rounded border-bottle/20 text-turmeric focus:ring-turmeric accent-turmeric"
                  />
                  <span className="font-bold text-ink text-lg">Item is Available / In Stock</span>
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 text-ink font-bold hover:bg-bottle/5 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-10 py-3.5 bg-turmeric text-ink font-bold text-lg rounded-xl shadow-lg hover:bg-turmeric/90 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 transition-all">
                  {isSubmitting ? 'Saving...' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Category Modal ────────────────────────────────────────────────────── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-ink/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-basmati rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-6 border-b border-bottle/10 flex justify-between items-center bg-basmati/50 shrink-0">
              <h2 className="text-2xl font-serif font-bold text-bottle">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-ink/40 hover:text-chili hover:bg-chili/10 w-10 h-10 rounded-full flex items-center justify-center text-3xl leading-none transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-2">Category Name</label>
                <input
                  required type="text"
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  className="w-full p-4 bg-basmati/30 border-2 border-bottle/10 rounded-xl focus:bg-basmati focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 outline-none font-bold text-ink transition-all"
                  placeholder="e.g. Desserts"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-6 py-3.5 text-ink font-bold hover:bg-bottle/5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCategorySubmitting}
                  className="px-10 py-3.5 bg-turmeric text-ink font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg hover:bg-turmeric/90 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 transition-all cursor-pointer"
                >
                  {isCategorySubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
