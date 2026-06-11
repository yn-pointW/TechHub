import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { ordersApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import { Package, User, MapPin, LogOut, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Tab = 'orders' | 'settings' | 'addresses';

export default function UserProfile() {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    ordersApi.myOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  const statusStyles: Record<OrderStatus, { label: string; color: string }> = {
    new: { label: t('admin.status_new'), color: 'bg-blue-500/15 text-blue-400' },
    processing: { label: t('admin.status_processing'), color: 'bg-tech-warning/15 text-tech-warning' },
    shipped: { label: t('admin.status_shipped'), color: 'bg-purple-500/15 text-purple-400' },
    delivered: { label: t('admin.status_delivered'), color: 'bg-tech-success/15 text-tech-success' },
    cancelled: { label: t('admin.status_cancelled'), color: 'bg-tech-error/15 text-tech-error' },
  };

  const tabs = [
    { id: 'orders' as Tab, label: t('profile.orders_tab'), icon: Package },
    { id: 'settings' as Tab, label: t('profile.settings_tab'), icon: User },
    { id: 'addresses' as Tab, label: t('profile.addresses_tab'), icon: MapPin },
  ];

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ city: '', street: '', building: '', apartment: '' });

  const handleSaveSettings = () => {
    updateUser(formData);
    addToast('success', t('profile.data_saved'));
  };

  const handleAddAddress = () => {
    if (!newAddress.city || !newAddress.street || !newAddress.building) {
      addToast('error', t('profile.fill_required'));
      return;
    }
    const address = {
      id: `addr_${Date.now()}`,
      ...newAddress,
      isDefault: user?.addresses.length === 0,
    };
    updateUser({ addresses: [...(user?.addresses || []), address] });
    setShowAddressForm(false);
    setNewAddress({ city: '', street: '', building: '', apartment: '' });
    addToast('success', t('profile.address_added'));
  };

  const handleDeleteAddress = (id: string) => {
    updateUser({ addresses: user?.addresses.filter(a => a.id !== id) || [] });
    addToast('info', t('profile.address_removed'));
  };

  return (
    <div className="container-main py-8">
      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-tech-bg-secondary border border-tech-border-subtle rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-tech-accent-primary/20 flex items-center justify-center text-tech-accent-primary font-bold text-xl">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-white font-semibold">{user?.name}</p>
                <p className="text-tech-text-muted text-xs">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-tech-bg-tertiary text-white border-l-[3px] border-tech-accent-primary'
                      : 'text-tech-text-secondary hover:text-white hover:bg-tech-bg-tertiary/50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-tech-text-secondary hover:text-tech-error hover:bg-tech-bg-tertiary/50 transition-all"
            >
              <LogOut size={18} />
              {t('nav.logout')}
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div>
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-h2 text-white mb-6">{t('profile.orders_tab')}</h2>
              {orders.length === 0 ? (
                <p className="text-tech-text-muted">{t('profile.no_orders')}</p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="card-base p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                          <span className="text-white font-semibold">
                            {t('profile.order_num', { id: order.id.split('-')[1] || order.id })}
                          </span>
                          <span className="text-tech-text-muted text-sm ml-3">
                            {new Date(order.createdAt).toLocaleDateString('ro-MD')}
                          </span>
                        </div>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyles[order.status].color}`}>
                          {statusStyles[order.status].label}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm line-clamp-1">{item.name}</p>
                              <p className="text-tech-text-muted text-xs">{item.quantity} {t('common.pcs')}.</p>
                            </div>
                            <span className="text-white font-medium text-sm">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-tech-border-subtle mt-4 pt-4 flex items-center justify-between">
                        <span className="text-tech-text-muted text-sm">
                          {t('profile.delivery_to')} {order.deliveryAddress.city}, {order.deliveryAddress.street}, {order.deliveryAddress.building}
                        </span>
                        <span className="text-white font-bold">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-h2 text-white mb-6">{t('profile.settings_tab')}</h2>
              <div className="card-base p-6 max-w-lg">
                <div className="space-y-4">
                  <div>
                    <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('profile.name')}</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-base w-full" />
                  </div>
                  <div>
                    <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('profile.email')}</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      disabled
                      className="input-base w-full opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('profile.phone')}</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input-base w-full" />
                  </div>
                  <button onClick={handleSaveSettings} className="btn-primary w-full py-3">
                    {t('profile.save_changes')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-h2 text-white">{t('cart.delivery_address')}</h2>
                <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                  <Plus size={16} />
                  {t('profile.add_address')}
                </button>
              </div>

              {showAddressForm && (
                <div className="card-base p-6 mb-6">
                  <h3 className="text-white font-semibold mb-4">{t('profile.new_address')}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('profile.city')}</label>
                      <input type="text" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="input-base w-full" placeholder="Chișinău" />
                    </div>
                    <div>
                      <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('profile.street')}</label>
                      <input type="text" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} className="input-base w-full" placeholder="str. Ștefan cel Mare" />
                    </div>
                    <div>
                      <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('profile.building')}</label>
                      <input type="text" value={newAddress.building} onChange={e => setNewAddress({ ...newAddress, building: e.target.value })} className="input-base w-full" placeholder="1" />
                    </div>
                    <div>
                      <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('profile.apartment_opt')}</label>
                      <input type="text" value={newAddress.apartment} onChange={e => setNewAddress({ ...newAddress, apartment: e.target.value })} className="input-base w-full" placeholder="42" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleAddAddress} className="btn-primary py-2.5 px-6 text-sm">{t('common.save')}</button>
                    <button onClick={() => setShowAddressForm(false)} className="btn-secondary py-2.5 px-6 text-sm">{t('common.cancel')}</button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {user?.addresses.map(address => (
                  <div key={address.id} className="card-base p-5 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">
                          {address.city}, {address.street}, {address.building}
                        </span>
                        {address.isDefault && (
                          <span className="bg-tech-accent-primary/10 text-tech-accent-primary text-xs px-2 py-0.5 rounded">
                            {t('profile.default')}
                          </span>
                        )}
                      </div>
                      {address.apartment && (
                        <p className="text-tech-text-muted text-sm">ap. {address.apartment}</p>
                      )}
                    </div>
                    <button onClick={() => handleDeleteAddress(address.id)} className="p-2 text-tech-text-muted hover:text-tech-error transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )) || <p className="text-tech-text-muted">{t('profile.no_addresses')}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}