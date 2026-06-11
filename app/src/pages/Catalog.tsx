import { useState, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, LayoutGrid, List, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '@/stores/useProductStore';
import { formatPrice } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-mobile';
import type { Product, SortOption, ViewMode } from '@/types';
import ProductCard from '@/components/ProductCard';
import StarRating from '@/components/StarRating';

export default function Catalog() {
  const { t } = useTranslation();
  const { category, subcategory } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const filterParam = searchParams.get('filter') || '';

  const allProducts = useProductStore(s => s.products);
  const categories = useProductStore(s => s.categories);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 40000]);

  const currentCategory = useMemo(
    () => (category ? categories.find(c => c.slug === category) : null),
    [category, categories]
  );
  const currentSubcategory = currentCategory?.subcategories.find(s => s.slug === subcategory);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // By category — match by:
    //   1) exact category slug
    //   2) product.category equals a subcategory slug of this category (e.g. apple-watch under smartwatch)
    //   3) product.subcategory equals a subcategory slug of this category (e.g. iPhone has category=apple, subcategory=smartphone — show under telefoane)
    if (category) {
      const subSlugs = new Set(currentCategory?.subcategories.map(s => s.slug) ?? []);
      result = result.filter(p =>
        p.category === category ||
        subSlugs.has(p.category) ||
        subSlugs.has(p.subcategory)
      );
    }

    // By subcategory from URL
    if (subcategory) {
      result = result.filter(p => p.subcategory === subcategory || p.category === subcategory);
    }

    // By search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // By filter param
    if (filterParam === 'sale') {
      result = result.filter(p => p.oldPrice && p.oldPrice > p.price);
    } else if (filterParam === 'new') {
      result = result.filter(p => p.badges.includes('new'));
    } else if (filterParam === 'limited') {
      result = result.filter(p => p.badges.includes('limited'));
    }

    // By price range
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // By selected filters
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        result = result.filter(p => {
          if (key === 'brand') return values.includes(p.brand);
          if (key === 'rating') return values.some(v => p.rating >= Number(v));
          return true;
        });
      }
    });

    // Sort
    switch (sortBy) {
      case 'expensive':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'cheap':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'discount':
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'newest':
        result.sort((a, b) => (b.badges.includes('new') ? 1 : 0) - (a.badges.includes('new') ? 1 : 0));
        break;
      default:
        result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [allProducts, category, subcategory, currentCategory, searchQuery, filterParam, sortBy, priceRange, selectedFilters]);

  const toggleFilter = (groupId: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[groupId] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [groupId]: updated };
    });
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setPriceRange([0, 40000]);
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length +
    (priceRange[0] > 0 || priceRange[1] < 40000 ? 1 : 0);

  return (
    <div className="min-h-screen">
      {/* Category Header */}
      <div className="bg-tech-bg-secondary border-b border-tech-border-subtle">
        <div className="container-main py-8">
          <div className="flex items-center gap-2 text-tech-text-muted text-sm mb-3">
            <span>{t('catalog.home')}</span>
            <span>/</span>
            {currentCategory && <span>{t(`categories.${currentCategory.slug}`, { defaultValue: currentCategory.name })}</span>}
            {currentSubcategory && <><span>/</span><span>{t(`categories.${currentSubcategory.slug}`, { defaultValue: currentSubcategory.name })}</span></>}
            {!currentCategory && searchQuery && <span>{t('catalog.search_for', { query: searchQuery })}</span>}
          </div>
          <h1 className="text-h1 text-white mb-2">
            {currentSubcategory
              ? t(`categories.${currentSubcategory.slug}`, { defaultValue: currentSubcategory.name })
              : currentCategory
                ? t(`categories.${currentCategory.slug}`, { defaultValue: currentCategory.name })
                : searchQuery ? t('catalog.search_for', { query: searchQuery }) : t('catalog.all_products_title')}
          </h1>
          <p className="text-tech-text-secondary">{t('catalog.products_count', { count: filteredProducts.length })}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[t('catalog.tag_deals'), t('catalog.tag_popular'), t('catalog.tag_new'), t('catalog.tag_sale'), t('catalog.tag_in_stock')].map(tag => (
              <span key={tag} className="bg-tech-bg-tertiary text-tech-text-secondary text-xs px-3 py-1.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 btn-secondary text-sm lg:hidden"
            >
              <SlidersHorizontal size={16} />
              {t('catalog.filter_title')}
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-tech-accent-primary text-black text-xs rounded-full flex items-center justify-center font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-tech-bg-tertiary border border-tech-border-subtle rounded-lg px-4 py-2.5 text-sm text-white hover:border-tech-accent-primary/30 transition-colors">
                <span>{t('catalog.sort_dropdown')}</span>
                <ChevronDown size={14} />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-tech-bg-secondary border border-tech-border-subtle rounded-xl shadow-elevated py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                {[
                  { value: 'popular' as SortOption, label: t('catalog.sort_popular_s') },
                  { value: 'newest' as SortOption, label: t('catalog.sort_newest_s') },
                  { value: 'expensive' as SortOption, label: t('catalog.sort_expensive_s') },
                  { value: 'cheap' as SortOption, label: t('catalog.sort_cheap_s') },
                  { value: 'discount' as SortOption, label: t('catalog.sort_discount_s') },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      sortBy === opt.value ? 'text-tech-accent-primary bg-tech-accent-primary/10' : 'text-tech-text-secondary hover:text-white hover:bg-tech-bg-tertiary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-tech-text-muted text-sm">{t('catalog.products_count', { count: filteredProducts.length })}</span>
            <div className="flex bg-tech-bg-tertiary border border-tech-border-subtle rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-tech-accent-primary text-black' : 'text-tech-text-secondary hover:text-white'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-tech-accent-primary text-black' : 'text-tech-text-secondary hover:text-white'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <AnimatePresence>
            {(showFilters || isDesktop) && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className={`flex-shrink-0 ${showFilters ? 'fixed inset-y-0 left-0 z-50 bg-tech-bg-primary overflow-y-auto p-6 lg:relative lg:p-0 lg:bg-transparent' : 'hidden lg:block'}`}
                style={{ width: 280 }}
              >
                {showFilters && (
                  <button onClick={() => setShowFilters(false)} className="lg:hidden absolute top-4 right-4 text-tech-text-secondary">
                    <X size={24} />
                  </button>
                )}

                <div className="bg-tech-bg-secondary border border-tech-border-subtle rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">{t('catalog.filter_title')}</h3>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-tech-accent-primary text-sm hover:underline">
                        {t('catalog.clear_filters')}
                      </button>
                    )}
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="text-tech-text-secondary text-sm font-medium mb-3">{t('catalog.price_label')}</h4>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full bg-tech-bg-tertiary border border-tech-border-subtle rounded-lg px-3 py-2 text-sm text-white"
                        placeholder={t('catalog.price_from_ph')}
                      />
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full bg-tech-bg-tertiary border border-tech-border-subtle rounded-lg px-3 py-2 text-sm text-white"
                        placeholder={t('catalog.price_to_ph')}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40000}
                      step={500}
                      value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full accent-tech-accent-primary"
                    />
                  </div>

                  {/* Brand Filter */}
                  <div className="mb-6">
                    <h4 className="text-tech-text-secondary text-sm font-medium mb-3">{t('catalog.brand_label')}</h4>
                    <div className="space-y-2">
                      {['Samsung', 'Apple', 'Xiaomi', 'Realme', 'Motorola', 'Sony'].map(brand => {
                        const checked = (selectedFilters['brand'] || []).includes(brand);
                        return (
                          <label key={brand} className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              checked ? 'bg-tech-accent-primary border-tech-accent-primary' : 'border-tech-text-muted'
                            }`}>
                              {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleFilter('brand', brand)}
                              className="hidden"
                            />
                            <span className="text-tech-text-secondary text-sm">{brand}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <h4 className="text-tech-text-secondary text-sm font-medium mb-3">{t('catalog.rating_label')}</h4>
                    <div className="space-y-2">
                      {[4, 3, 2].map(rating => (
                        <label key={rating} className="flex items-center gap-2 cursor-pointer">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            (selectedFilters['rating'] || []).includes(String(rating)) ? 'border-tech-accent-primary' : 'border-tech-text-muted'
                          }`}>
                            {(selectedFilters['rating'] || []).includes(String(rating)) && <div className="w-2 h-2 rounded-full bg-tech-accent-primary" />}
                          </div>
                          <input
                            type="radio"
                            name="rating"
                            checked={(selectedFilters['rating'] || []).includes(String(rating))}
                            onChange={() => setSelectedFilters(prev => ({ ...prev, rating: [String(rating)] }))}
                            className="hidden"
                          />
                          <StarRating rating={rating} size={12} showValue />
                          <span className="text-tech-text-muted text-xs">{t('catalog.rating_above')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid/List */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-tech-text-muted text-lg">{t('catalog.no_results')}</p>
                <p className="text-tech-text-muted text-sm mt-1">{t('catalog.empty_filters')}</p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    {filteredProducts.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i % 8} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product, i) => (
                      <ProductListItem key={product.id} product={product} index={i} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex justify-center mt-10 gap-2">
                <button className="w-10 h-10 rounded-full bg-tech-bg-tertiary text-tech-text-secondary hover:bg-tech-bg-secondary flex items-center justify-center transition-colors">
                  &lt;
                </button>
                {[1, 2, 3].map(page => (
                  <button
                    key={page}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      page === 1 ? 'bg-tech-accent-primary text-black font-semibold' : 'bg-tech-bg-tertiary text-tech-text-secondary hover:bg-tech-bg-secondary'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="w-10 h-10 rounded-full bg-tech-bg-tertiary text-tech-text-secondary hover:bg-tech-bg-secondary flex items-center justify-center transition-colors">
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductListItem({ product, index }: { product: Product; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 5) * 0.05 }}
    >
      <Link to={`/product/${product.id}`} className="card-base p-4 flex gap-4 hover:border-tech-border-active transition-all group block">
        <div className="w-32 h-32 bg-tech-bg-tertiary rounded-xl overflow-hidden flex-shrink-0">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-tech-accent-primary text-xs font-semibold uppercase">#{product.brand}</span>
          <h3 className="text-white font-medium mt-1 group-hover:text-tech-accent-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <StarRating rating={product.rating} showValue reviewCount={product.reviewCount} />
          <p className="text-tech-text-muted text-sm mt-1 line-clamp-1">
            {product.specs['ОС']}, {product.specs['Экран']}, {product.specs['Оперативная память']}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-white font-bold text-lg">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-tech-text-muted line-through text-sm">{formatPrice(product.oldPrice)}</span>
            )}
            {product.discount && (
              <span className="bg-tech-accent-secondary/15 text-tech-accent-secondary text-xs px-2 py-0.5 rounded">-{product.discount}%</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
