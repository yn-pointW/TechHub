import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/stores/useCartStore';
import { useProductStore } from '@/stores/useProductStore';
import { formatPrice } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { t } = useTranslation();
  const { items, removeItem, updateQuantity, totalPrice, totalDiscount } = useCartStore();
  const getProductById = useProductStore(s => s.getProductById);
  const finalPrice = totalPrice();
  const discount = totalDiscount();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-[440px] bg-tech-bg-secondary border-l border-tech-border-subtle z-[70] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-tech-border-subtle">
              <h2 className="text-white font-semibold text-lg">
                {t('cart.title')}
                {items.length > 0 && (
                  <span className="text-tech-text-muted text-sm ml-2">({items.reduce((s, i) => s + i.quantity, 0)})</span>
                )}
              </h2>
              <button onClick={onClose} className="p-2 text-tech-text-secondary hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <ShoppingBag size={64} className="text-tech-text-muted mb-4" />
                <p className="text-white font-medium mb-2">{t('cart.empty')}</p>
                <p className="text-tech-text-muted text-sm text-center mb-6">{t('cart.empty_desc')}</p>
                <Link to="/catalog" onClick={onClose} className="btn-primary">
                  {t('cart.go_catalog')}
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {items.map(item => {
                    const product = getProductById(item.productId);
                    if (!product) return null;
                    const variantKey = `${item.productId}-${item.storage ?? ''}`;
                    return (
                      <div key={variantKey} className="flex gap-4 bg-tech-bg-tertiary/50 rounded-xl p-3">
                        <Link to={`/product/${item.productId}`} onClick={onClose} className="flex-shrink-0">
                          <img src={product.images[0]} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.productId}`} onClick={onClose}>
                            <p className="text-white text-sm font-medium line-clamp-2 hover:text-tech-accent-primary transition-colors">
                              {product.name}
                            </p>
                          </Link>
                          {item.storage && (
                            <p className="text-tech-text-muted text-xs mt-1">{t('cart.storage_label')}: {item.storage}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center bg-tech-bg-tertiary rounded-lg">
                              <button onClick={() => updateQuantity(item.productId, item.quantity - 1, null, item.storage)} className="p-1.5 text-tech-text-secondary hover:text-white transition-colors">
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-white text-sm">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.productId, item.quantity + 1, null, item.storage)} className="p-1.5 text-tech-text-secondary hover:text-white transition-colors">
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="text-white font-semibold text-sm">{formatPrice(product.price * item.quantity)}</span>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.productId, null, item.storage)} className="p-1 text-tech-text-muted hover:text-tech-error transition-colors self-start">
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-tech-border-subtle p-5 space-y-3">
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-tech-text-secondary">{t('cart.discount')}</span>
                      <span className="text-tech-accent-secondary">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-tech-text-secondary">{t('cart.total')}</span>
                    <span className="text-white font-bold text-xl">{formatPrice(finalPrice)}</span>
                  </div>
                  <Link to="/cart" onClick={onClose} className="block w-full btn-primary text-center">
                    {t('cart.checkout')}
                  </Link>
                  <button onClick={onClose} className="block w-full btn-secondary text-center text-sm">
                    {t('cart.continue_shopping')}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}