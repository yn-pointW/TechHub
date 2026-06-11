import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Scale, ShoppingCart, Truck, Shield, RotateCcw, Pencil, Trash2, Plus, Check, X as XIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatPrice, formatMonthlyPayment } from '@/lib/utils';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCompareStore } from '@/stores/useCompareStore';
import { useToastStore } from '@/stores/useToastStore';
import { useProductStore } from '@/stores/useProductStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Review, Product } from '@/types';
import StarRating from '@/components/StarRating';
import ProductCard from '@/components/ProductCard';

type TabType = 'specs' | 'description' | 'reviews' | 'delivery';

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const getProductById = useProductStore(s => s.getProductById);
  const getRelatedProducts = useProductStore(s => s.getRelatedProducts);
  const getReviewsByProduct = useProductStore(s => s.getReviewsByProduct);
  const categories = useProductStore(s => s.categories);
  const product = getProductById(id || '');
  const relatedProducts = product ? getRelatedProducts(product) : [];
  const categoryInfo = product ? categories.find(c => c.slug === product.category) : null;
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (id) {
      getReviewsByProduct(id).then(setReviews).catch(() => setReviews([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addItem = useCartStore(s => s.addItem);
  const { isInWishlist, toggle: toggleWishlist } = useWishlistStore();
  const { isInCompare, toggle: toggleCompare } = useCompareStore();
  const addToast = useToastStore(s => s.addToast);
  const isAdmin = useAuthStore(s => s.isAdmin);
  const updateProductInStore = useProductStore(s => s.updateProduct);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('specs');

  if (!product) {
    return (
      <div className="container-main py-20 text-center">
        <p className="text-white text-xl">{t('product.not_found')}</p>
        <Link to="/catalog" className="text-tech-accent-primary mt-4 inline-block">
          {t('product.back_to_catalog')}
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleAddToCart = () => {
    const storage = product.storageOptions[selectedStorage];
    addItem(product.id, undefined, storage);
    addToast('success', `${product.name} — ${t('product.added_to_cart')}`);
  };

  const specGroups = [
    { name: t('product.spec_group_general'), keys: ['ОС', 'Вес'] },
    { name: t('product.spec_group_cpu'), keys: ['Процессор', 'Производитель процессора', 'Частота процессора'] },
    { name: t('product.spec_group_memory'), keys: ['Оперативная память', 'Встроенная память', 'Слот для карты памяти'] },
    { name: t('product.spec_group_display'), keys: ['Экран', 'Разрешение', 'Частота обновления'] },
    { name: t('product.spec_group_camera'), keys: ['Основная камера', 'Фронтальная камера'] },
    { name: t('product.spec_group_connectivity'), keys: ['SIM', 'NFC', 'Bluetooth', 'Wi-Fi'] },
    { name: t('product.spec_group_battery'), keys: ['Аккумулятор', 'Быстрая зарядка'] },
  ];

  const tabs: { id: TabType; label: string }[] = [
    { id: 'specs', label: t('product.specs') },
    { id: 'description', label: t('product.description') },
    { id: 'reviews', label: `${t('product.reviews')} (${reviews.length})` },
    { id: 'delivery', label: t('product.delivery') },
  ];

  const badgeLabel = (badge: string) => {
    switch (badge) {
      case 'sale': return `${t('product.badge_sale')} -${product.discount}%`;
      case 'popular': return t('product.badge_popular');
      case 'new': return t('product.badge_new');
      case 'limited': return t('product.badge_limited');
      default: return t('product.in_stock');
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-tech-bg-secondary border-b border-tech-border-subtle">
        <div className="container-main py-4">
          <div className="flex items-center gap-2 text-tech-text-muted text-sm">
            <Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link>
            <span>/</span>
            <Link to={`/catalog/${product.category}`} className="hover:text-white transition-colors">
              {categoryInfo ? t(`categories.${categoryInfo.slug}`, { defaultValue: categoryInfo.name }) : product.category}
            </Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Product Info */}
        <div className="grid lg:grid-cols-[55%_45%] gap-8 lg:gap-12">
          {/* Left - Images */}
          <div>
            <div className="bg-tech-bg-secondary rounded-2xl border border-tech-border-subtle aspect-square flex items-center justify-center relative overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="max-w-full max-h-full object-contain p-8"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                {product.badges.includes('sale') && <span className="badge-sale">-{product.discount}%</span>}
                {product.badges.includes('popular') && <span className="badge-popular">{t('product.badge_popular')}</span>}
                {product.badges.includes('new') && <span className="badge-popular bg-blue-500/15 text-blue-400">{t('product.badge_new')}</span>}
              </div>
            </div>
            <div className="flex gap-3 mt-4 justify-center">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                    selectedImage === i ? 'border-tech-accent-primary' : 'border-tech-border-subtle hover:border-tech-text-muted'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right - Details */}
          <div>
            <h1 className="text-h2 text-white mb-2">{product.name}</h1>
            <p className="text-tech-text-muted text-sm mb-3">
              {[product.specs['Экран'], product.specs['Основная камера'], product.specs['Оперативная память'], product.specs['SIM']].filter(Boolean).join(' | ')}
            </p>
            <StarRating rating={product.rating} showValue reviewCount={product.reviewCount} size={16} />

            <p className="text-tech-text-muted text-xs mt-3">{t('product.id_label')}: {product.id.toUpperCase()}</p>

            {/* Storage Selector */}
            {product.storageOptions.length > 0 && (
              <div className="mt-4">
                <span className="text-tech-text-secondary text-sm font-medium">{t('product.storage')}:</span>
                <div className="flex gap-2 mt-2">
                  {product.storageOptions.map((storage, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedStorage(i)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedStorage === i
                          ? 'bg-tech-accent-primary text-black border-tech-accent-primary'
                          : 'bg-tech-bg-tertiary text-tech-text-secondary border-tech-border-subtle hover:border-tech-text-muted'
                      }`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mt-8 p-6 bg-tech-bg-secondary rounded-2xl border border-tech-border-subtle">
              <div className="flex items-baseline gap-3 flex-wrap">
                {product.oldPrice && (
                  <span className="text-tech-text-muted text-lg line-through">{formatPrice(product.oldPrice)}</span>
                )}
                <span className="text-white font-bold text-3xl">{formatPrice(product.price)}</span>
                {product.discount && product.oldPrice && (
                  <span className="bg-tech-accent-secondary/15 text-tech-accent-secondary text-sm font-medium px-2 py-0.5 rounded">
                    {t('product.savings')} {formatPrice(product.oldPrice - product.price)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.monthlyPayment && (
                  <span className="bg-tech-accent-primary/10 text-tech-accent-primary text-sm px-3 py-1 rounded-lg">
                    {formatMonthlyPayment(product.price)}
                  </span>
                )}
                {product.cashback && (
                  <span className="bg-tech-success/10 text-tech-success text-sm px-3 py-1 rounded-lg">
                    {t('product.cashback')} {product.cashback.toLocaleString('ro-MD')} lei
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="mt-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-tech-success' : 'bg-tech-error'}`} />
                <span className={`text-sm ${product.stock > 0 ? 'text-tech-success' : 'text-tech-error'}`}>
                  {product.stock > 0
                    ? `${t('product.in_stock')} (${t('product.in_stock_count', { count: product.stock })})`
                    : t('product.out_of_stock')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-4"
                >
                  <ShoppingCart size={18} />
                  {t('product.buy')}
                </button>
                <button
                  onClick={() => {
                    toggleWishlist(product.id);
                    addToast(inWishlist ? 'info' : 'success', inWishlist ? t('product.removed_from_wishlist') : t('product.added_to_wishlist'));
                  }}
                  className={`w-14 h-14 flex items-center justify-center rounded-[10px] border transition-all ${
                    inWishlist
                      ? 'bg-tech-error/10 border-tech-error/30 text-tech-error'
                      : 'bg-tech-bg-tertiary border-tech-border-subtle text-tech-text-secondary hover:text-white'
                  }`}
                >
                  <Heart size={20} className={inWishlist ? 'fill-current' : ''} />
                </button>
                <button
                  onClick={() => toggleCompare(product.id)}
                  className={`w-14 h-14 flex items-center justify-center rounded-[10px] border transition-all ${
                    inCompare
                      ? 'bg-tech-accent-primary/10 border-tech-accent-primary/30 text-tech-accent-primary'
                      : 'bg-tech-bg-tertiary border-tech-border-subtle text-tech-text-secondary hover:text-white'
                  }`}
                >
                  <Scale size={20} />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <Truck size={24} className="mx-auto text-tech-accent-primary mb-2" />
                <span className="text-tech-text-secondary text-xs">{t('product.free_delivery')}</span>
              </div>
              <div className="text-center">
                <Shield size={24} className="mx-auto text-tech-accent-primary mb-2" />
                <span className="text-tech-text-secondary text-xs">{t('product.warranty')}</span>
              </div>
              <div className="text-center">
                <RotateCcw size={24} className="mx-auto text-tech-accent-primary mb-2" />
                <span className="text-tech-text-secondary text-xs">{t('product.return_days')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12 bg-tech-bg-secondary rounded-2xl border border-tech-border-subtle p-6 md:p-8">
          <div className="flex gap-1 bg-tech-bg-tertiary rounded-xl p-1 mb-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-tech-accent-primary text-black'
                    : 'text-tech-text-secondary hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'specs' && (
                isAdmin
                  ? <SpecsEditor product={product} specGroups={specGroups} onSave={updateProductInStore} />
                  : <SpecsView product={product} specGroups={specGroups} />
              )}

              {activeTab === 'description' && (
                <div>
                  {isAdmin
                    ? <DescriptionEditor product={product} onSave={updateProductInStore} />
                    : <p className="text-tech-text-secondary leading-relaxed">{product.description || t('product.no_description')}</p>
                  }
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {product.badges.map(badge => (
                      <div key={badge} className="bg-tech-bg-tertiary rounded-xl p-4 text-center">
                        <span className="text-tech-accent-primary text-2xl font-bold">
                          {badge === 'sale' ? `-${product.discount}%` : badge === 'popular' ? '★' : '✓'}
                        </span>
                        <p className="text-tech-text-secondary text-xs mt-1">{badgeLabel(badge)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {reviews.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-tech-text-muted">{t('product.no_reviews')}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map(review => (
                        <div key={review.id} className="border-b border-tech-border-subtle pb-6 last:border-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-tech-accent-primary/20 flex items-center justify-center text-tech-accent-primary font-semibold text-sm">
                              {review.userName.charAt(0)}
                            </div>
                            <div>
                              <span className="text-white font-medium text-sm">{review.userName}</span>
                              <div className="flex items-center gap-2">
                                <StarRating rating={review.rating} size={12} />
                                <span className="text-tech-text-muted text-xs">
                                  {new Date(review.createdAt).toLocaleDateString('ro-MD')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-tech-text-secondary text-sm leading-relaxed">{review.text}</p>
                          <button className="text-tech-text-muted text-xs mt-3 hover:text-tech-accent-primary transition-colors">
                            {t('product.helpful_btn', { count: review.helpful })}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Truck size={24} className="text-tech-accent-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">{t('product.delivery_courier')}</h4>
                      <p className="text-tech-text-secondary text-sm">{t('product.delivery_courier_desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full border-2 border-tech-accent-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-tech-accent-primary text-xs font-bold">P</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">{t('product.delivery_pickup')}</h4>
                      <p className="text-tech-text-secondary text-sm">{t('product.delivery_pickup_desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full border-2 border-tech-accent-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-tech-accent-primary text-xs font-bold">M</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">{t('product.delivery_store')}</h4>
                      <p className="text-tech-text-secondary text-sm">{t('product.delivery_store_desc')}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-h2 text-white mb-8">{t('product.related')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== SPECS UTILS ===================== */
type SpecGroup = { name: string; keys: string[] };

const SECTION_DELIMITER = '::';

// Parse a spec key into { section, name }. Custom sections live in the key as "Section::Name".
function parseSpecKey(rawKey: string): { section: string | null; name: string } {
  const idx = rawKey.indexOf(SECTION_DELIMITER);
  if (idx === -1) return { section: null, name: rawKey };
  return { section: rawKey.slice(0, idx).trim(), name: rawKey.slice(idx + SECTION_DELIMITER.length).trim() };
}

function joinSpecKey(section: string, name: string): string {
  const s = section.trim();
  const n = name.trim();
  return s ? `${s}${SECTION_DELIMITER}${n}` : n;
}

// Group specs into: { groupName: [{rawKey, displayName, value}] }
function groupSpecs(
  specs: Record<string, string>,
  specGroups: SpecGroup[],
  otherLabel: string
): { name: string; rows: { rawKey: string; displayName: string; value: string }[] }[] {
  const result: Record<string, { rawKey: string; displayName: string; value: string }[]> = {};
  const order: string[] = [];

  const pushTo = (groupName: string, row: { rawKey: string; displayName: string; value: string }) => {
    if (!result[groupName]) { result[groupName] = []; order.push(groupName); }
    result[groupName].push(row);
  };

  // Standard hardcoded groups first (for legacy keys without delimiter)
  specGroups.forEach(g => {
    g.keys.forEach(k => {
      if (specs[k] !== undefined && !k.includes(SECTION_DELIMITER)) {
        pushTo(g.name, { rawKey: k, displayName: k, value: specs[k] });
      }
    });
  });

  // Then custom-prefixed keys + remaining keys (Other)
  const standardKeys = new Set(specGroups.flatMap(g => g.keys));
  Object.keys(specs).forEach(k => {
    if (standardKeys.has(k) && !k.includes(SECTION_DELIMITER)) return;
    const { section, name } = parseSpecKey(k);
    const groupName = section || otherLabel;
    pushTo(groupName, { rawKey: k, displayName: name, value: specs[k] });
  });

  return order.map(name => ({ name, rows: result[name] }));
}

/* ===================== SPECS VIEW (read-only) ===================== */
function SpecsView({ product, specGroups }: { product: Product; specGroups: SpecGroup[] }) {
  const { t } = useTranslation();
  const grouped = groupSpecs(product.specs, specGroups, t('product.spec_group_other'));

  if (grouped.length === 0) {
    return <p className="text-tech-text-muted text-sm">{t('product.no_specs')}</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-x-12 gap-y-1">
      {grouped.map(group => (
        <div key={group.name} className="mb-6">
          <h4 className="text-white font-semibold mb-3">{group.name}</h4>
          <div className="space-y-2">
            {group.rows.map(row => (
              <div key={row.rawKey} className="flex justify-between py-2 border-b border-tech-border-subtle">
                <span className="text-tech-text-secondary text-sm">{row.displayName}</span>
                <span className="text-white text-sm font-medium text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===================== SPECS EDITOR (admin only) ===================== */
function SpecsEditor({
  product,
  specGroups,
  onSave,
}: {
  product: Product;
  specGroups: SpecGroup[];
  onSave: (id: string, data: Partial<Product>) => Promise<void>;
}) {
  const { t } = useTranslation();
  const addToast = useToastStore(s => s.addToast);
  const [editing, setEditing] = useState<string | null>(null);
  const [editSection, setEditSection] = useState('');
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [newSection, setNewSection] = useState('');
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);

  const grouped = groupSpecs(product.specs, specGroups, t('product.spec_group_other'));

  // Collect existing custom section names (from keys containing the delimiter) for the datalist
  const existingSections = Array.from(
    new Set(
      Object.keys(product.specs)
        .map(k => parseSpecKey(k).section)
        .filter((s): s is string => !!s)
    )
  );

  const persist = async (specs: Record<string, string>) => {
    setSaving(true);
    try {
      await onSave(product.id, { specs });
      addToast('success', t('admin.product_saved'));
    } catch {
      addToast('error', t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (rawKey: string) => {
    const { section, name } = parseSpecKey(rawKey);
    setEditing(rawKey);
    setEditSection(section || '');
    setEditName(name);
    setEditValue(product.specs[rawKey] ?? '');
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditSection('');
    setEditName('');
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editing) return;
    const trimmedName = editName.trim();
    const trimmedValue = editValue.trim();
    if (!trimmedName || !trimmedValue) {
      addToast('error', t('product.specs_required'));
      return;
    }
    const newKey = joinSpecKey(editSection, trimmedName);
    const newSpecs = { ...product.specs };
    if (newKey !== editing) delete newSpecs[editing];
    newSpecs[newKey] = trimmedValue;
    await persist(newSpecs);
    cancelEdit();
  };

  const removeSpec = async (rawKey: string) => {
    if (!confirm(t('product.specs_remove_confirm'))) return;
    const newSpecs = { ...product.specs };
    delete newSpecs[rawKey];
    await persist(newSpecs);
  };

  const addSpec = async () => {
    const trimmedName = newName.trim();
    const trimmedValue = newValue.trim();
    if (!trimmedName || !trimmedValue) {
      addToast('error', t('product.specs_required'));
      return;
    }
    const newKey = joinSpecKey(newSection, trimmedName);
    const newSpecs = { ...product.specs, [newKey]: trimmedValue };
    await persist(newSpecs);
    setNewSection('');
    setNewName('');
    setNewValue('');
    setAdding(false);
  };

  const renderRow = (row: { rawKey: string; displayName: string; value: string }) => {
    if (editing === row.rawKey) {
      return (
        <div key={row.rawKey} className="py-2 border-b border-tech-border-subtle">
          <div className="grid grid-cols-12 gap-2">
            <input
              list="spec-sections"
              value={editSection}
              onChange={e => setEditSection(e.target.value)}
              placeholder={t('product.specs_section')}
              className="input-base col-span-4 text-sm"
            />
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder={t('product.specs_key')}
              className="input-base col-span-4 text-sm"
            />
            <input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              placeholder={t('product.specs_value')}
              className="input-base col-span-3 text-sm"
            />
            <div className="col-span-1 flex gap-1 justify-end">
              <button onClick={saveEdit} disabled={saving} className="p-1.5 text-tech-success hover:bg-tech-success/10 rounded-lg transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              </button>
              <button onClick={cancelEdit} disabled={saving} className="p-1.5 text-tech-text-muted hover:bg-tech-bg-tertiary rounded-lg transition-colors">
                <XIcon size={14} />
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div key={row.rawKey} className="flex items-center gap-2 py-2 border-b border-tech-border-subtle group">
        <span className="text-tech-text-secondary text-sm flex-1">{row.displayName}</span>
        <span className="text-white text-sm font-medium">{row.value}</span>
        <button
          onClick={() => startEdit(row.rawKey)}
          className="p-1 text-tech-text-muted hover:text-tech-accent-primary opacity-0 group-hover:opacity-100 transition-all"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => removeSpec(row.rawKey)}
          className="p-1 text-tech-text-muted hover:text-tech-error opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  };

  return (
    <div>
      <datalist id="spec-sections">
        {existingSections.map(s => <option key={s} value={s} />)}
      </datalist>

      <div className="flex items-center justify-between mb-4">
        <span className="text-tech-accent-primary text-xs font-semibold uppercase tracking-wider">
          {t('product.specs_admin_mode')}
        </span>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-sm text-tech-accent-primary hover:underline"
          >
            <Plus size={14} />
            {t('product.specs_add')}
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-6 p-4 bg-tech-bg-tertiary rounded-xl border border-tech-accent-primary/30">
          <div className="grid grid-cols-12 gap-2">
            <input
              list="spec-sections"
              value={newSection}
              onChange={e => setNewSection(e.target.value)}
              placeholder={t('product.specs_section_placeholder')}
              className="input-base col-span-4 text-sm"
              autoFocus
            />
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={t('product.specs_key')}
              className="input-base col-span-4 text-sm"
            />
            <input
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder={t('product.specs_value')}
              className="input-base col-span-2 text-sm"
            />
            <div className="col-span-2 flex gap-1">
              <button onClick={addSpec} disabled={saving} className="btn-primary px-3 text-sm flex-1 flex items-center justify-center gap-1">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              </button>
              <button onClick={() => { setAdding(false); setNewSection(''); setNewName(''); setNewValue(''); }} className="btn-secondary px-3 text-sm">
                <XIcon size={14} />
              </button>
            </div>
          </div>
          <p className="text-tech-text-muted text-xs mt-2">{t('product.specs_section_hint')}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-x-12 gap-y-1">
        {grouped.map(group => (
          <div key={group.name} className="mb-6">
            <h4 className="text-white font-semibold mb-3">{group.name}</h4>
            <div className="space-y-1">
              {group.rows.map(renderRow)}
            </div>
          </div>
        ))}
        {grouped.length === 0 && !adding && (
          <p className="text-tech-text-muted text-sm col-span-full">{t('product.no_specs')}</p>
        )}
      </div>
    </div>
  );
}

/* ===================== DESCRIPTION EDITOR (admin only) ===================== */
function DescriptionEditor({
  product,
  onSave,
}: {
  product: Product;
  onSave: (id: string, data: Partial<Product>) => Promise<void>;
}) {
  const { t } = useTranslation();
  const addToast = useToastStore(s => s.addToast);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(product.description || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setValue(product.description || '');
  }, [product.description, editing]);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(product.id, { description: value });
      addToast('success', t('admin.product_saved'));
      setEditing(false);
    } catch {
      addToast('error', t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div>
        <span className="text-tech-accent-primary text-xs font-semibold uppercase tracking-wider mb-2 block">
          {t('product.description_admin_mode')}
        </span>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          className="input-base w-full h-40 resize-y text-sm"
          placeholder={t('product.description_placeholder')}
        />
        <div className="flex gap-2 mt-3">
          <button onClick={save} disabled={saving} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {t('admin.save')}
          </button>
          <button onClick={() => { setEditing(false); setValue(product.description || ''); }} className="btn-secondary px-4 py-2 text-sm">
            {t('admin.cancel')}
          </button>
          {product.description && (
            <button
              onClick={async () => {
                if (!confirm(t('product.description_remove_confirm'))) return;
                setValue('');
                await onSave(product.id, { description: '' });
                addToast('info', t('product.description_removed'));
                setEditing(false);
              }}
              className="ml-auto text-tech-error text-sm hover:underline flex items-center gap-1"
            >
              <Trash2 size={14} />
              {t('product.description_remove')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-tech-accent-primary text-xs font-semibold uppercase tracking-wider">
          {t('product.description_admin_mode')}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-sm text-tech-accent-primary hover:underline"
        >
          <Pencil size={14} />
          {product.description ? t('product.description_edit') : t('product.description_add')}
        </button>
      </div>
      <p className="text-tech-text-secondary leading-relaxed whitespace-pre-line">
        {product.description || <span className="italic text-tech-text-muted">{t('product.no_description')}</span>}
      </p>
    </div>
  );
}