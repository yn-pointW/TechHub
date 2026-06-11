import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, X, Tag, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/stores/useCartStore';
import { useProductStore } from '@/stores/useProductStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { ordersApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function Cart() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalPrice, totalDiscount, clearCart } = useCartStore();
  const getProductById = useProductStore(s => s.getProductById);
  const { isAuthenticated, user } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({
    city: user?.addresses?.[0]?.city || '',
    street: user?.addresses?.[0]?.street || '',
    building: user?.addresses?.[0]?.building || '',
    apartment: user?.addresses?.[0]?.apartment || '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

  const finalPrice = totalPrice();
  const discount = totalDiscount();
  const promoDiscount = promoApplied ? Math.round(finalPrice * 0.1) : 0;
  const totalWithPromo = finalPrice - promoDiscount;

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'sale10') {
      setPromoApplied(true);
      addToast('success', t('cart.promo_applied'));
    } else {
      addToast('error', t('cart.promo_invalid'));
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      addToast('error', t('cart.login_required'));
      navigate('/login');
      return;
    }
    setShowCheckout(true);
  };

  const handlePlaceOrder = async () => {
    if (!address.city || !address.street || !address.building) {
      addToast('error', t('profile.fill_required'));
      return;
    }
    setPlacing(true);
    try {
      const orderItems = items.map(item => {
        const product = getProductById(item.productId);
        return {
          productId: item.productId,
          name: product?.name || '',
          image: product?.images[0] || '',
          price: product?.price || 0,
          quantity: item.quantity,
          color: null,
          storage: item.storage,
        };
      });
      await ordersApi.create({
        items: orderItems,
        total: totalWithPromo,
        discount: discount + promoDiscount,
        deliveryAddress: address,
        paymentMethod: paymentMethod === 'card' ? t('cart.pay_card') : t('cart.pay_cash'),
      });
      clearCart();
      setShowCheckout(false);
      addToast('success', t('cart.order_success'));
      navigate('/profile');
    } catch {
      addToast('error', t('common.error'));
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-main py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <ShoppingBag size={80} className="mx-auto text-tech-text-muted mb-6" />
          <h1 className="text-h2 text-white mb-3">{t('cart.empty')}</h1>
          <p className="text-tech-text-secondary mb-8">{t('cart.empty_desc')}</p>
          <Link to="/catalog" className="btn-primary inline-flex items-center gap-2">
            {t('cart.go_catalog')}
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="container-main py-8">
        <h1 className="text-h1 text-white mb-8">
          {t('cart.title')}
          <span className="text-tech-text-muted text-lg font-normal ml-3">
            ({items.reduce((s, i) => s + i.quantity, 0)} {t('common.pcs')})
          </span>
        </h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item, index) => {
              const product = getProductById(item.productId);
              if (!product) return null;
              const variantKey = `${item.productId}-${item.storage ?? ''}`;
              return (
                <motion.div
                  key={variantKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-base p-4 flex gap-4"
                >
                  <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                    <div className="w-24 h-24 bg-tech-bg-tertiary rounded-xl overflow-hidden">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.productId}`}>
                      <h3 className="text-white font-medium hover:text-tech-accent-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    {item.storage && <p className="text-tech-text-muted text-xs mt-1">{t('cart.storage_label')}: {item.storage}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-tech-bg-tertiary rounded-lg">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1, null, item.storage)} className="p-2 text-tech-text-secondary hover:text-white transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-white font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1, null, item.storage)} className="p-2 text-tech-text-secondary hover:text-white transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">{formatPrice(product.price * item.quantity)}</span>
                        {product.oldPrice && (
                          <span className="text-tech-text-muted text-sm line-through ml-2">
                            {formatPrice(product.oldPrice * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.productId, null, item.storage)} className="p-2 text-tech-text-muted hover:text-tech-error transition-colors self-start">
                    <X size={18} />
                  </button>
                </motion.div>
              );
            })}
            <div className="flex justify-between items-center pt-4">
              <Link to="/catalog" className="text-tech-accent-primary text-sm hover:underline flex items-center gap-1">
                <ArrowRight size={14} className="rotate-180" />
                {t('cart.continue_shopping')}
              </Link>
              <button
                onClick={() => { clearCart(); addToast('info', t('cart.cart_cleared')); }}
                className="text-tech-text-muted text-sm hover:text-tech-error transition-colors"
              >
                {t('cart.clear')}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="card-base p-6">
              <h2 className="text-h3 text-white mb-6">{t('cart.total')}</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-tech-text-secondary">{t('common.pcs')} ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span className="text-white">{formatPrice(finalPrice + discount)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-tech-text-secondary">{t('cart.discount')}</span>
                    <span className="text-tech-accent-secondary">-{formatPrice(discount)}</span>
                  </div>
                )}
                {promoApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-tech-text-secondary">SALE10</span>
                    <span className="text-tech-accent-secondary">-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-tech-text-secondary">{t('cart.delivery')}</span>
                  <span className="text-tech-success">{t('cart.free')}</span>
                </div>
              </div>
              <div className="border-t border-tech-border-subtle pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">{t('cart.to_pay')}</span>
                  <span className="text-white font-bold text-2xl">{formatPrice(totalWithPromo)}</span>
                </div>
              </div>
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tech-text-muted" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    placeholder={t('cart.promo_placeholder')}
                    className="w-full bg-tech-bg-tertiary border border-tech-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-tech-text-muted outline-none focus:border-tech-accent-primary"
                    disabled={promoApplied}
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  disabled={promoApplied || !promoCode}
                  className="px-4 py-2.5 bg-tech-bg-tertiary border border-tech-border-subtle rounded-lg text-sm text-tech-text-secondary hover:text-white hover:border-tech-accent-primary transition-all disabled:opacity-50"
                >
                  {promoApplied ? '✓' : t('cart.promo_apply')}
                </button>
              </div>
              <button onClick={handleCheckout} className="w-full btn-primary py-4 text-base">
                {t('cart.checkout')}
              </button>
              <button className="w-full btn-secondary mt-3 text-sm">
                {t('cart.credit')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60]"
              onClick={() => !placing && setShowCheckout(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            >
              <div className="bg-tech-bg-secondary border border-tech-border-subtle rounded-2xl p-6 w-full max-w-md shadow-elevated">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-semibold text-lg">{t('cart.checkout_modal_title')}</h2>
                  <button onClick={() => setShowCheckout(false)} className="text-tech-text-muted hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-tech-text-secondary text-sm font-medium">{t('cart.delivery_address')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-tech-text-muted text-xs mb-1 block">{t('cart.city')} *</label>
                      <input
                        value={address.city}
                        onChange={e => setAddress({ ...address, city: e.target.value })}
                        className="input-base w-full"
                        placeholder="Chișinău"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-tech-text-muted text-xs mb-1 block">{t('cart.street')} *</label>
                      <input
                        value={address.street}
                        onChange={e => setAddress({ ...address, street: e.target.value })}
                        className="input-base w-full"
                        placeholder="str. Ștefan cel Mare"
                      />
                    </div>
                    <div>
                      <label className="text-tech-text-muted text-xs mb-1 block">{t('cart.building')} *</label>
                      <input
                        value={address.building}
                        onChange={e => setAddress({ ...address, building: e.target.value })}
                        className="input-base w-full"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="text-tech-text-muted text-xs mb-1 block">{t('cart.apartment')}</label>
                      <input
                        value={address.apartment}
                        onChange={e => setAddress({ ...address, apartment: e.target.value })}
                        className="input-base w-full"
                        placeholder="42"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-tech-text-secondary text-sm font-medium mb-2">{t('cart.payment_method')}</h3>
                    <div className="flex gap-3">
                      {(['card', 'cash'] as const).map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            paymentMethod === method
                              ? 'border-tech-accent-primary bg-tech-accent-primary/10 text-tech-accent-primary'
                              : 'border-tech-border-subtle text-tech-text-secondary hover:text-white'
                          }`}
                        >
                          {method === 'card' ? t('cart.pay_card') : t('cart.pay_cash')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-tech-border-subtle pt-4 flex justify-between items-center">
                    <span className="text-white font-semibold">{t('cart.to_pay')}</span>
                    <span className="text-white font-bold text-xl">{formatPrice(totalWithPromo)}</span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {placing ? <><Loader2 size={18} className="animate-spin" /> {t('cart.placing')}</> : t('cart.place_order')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}