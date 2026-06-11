import { Link } from 'react-router-dom';
import { Heart, Scale, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/types';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCompareStore } from '@/stores/useCompareStore';
import { useToastStore } from '@/stores/useToastStore';
import PriceDisplay from './PriceDisplay';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useTranslation();
  const addItem = useCartStore(s => s.addItem);
  const { isInWishlist, toggle: toggleWishlist } = useWishlistStore();
  const { isInCompare, toggle: toggleCompare } = useCompareStore();
  const addToast = useToastStore(s => s.addToast);

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id);
    addToast('success', `${product.name} — ${t('product.added_to_cart')}`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    addToast(inWishlist ? 'info' : 'success', inWishlist ? t('product.removed_from_wishlist') : t('product.added_to_wishlist'));
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(product.id);
  };

  const getSpecsShort = () => {
    const specs = product.specs;
    const parts = [];
    if (specs['ОС']) parts.push(specs['ОС']);
    if (specs['Экран']) parts.push(specs['Экран']);
    if (specs['Основная камера']) parts.push(specs['Основная камера'].split(' ')[0] + ' MP');
    if (specs['Оперативная память']) parts.push(specs['Оперативная память']);
    if (specs['SIM']) parts.push(specs['SIM']);
    return parts.join(', ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="h-full"
    >
      <Link to={`/product/${product.id}`} className="group block h-full">
        <div className="card-base p-4 hover:-translate-y-1 hover:shadow-elevated hover:border-tech-border-active transition-all duration-300 h-full flex flex-col">
          {/* Image */}
          <div className="relative aspect-square bg-tech-bg-tertiary rounded-xl overflow-hidden mb-3 flex-shrink-0">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.badges.includes('popular') && <span className="badge-popular">{t('product.badge_popular')}</span>}
              {product.badges.includes('sale') && <span className="badge-sale">{t('product.badge_sale')}</span>}
              {product.badges.includes('limited') && <span className="badge-limited">{t('product.badge_limited')}</span>}
              {product.badges.includes('new') && <span className="badge-popular bg-blue-500/15 text-blue-400">{t('product.badge_new')}</span>}
              {product.badges.includes('credit0') && <span className="badge-popular bg-purple-500/15 text-purple-400">0%</span>}
            </div>
          </div>

          {/* Brand */}
          <span className="text-tech-accent-primary text-xs font-semibold uppercase tracking-wider mb-1 flex-shrink-0">
            #{product.brand}
          </span>

          {/* Name — fixed 2 lines, always same height */}
          <h3 className="text-white text-sm font-medium line-clamp-2 mb-1.5 group-hover:text-tech-accent-primary transition-colors" style={{ minHeight: '2.5rem' }}>
            {product.name}
          </h3>

          {/* Specs — fixed 1 line */}
          <p className="text-tech-text-muted text-xs mb-3 line-clamp-1 flex-shrink-0" style={{ minHeight: '1rem' }}>
            {getSpecsShort()}
          </p>

          {/* Price + actions pushed to bottom */}
          <div className="mt-auto">
            <PriceDisplay
              price={product.price}
              oldPrice={product.oldPrice}
              monthlyPayment={product.monthlyPayment}
              cashback={product.cashback}
              size="sm"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-tech-accent-primary text-black font-semibold text-sm py-2.5 rounded-[10px] hover:brightness-110 transition-all"
              >
                <ShoppingCart size={16} />
                {t('product.buy')}
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`w-10 h-10 flex items-center justify-center rounded-[10px] border transition-all ${
                  inWishlist
                    ? 'bg-tech-error/10 border-tech-error/30 text-tech-error'
                    : 'bg-tech-bg-tertiary border-tech-border-subtle text-tech-text-secondary hover:text-white'
                }`}
              >
                <Heart size={16} className={inWishlist ? 'fill-current' : ''} />
              </button>
              <button
                onClick={handleToggleCompare}
                className={`w-10 h-10 flex items-center justify-center rounded-[10px] border transition-all ${
                  inCompare
                    ? 'bg-tech-accent-primary/10 border-tech-accent-primary/30 text-tech-accent-primary'
                    : 'bg-tech-bg-tertiary border-tech-border-subtle text-tech-text-secondary hover:text-white'
                }`}
              >
                <Scale size={16} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}