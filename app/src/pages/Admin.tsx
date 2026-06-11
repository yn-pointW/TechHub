import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Package, ListTree, ShoppingBag, Users,
  Plus, Search, Pencil, Trash2, X, DollarSign, UserCheck, Boxes,
  ImagePlus, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdminStore } from '@/stores/useAdminStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Product, OrderStatus, Category } from '@/types';
import { formatPrice } from '@/lib/utils';
import { uploadApi } from '@/lib/api';

type Tab = 'dashboard' | 'products' | 'categories' | 'orders' | 'users';

const statusColors: Record<OrderStatus, string> = {
  new: 'bg-blue-500/15 text-blue-400',
  processing: 'bg-tech-warning/15 text-tech-warning',
  shipped: 'bg-purple-500/15 text-purple-400',
  delivered: 'bg-tech-success/15 text-tech-success',
  cancelled: 'bg-tech-error/15 text-tech-error',
};

export default function Admin() {
  const { t } = useTranslation();
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab: Tab = (tab as Tab) || 'dashboard';

  const fetchProducts = useAdminStore(s => s.fetchProducts);
  const fetchOrders = useAdminStore(s => s.fetchOrders);
  const fetchCategories = useAdminStore(s => s.fetchCategories);
  const fetchUsers = useAdminStore(s => s.fetchUsers);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchOrders();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTab = (t: Tab) => navigate(`/admin/${t}`);

  const tabs = [
    { id: 'dashboard' as Tab, label: t('admin.dashboard'), icon: LayoutDashboard },
    { id: 'products' as Tab, label: t('admin.products'), icon: Package },
    { id: 'categories' as Tab, label: t('admin.categories'), icon: ListTree },
    { id: 'orders' as Tab, label: t('admin.orders'), icon: ShoppingBag },
    { id: 'users' as Tab, label: t('admin.users'), icon: Users },
  ];

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <aside className="w-64 bg-tech-bg-secondary border-r border-tech-border-subtle flex-shrink-0 hidden lg:block">
        <div className="p-5">
          <span className="text-lg font-bold gradient-text">{t('admin.title')}</span>
        </div>
        <nav className="px-3 space-y-1">
          {tabs.map(tabItem => {
            const Icon = tabItem.icon;
            return (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tabItem.id
                    ? 'bg-tech-bg-tertiary text-white'
                    : 'text-tech-text-secondary hover:text-white hover:bg-tech-bg-tertiary/50'
                }`}
              >
                <Icon size={18} />
                {tabItem.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Tabs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-tech-bg-secondary border-t border-tech-border-subtle z-40 flex overflow-x-auto">
        {tabs.map(tabItem => {
          const Icon = tabItem.icon;
          return (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={`flex-1 min-w-[80px] flex flex-col items-center gap-1 py-3 text-xs transition-all ${
                activeTab === tabItem.id ? 'text-tech-accent-primary' : 'text-tech-text-muted'
              }`}
            >
              <Icon size={18} />
              {tabItem.label}
            </button>
          );
        })}
      </div>

      <main className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8 overflow-auto">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'users' && <UsersTab />}
      </main>
    </div>
  );
}

/* ===================== CSS BAR CHART ===================== */
function CssBarChart({ data, maxVal, color = '#00d4aa' }: { data: { label: string; value: number }[]; maxVal: number; color?: string }) {
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-tech-text-secondary">{d.label}</span>
            <span className="text-white font-medium">{formatPrice(d.value)}</span>
          </div>
          <div className="h-6 bg-tech-bg-tertiary rounded-md overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(5, (d.value / maxVal) * 100)}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="h-full rounded-md"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===================== CSS LINE CHART ===================== */
function CssLineChart({ data, maxVal }: { data: { label: string; value: number }[]; maxVal: number }) {
  const w = 600, h = 200, pad = 20;
  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2);
    const y = h - pad - (d.value / maxVal) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[250px]">
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <line key={p} x1={pad} y1={h - pad - p * (h - pad * 2)} x2={w - pad} y2={h - pad - p * (h - pad * 2)}
          stroke="#1a1a25" strokeWidth="1" />
      ))}
      <polygon points={`${pad},${h - pad} ${points} ${w - pad},${h - pad}`} fill="rgba(0, 212, 170, 0.1)" />
      <polyline points={points} fill="none" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2);
        const y = h - pad - (d.value / maxVal) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r="4" fill="#00d4aa" />;
      })}
    </svg>
  );
}

/* ===================== DASHBOARD ===================== */
function DashboardTab() {
  const { t } = useTranslation();
  const getDashboardStats = useAdminStore(s => s.getDashboardStats);
  const getSalesByDay = useAdminStore(s => s.getSalesByDay);
  const getTopCategories = useAdminStore(s => s.getTopCategories);
  useAdminStore(s => s.orders);
  useAdminStore(s => s.products);
  useAdminStore(s => s.users);

  const stats = getDashboardStats();
  const salesByDay = getSalesByDay();
  const topCategories = getTopCategories();

  const salesData = salesByDay.map(d => ({ label: d.date.slice(5), value: d.amount }));
  const maxSales = Math.max(...salesData.map(d => d.value), 1);
  const catData = topCategories.map(c => ({ label: c.name, value: c.sales }));
  const maxCat = Math.max(...catData.map(d => d.value), 1);

  const statCards = [
    { label: t('admin.total_orders'), value: stats.totalOrders.toLocaleString('ro-MD'), icon: ShoppingBag, color: 'bg-tech-accent-primary/10 text-tech-accent-primary' },
    { label: t('admin.revenue'), value: formatPrice(stats.revenue), icon: DollarSign, color: 'bg-tech-success/10 text-tech-success' },
    { label: t('admin.total_users'), value: stats.totalUsers.toLocaleString('ro-MD'), icon: UserCheck, color: 'bg-blue-500/10 text-blue-400' },
    { label: t('admin.total_products'), value: stats.totalProducts.toLocaleString('ro-MD'), icon: Boxes, color: 'bg-tech-accent-secondary/10 text-tech-accent-secondary' },
  ];

  return (
    <div>
      <h1 className="text-h2 text-white mb-8">Dashboard</h1>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-tech-text-secondary text-sm">{card.label}</span>
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
              </div>
              <span className="text-white text-2xl font-bold">{card.value}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-base p-6">
          <h3 className="text-white font-semibold mb-4">{t('admin.sales_chart')}</h3>
          {salesData.length > 0 ? <CssLineChart data={salesData} maxVal={maxSales} /> : <p className="text-tech-text-muted text-sm">{t('admin.no_data')}</p>}
        </div>
        <div className="card-base p-6">
          <h3 className="text-white font-semibold mb-4">{t('admin.top_categories')}</h3>
          {catData.length > 0 ? <CssBarChart data={catData} maxVal={maxCat} /> : <p className="text-tech-text-muted text-sm">{t('admin.no_data')}</p>}
        </div>
      </div>
    </div>
  );
}

/* ===================== IMAGE UPLOAD ===================== */
function ImageUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await uploadApi.uploadImages(Array.from(files));
      onChange([...images, ...urls]);
    } catch {
      // silently ignore
    } finally {
      setUploading(false);
    }
  };

  const addUrl = () => {
    const url = prompt(t('admin.image_url'));
    if (url?.trim()) onChange([...images, url.trim()]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative group w-20 h-20">
            <img src={img} alt="" className="w-full h-full object-cover rounded-lg border border-tech-border-subtle" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-tech-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 border-2 border-dashed border-tech-border-subtle rounded-lg flex flex-col items-center justify-center gap-1 text-tech-text-muted hover:border-tech-accent-primary hover:text-tech-accent-primary transition-colors"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          <span className="text-[10px]">{uploading ? '...' : t('admin.upload_images')}</span>
        </button>

        <button
          type="button"
          onClick={addUrl}
          className="w-20 h-20 border-2 border-dashed border-tech-border-subtle rounded-lg flex flex-col items-center justify-center gap-1 text-tech-text-muted hover:border-tech-accent-primary hover:text-tech-accent-primary transition-colors"
        >
          <Plus size={18} />
          <span className="text-[10px]">URL</span>
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}

/* ===================== PRODUCTS ===================== */
function ProductsTab() {
  const { t } = useTranslation();
  const productSearch = useAdminStore(s => s.productSearch);
  const setProductSearch = useAdminStore(s => s.setProductSearch);
  const productCategoryFilter = useAdminStore(s => s.productCategoryFilter);
  const setProductCategoryFilter = useAdminStore(s => s.setProductCategoryFilter);
  const getFilteredProducts = useAdminStore(s => s.getFilteredProducts);
  const deleteProduct = useAdminStore(s => s.deleteProduct);
  const addProduct = useAdminStore(s => s.addProduct);
  const updateProduct = useAdminStore(s => s.updateProduct);
  const categories = useAdminStore(s => s.categories);
  const addToast = useToastStore(s => s.addToast);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({});
  const [newStorageOption, setNewStorageOption] = useState('');

  const filtered = getFilteredProducts();

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: '', brand: '', category: categories[0]?.slug || 'telefoane', subcategory: '',
      price: 0, oldPrice: null, discount: null, images: [],
      specs: {}, description: '', stock: 0, rating: 0, reviewCount: 0,
      badges: [], colors: [], storageOptions: [], cashback: null, monthlyPayment: null, isActive: true,
    });
    setNewStorageOption('');
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({ ...product });
    setNewStorageOption('');
    setShowModal(true);
  };

  const addStorageOption = () => {
    const opt = newStorageOption.trim();
    if (!opt) return;
    const current = form.storageOptions || [];
    if (current.includes(opt)) return;
    setForm({ ...form, storageOptions: [...current, opt] });
    setNewStorageOption('');
  };

  const removeStorageOption = (idx: number) => {
    const current = form.storageOptions || [];
    setForm({ ...form, storageOptions: current.filter((_, i) => i !== idx) });
  };

  const handleSave = async () => {
    if (!form.name || !form.brand) return;
    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, form);
        addToast('success', t('admin.product_saved'));
      } else {
        await addProduct(form as Omit<Product, 'id'>);
        addToast('success', t('admin.product_added'));
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.delete_confirm'))) return;
    await deleteProduct(id);
    addToast('info', t('admin.product_deleted'));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-h2 text-white">{t('admin.products')}</h1>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> {t('admin.add_product')}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tech-text-muted" />
          <input
            type="text"
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            placeholder={t('admin.search_products')}
            className="w-full bg-tech-bg-tertiary border border-tech-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-tech-text-muted outline-none focus:border-tech-accent-primary"
          />
        </div>
        <select
          value={productCategoryFilter}
          onChange={e => setProductCategoryFilter(e.target.value)}
          className="bg-tech-bg-tertiary border border-tech-border-subtle rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-tech-accent-primary"
        >
          <option value="all">{t('admin.all_categories_filter')}</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tech-border-subtle">
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.id')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.product_name')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.category')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.price')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.discount_pct')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.stock')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id} className="border-b border-tech-border-subtle last:border-0 hover:bg-tech-bg-tertiary/30 transition-colors">
                  <td className="p-4 text-tech-text-muted text-sm">{product.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.images[0] && <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      <span className="text-white text-sm">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-tech-text-secondary text-sm">{product.category}</td>
                  <td className="p-4 text-white text-sm font-medium">{formatPrice(product.price)}</td>
                  <td className="p-4">
                    {product.discount ? (
                      <span className="bg-tech-accent-secondary/15 text-tech-accent-secondary text-xs px-2 py-0.5 rounded">-{product.discount}%</span>
                    ) : <span className="text-tech-text-muted text-sm">—</span>}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs ${product.stock > 0 ? 'text-tech-success' : 'text-tech-error'}`}>
                      {product.stock > 0 ? `${product.stock} ${t('common.pcs')}` : t('product.out_of_stock')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(product)} className="p-1.5 text-tech-text-muted hover:text-tech-accent-primary transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 text-tech-text-muted hover:text-tech-error transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-tech-bg-secondary border border-tech-border-subtle rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h3 text-white">{editingProduct ? t('admin.edit_product') : t('admin.add_product')}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-tech-text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Images */}
              <div>
                <label className="text-tech-text-secondary text-sm mb-2 block">{t('admin.images')}</label>
                <ImageUploader
                  images={form.images || []}
                  onChange={imgs => setForm({ ...form, images: imgs })}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.product_name')} *</label>
                  <input type="text" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="input-base w-full" />
                </div>
                <div>
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.brand')} *</label>
                  <input type="text" value={form.brand || ''} onChange={e => setForm({ ...form, brand: e.target.value })} className="input-base w-full" />
                </div>
                <div>
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.category')}</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value, subcategory: '' })} className="input-base w-full">
                    {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.subcategory')}</label>
                  <select value={form.subcategory || ''} onChange={e => setForm({ ...form, subcategory: e.target.value })} className="input-base w-full">
                    <option value="">— {t('admin.no_subcategory')} —</option>
                    {(categories.find(c => c.slug === form.category)?.subcategories || []).map(s => (
                      <option key={s.id} value={s.slug}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.price')} *</label>
                  <input type="number" value={form.price || 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="input-base w-full" />
                </div>
                <div>
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.old_price')}</label>
                  <input type="number" value={form.oldPrice || ''} onChange={e => setForm({ ...form, oldPrice: Number(e.target.value) || null })} className="input-base w-full" />
                </div>
                <div>
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.discount_pct')}</label>
                  <input type="number" min={0} max={100} value={form.discount || ''} onChange={e => setForm({ ...form, discount: Number(e.target.value) || null })} className="input-base w-full" placeholder="%" />
                </div>
                <div>
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.stock')} *</label>
                  <input type="number" value={form.stock || 0} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className="input-base w-full" />
                </div>
                <div>
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.rating')} (0–5)</label>
                  <input type="number" min={0} max={5} step={0.1} value={form.rating ?? 0} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} className="input-base w-full" />
                </div>
                <div>
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.review_count')}</label>
                  <input type="number" min={0} value={form.reviewCount ?? 0} onChange={e => setForm({ ...form, reviewCount: Number(e.target.value) })} className="input-base w-full" />
                </div>
                <div>
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.cashback')}</label>
                  <input type="number" min={0} value={form.cashback || ''} onChange={e => setForm({ ...form, cashback: Number(e.target.value) || null })} className="input-base w-full" />
                </div>
                <div>
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.monthly_payment')}</label>
                  <input type="number" min={0} value={form.monthlyPayment || ''} onChange={e => setForm({ ...form, monthlyPayment: Number(e.target.value) || null })} className="input-base w-full" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.badges')}</label>
                  <div className="flex flex-wrap gap-3">
                    {(['popular', 'sale', 'limited', 'new', 'credit0'] as const).map(badge => {
                      const checked = (form.badges || []).includes(badge);
                      return (
                        <label key={badge} className="flex items-center gap-2 cursor-pointer">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-tech-accent-primary border-tech-accent-primary' : 'border-tech-text-muted'}`}
                            onClick={() => {
                              const cur = form.badges || [];
                              setForm({ ...form, badges: checked ? cur.filter(b => b !== badge) : [...cur, badge] });
                            }}
                          >
                            {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className="text-tech-text-secondary text-sm">{badge}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">
                    {t('admin.storage_options')}
                    <span className="text-tech-text-muted text-xs ml-2">{t('admin.storage_options_hint')}</span>
                  </label>
                  {(form.storageOptions || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(form.storageOptions || []).map((opt, idx) => (
                        <span key={`${opt}-${idx}`} className="bg-tech-bg-tertiary border border-tech-border-subtle text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                          {opt}
                          <button
                            type="button"
                            onClick={() => removeStorageOption(idx)}
                            className="text-tech-text-muted hover:text-tech-error transition-colors"
                            aria-label="remove"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStorageOption}
                      onChange={e => setNewStorageOption(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStorageOption(); } }}
                      placeholder={t('admin.storage_option_placeholder')}
                      className="input-base flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addStorageOption}
                      disabled={!newStorageOption.trim()}
                      className="btn-secondary px-4 text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      <Plus size={14} />
                      {t('admin.add')}
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('admin.description')}</label>
                  <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="input-base w-full h-24 resize-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="btn-primary px-6 flex items-center gap-2">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {t('admin.save')}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary px-6">{t('admin.cancel')}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ===================== CATEGORIES ===================== */
function CategoriesTab() {
  const { t } = useTranslation();
  const categories = useAdminStore(s => s.categories);

  return (
    <div>
      <h1 className="text-h2 text-white mb-6">{t('admin.categories')}</h1>
      <div className="card-base p-6">
        <div className="space-y-4">
          {categories.map((cat: Category) => (
            <div key={cat.id} className="border border-tech-border-subtle rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">{cat.name}</h3>
                <span className="text-tech-text-muted text-sm">{cat.subcategories.length} {t('admin.subcategories')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.subcategories.map(sub => (
                  <span key={sub.id} className="bg-tech-bg-tertiary text-tech-text-secondary text-sm px-3 py-1.5 rounded-lg">
                    {sub.name} ({sub.productCount})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===================== ORDERS ===================== */
function OrdersTab() {
  const { t } = useTranslation();
  const orderStatusFilter = useAdminStore(s => s.orderStatusFilter);
  const setOrderStatusFilter = useAdminStore(s => s.setOrderStatusFilter);
  const getFilteredOrders = useAdminStore(s => s.getFilteredOrders);
  const updateOrderStatus = useAdminStore(s => s.updateOrderStatus);
  const users = useAdminStore(s => s.users);
  const addToast = useToastStore(s => s.addToast);

  const filtered = getFilteredOrders();

  const statusLabels: Record<OrderStatus, string> = {
    new: t('admin.status_new'),
    processing: t('admin.status_processing'),
    shipped: t('admin.status_shipped'),
    delivered: t('admin.status_delivered'),
    cancelled: t('admin.status_cancelled'),
  };

  const statusOptions = (Object.keys(statusLabels) as OrderStatus[]).map(v => ({ value: v, label: statusLabels[v] }));

  return (
    <div>
      <h1 className="text-h2 text-white mb-6">{t('admin.orders')}</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={orderStatusFilter}
          onChange={e => setOrderStatusFilter(e.target.value)}
          className="bg-tech-bg-tertiary border border-tech-border-subtle rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-tech-accent-primary"
        >
          <option value="all">{t('admin.all_statuses')}</option>
          {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tech-border-subtle">
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.order_id')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.client')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.date')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.amount')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.status')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const clientUser = users.find(u => u.id === order.userId);
                return (
                  <tr key={order.id} className="border-b border-tech-border-subtle last:border-0 hover:bg-tech-bg-tertiary/30 transition-colors">
                    <td className="p-4 text-white text-sm font-medium">{order.id.split('-')[1]}</td>
                    <td className="p-4 text-tech-text-secondary text-sm">{clientUser?.name || order.userId}</td>
                    <td className="p-4 text-tech-text-secondary text-sm">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                    <td className="p-4 text-white text-sm font-medium">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={async e => {
                          await updateOrderStatus(order.id, e.target.value as OrderStatus);
                          addToast('success', t('admin.status_updated'));
                        }}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer ${statusColors[order.status]}`}
                      >
                        {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="p-4">
                      <button className="text-tech-text-muted hover:text-tech-accent-primary text-sm transition-colors">{t('admin.details')}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===================== USERS ===================== */
function UsersTab() {
  const { t } = useTranslation();
  const users = useAdminStore(s => s.users);

  return (
    <div>
      <h1 className="text-h2 text-white mb-6">{t('admin.users')}</h1>
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tech-border-subtle">
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.id')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('auth.name')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('auth.email')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('auth.phone')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.status')}</th>
                <th className="text-left p-4 text-tech-text-secondary text-sm font-medium">{t('admin.date')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-tech-border-subtle last:border-0 hover:bg-tech-bg-tertiary/30 transition-colors">
                  <td className="p-4 text-tech-text-muted text-sm">{user.id}</td>
                  <td className="p-4 text-white text-sm font-medium">{user.name}</td>
                  <td className="p-4 text-tech-text-secondary text-sm">{user.email}</td>
                  <td className="p-4 text-tech-text-secondary text-sm">{user.phone}</td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      user.role === 'admin' ? 'bg-tech-accent-primary/15 text-tech-accent-primary' : 'bg-tech-bg-tertiary text-tech-text-secondary'
                    }`}>
                      {user.role === 'admin' ? t('admin.role_admin') : t('admin.role_user')}
                    </span>
                  </td>
                  <td className="p-4 text-tech-text-muted text-sm">{new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}