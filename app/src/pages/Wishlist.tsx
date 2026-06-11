import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useProductStore } from '@/stores/useProductStore';
import ProductCard from '@/components/ProductCard';

export default function Wishlist() {
  const { t } = useTranslation();
  const { productIds, clear } = useWishlistStore();
  const allProducts = useProductStore(s => s.products);
  const wishlistProducts = allProducts.filter(p => productIds.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="container-main py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <Heart size={80} className="mx-auto text-tech-text-muted mb-6" />
          <h1 className="text-h2 text-white mb-3">{t('wishlist.empty_title')}</h1>
          <p className="text-tech-text-secondary mb-8">{t('wishlist.empty_desc')}</p>
          <Link to="/catalog" className="btn-primary inline-flex items-center gap-2">
            {t('cart.go_catalog')}
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-h1 text-white">
          {t('wishlist.title')}
          <span className="text-tech-text-muted text-lg font-normal ml-3">({wishlistProducts.length})</span>
        </h1>
        <button onClick={clear} className="text-tech-text-muted hover:text-tech-error text-sm transition-colors">
          {t('wishlist.clear')}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {wishlistProducts.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i % 8} />
        ))}
      </div>
    </div>
  );
}