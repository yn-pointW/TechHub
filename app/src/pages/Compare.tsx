import { Link } from 'react-router-dom';
import { Scale, X, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCompareStore } from '@/stores/useCompareStore';
import { useCartStore } from '@/stores/useCartStore';
import { useToastStore } from '@/stores/useToastStore';
import { useProductStore } from '@/stores/useProductStore';
import { formatPrice } from '@/lib/utils';
import StarRating from '@/components/StarRating';

export default function Compare() {
  const { t } = useTranslation();
  const { productIds, removeProduct, clear } = useCompareStore();
  const addItem = useCartStore(s => s.addItem);
  const addToast = useToastStore(s => s.addToast);
  const allProducts = useProductStore(s => s.products);

  const compareProducts = allProducts.filter(p => productIds.includes(p.id));
  const allSpecs = Array.from(new Set(compareProducts.flatMap(p => Object.keys(p.specs))));

  if (compareProducts.length === 0) {
    return (
      <div className="container-main py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <Scale size={80} className="mx-auto text-tech-text-muted mb-6" />
          <h1 className="text-h2 text-white mb-3">{t('compare.empty_title')}</h1>
          <p className="text-tech-text-secondary mb-8">{t('compare.empty_desc')}</p>
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
          {t('compare.title')}
          <span className="text-tech-text-muted text-lg font-normal ml-3">({compareProducts.length})</span>
        </h1>
        <button onClick={clear} className="text-tech-text-muted hover:text-tech-error text-sm transition-colors">
          {t('compare.clear')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="text-left p-4 w-48 bg-tech-bg-secondary rounded-tl-xl"></th>
              {compareProducts.map(product => (
                <th key={product.id} className="p-4 bg-tech-bg-secondary min-w-[200px]">
                  <div className="relative">
                    <button onClick={() => removeProduct(product.id)} className="absolute -top-2 -right-2 p-1 text-tech-text-muted hover:text-tech-error transition-colors">
                      <X size={16} />
                    </button>
                    <Link to={`/product/${product.id}`}>
                      <div className="aspect-square bg-tech-bg-tertiary rounded-xl overflow-hidden mb-3">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-white text-sm font-medium line-clamp-2 hover:text-tech-accent-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 bg-tech-bg-secondary/50 text-tech-text-secondary text-sm font-medium">{t('compare.price')}</td>
              {compareProducts.map(product => (
                <td key={product.id} className="p-4 bg-tech-bg-secondary/30">
                  <span className="text-white font-bold">{formatPrice(product.price)}</span>
                  {product.oldPrice && (
                    <span className="text-tech-text-muted text-sm line-through ml-2">{formatPrice(product.oldPrice)}</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 bg-tech-bg-secondary/50 text-tech-text-secondary text-sm font-medium">{t('compare.rating')}</td>
              {compareProducts.map(product => (
                <td key={product.id} className="p-4 bg-tech-bg-secondary/30">
                  <StarRating rating={product.rating} showValue reviewCount={product.reviewCount} />
                </td>
              ))}
            </tr>
            {allSpecs.slice(0, 15).map((specKey, i) => (
              <tr key={specKey}>
                <td className="p-4 bg-tech-bg-secondary/50 text-tech-text-secondary text-sm font-medium">{specKey}</td>
                {compareProducts.map(product => (
                  <td key={product.id} className={`p-4 ${i % 2 === 0 ? 'bg-tech-bg-secondary/30' : 'bg-tech-bg-secondary/10'}`}>
                    <span className="text-white text-sm">{product.specs[specKey] || '—'}</span>
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-4 bg-tech-bg-secondary/50 rounded-bl-xl"></td>
              {compareProducts.map(product => (
                <td key={product.id} className="p-4 bg-tech-bg-secondary/30">
                  <button
                    onClick={() => { addItem(product.id); addToast('success', `${product.name} ${t('product.added_to_cart')}`); }}
                    className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    {t('product.add_to_cart')}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}