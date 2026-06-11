import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, Scale, ShoppingCart, User, Menu, X, ChevronDown, LogOut, LayoutDashboard, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { iconMap } from './CategoryIcon';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCompareStore } from '@/stores/useCompareStore';
import { useProductStore } from '@/stores/useProductStore';
import { setLanguage } from '@/i18n';
import CartDrawer from './CartDrawer';

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const cartCount = useCartStore(s => s.totalCount());
  const wishlistCount = useWishlistStore(s => s.productIds.length);
  const compareCount = useCompareStore(s => s.productIds.length);
  const categories = useProductStore(s => s.categories);

  const [catalogOpen, setCatalogOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const catalogRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catalogRef.current && !catalogRef.current.contains(e.target as Node)) setCatalogOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const activeCategory = categories.find(c => c.id === (hoveredCategory ?? categories[0]?.id));

  const currentLang = i18n.language === 'ro' ? 'RO' : 'RU';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-tech-bg-header backdrop-blur-xl border-b border-tech-border-subtle">
        <div className="container-main">
          <div className="flex items-center gap-4 h-[72px]">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-tech-text-secondary hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img src="/logo.svg" width="34" height="34" />
              <span className="text-[22px] font-bold gradient-text tracking-tight">TechHub</span>
            </Link>

            {/* Catalog Button */}
            <div ref={catalogRef} className="relative hidden lg:block">
              <button
                onClick={() => setCatalogOpen(!catalogOpen)}
                className="flex items-center gap-2 bg-tech-accent-primary text-black px-5 py-2.5 rounded-[10px] font-semibold text-sm hover:brightness-110 transition-all"
              >
                <Menu size={18} />
                <span>{t('nav.catalog')}</span>
                <ChevronDown size={14} className={`transition-transform ${catalogOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {catalogOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-[720px] bg-tech-bg-secondary border border-tech-border-subtle rounded-2xl shadow-elevated overflow-hidden"
                  >
                    <div className="flex">
                      <div className="w-[260px] border-r border-tech-border-subtle py-3">
                        {categories.map(cat => {
                          const Icon = iconMap[cat.icon] || iconMap['Smartphone'];
                          const isActive = (hoveredCategory ?? categories[0]?.id) === cat.id;
                          return (
                            <button
                              key={cat.id}
                              onMouseEnter={() => setHoveredCategory(cat.id)}
                              onClick={() => { navigate(`/catalog/${cat.slug}`); setCatalogOpen(false); }}
                              className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                                isActive
                                  ? 'bg-tech-bg-tertiary text-white'
                                  : 'text-tech-text-secondary hover:text-white hover:bg-tech-bg-tertiary/50'
                              }`}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                                style={{
                                  backgroundColor: isActive ? `${cat.iconColor}20` : 'transparent',
                                }}
                              >
                                <Icon size={16} style={{ color: cat.iconColor }} />
                              </div>
                              <span className="text-sm font-medium">{t(`categories.${cat.slug}`, { defaultValue: cat.name })}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex-1 p-6">
                        {activeCategory && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              {(() => {
                                const Icon = iconMap[activeCategory.icon] || iconMap['Smartphone'];
                                return <Icon size={18} style={{ color: activeCategory.iconColor }} />;
                              })()}
                              <h3 className="text-white font-semibold">{t(`categories.${activeCategory.slug}`, { defaultValue: activeCategory.name })}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {activeCategory.subcategories.map(sub => (
                                <button
                                  key={sub.id}
                                  onClick={() => { navigate(`/catalog/${activeCategory.slug}/${sub.slug}`); setCatalogOpen(false); }}
                                  className="text-left text-tech-text-secondary hover:text-tech-accent-primary text-sm py-2 transition-colors"
                                >
                                  {t(`categories.${sub.slug}`, { defaultValue: sub.name })}
                                  <span className="text-tech-text-muted ml-1">({sub.productCount})</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-6 ml-2">
              <Link to="/catalog?filter=sale" className="text-tech-text-secondary hover:text-white text-sm font-medium transition-colors">
                {t('home.promotions')}
              </Link>
              <Link to="/catalog?filter=new" className="text-tech-text-secondary hover:text-white text-sm font-medium transition-colors">
                {t('home.new_arrivals')}
              </Link>
            </nav>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[500px] mx-4">
              <div className="flex w-full bg-tech-bg-tertiary border border-tech-border-subtle rounded-[10px] overflow-hidden focus-within:border-tech-accent-primary focus-within:shadow-glow transition-all">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search_placeholder')}
                  className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-tech-text-muted outline-none"
                />
                <button type="submit" className="px-4 bg-tech-accent-primary text-black hover:brightness-110 transition-all">
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Action Icons */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Language Switcher */}
              <div ref={langRef} className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 p-2 text-tech-text-secondary hover:text-white transition-colors text-sm font-medium"
                  title="Language"
                >
                  <Globe size={18} />
                  <span className="hidden sm:inline">{currentLang}</span>
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full right-0 mt-2 w-32 bg-tech-bg-secondary border border-tech-border-subtle rounded-xl shadow-elevated py-1 z-50"
                    >
                      {(['ru', 'ro'] as const).map(lang => (
                        <button
                          key={lang}
                          onClick={() => { setLanguage(lang); setLangOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            i18n.language === lang
                              ? 'text-tech-accent-primary font-medium'
                              : 'text-tech-text-secondary hover:text-white hover:bg-tech-bg-tertiary'
                          }`}
                        >
                          {lang === 'ru' ? '🇷🇺 Русский' : '🇷🇴 Română'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/wishlist" className="relative p-2.5 text-tech-text-secondary hover:text-white transition-colors">
                <Heart size={22} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-tech-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/compare" className="relative p-2.5 text-tech-text-secondary hover:text-white transition-colors">
                <Scale size={22} />
                {compareCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-tech-accent-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {compareCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 text-tech-text-secondary hover:text-white transition-colors"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-tech-accent-primary text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Account */}
              <div ref={accountRef} className="relative">
                {isAuthenticated ? (
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 p-2 text-tech-text-secondary hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-tech-accent-primary/20 flex items-center justify-center">
                      <User size={16} className="text-tech-accent-primary" />
                    </div>
                    <span className="hidden lg:inline text-sm font-medium">{user?.name.split(' ')[0]}</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 p-2 text-tech-text-secondary hover:text-white transition-colors"
                  >
                    <User size={22} />
                    <span className="hidden lg:inline text-sm font-medium">{t('nav.login')}</span>
                  </Link>
                )}

                <AnimatePresence>
                  {accountOpen && isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-tech-bg-secondary border border-tech-border-subtle rounded-xl shadow-elevated py-2"
                    >
                      <div className="px-4 py-3 border-b border-tech-border-subtle">
                        <p className="text-white font-medium text-sm">{user?.name}</p>
                        <p className="text-tech-text-muted text-xs">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-tech-text-secondary hover:text-white hover:bg-tech-bg-tertiary transition-colors text-sm">
                        <User size={16} /> {t('nav.profile')}
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-tech-text-secondary hover:text-white hover:bg-tech-bg-tertiary transition-colors text-sm">
                          <LayoutDashboard size={16} /> {t('nav.admin')}
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setAccountOpen(false); navigate('/'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-tech-text-secondary hover:text-tech-error hover:bg-tech-bg-tertiary transition-colors text-sm"
                      >
                        <LogOut size={16} /> {t('nav.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-tech-border-subtle overflow-hidden"
            >
              <div className="container-main py-4 space-y-2">
                <form onSubmit={handleSearch} className="flex w-full bg-tech-bg-tertiary border border-tech-border-subtle rounded-[10px] overflow-hidden mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('nav.search_placeholder')}
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-tech-text-muted outline-none"
                  />
                  <button type="submit" className="px-4 bg-tech-accent-primary text-black">
                    <Search size={18} />
                  </button>
                </form>

                {/* Mobile language switcher */}
                <div className="flex gap-2 px-1 pb-2">
                  {(['ru', 'ro'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setMobileMenuOpen(false); }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        i18n.language === lang
                          ? 'bg-tech-accent-primary/20 text-tech-accent-primary'
                          : 'bg-tech-bg-tertiary text-tech-text-secondary hover:text-white'
                      }`}
                    >
                      {lang === 'ru' ? '🇷🇺 RU' : '🇷🇴 RO'}
                    </button>
                  ))}
                </div>

                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { navigate(`/catalog/${cat.slug}`); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-tech-text-secondary hover:text-white hover:bg-tech-bg-tertiary rounded-lg transition-colors"
                  >
                    {t(`categories.${cat.slug}`, { defaultValue: cat.name })}
                  </button>
                ))}
                <div className="border-t border-tech-border-subtle pt-3 mt-3">
                  <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-tech-text-secondary hover:text-white">
                    <Heart size={18} /> {t('nav.wishlist')}
                  </Link>
                  <Link to="/compare" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-tech-text-secondary hover:text-white">
                    <Scale size={18} /> {t('nav.compare')}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer */}
      <div className="h-[72px]" />

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}