import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CategoryIcon from '@/components/CategoryIcon';
import ProductCard from '@/components/ProductCard';
import { useProductStore } from '@/stores/useProductStore';
import { blogApi } from '@/lib/api';
import type { BlogPost } from '@/types';

export default function Home() {
  const { t } = useTranslation();
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const products = useProductStore(s => s.products);
  const categories = useProductStore(s => s.categories);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    blogApi.list().then(setBlogPosts).catch(() => setBlogPosts([]));
  }, []);

  // "Smartphones" section: any product with subcategory 'smartphone' (regardless of category slug)
  const featuredProducts = useMemo(
    () => products.filter(p => p.subcategory === 'smartphone').slice(0, 10),
    [products]
  );
  const promoProducts = useMemo(
    () => products.filter(p => p.badges.includes('sale')).slice(0, 4),
    [products]
  );

  // Specific hero products: iPhone, MacBook, AirPods Pro
  const heroProducts = useMemo(() => {
    const iphone = products.find(p => p.brand === 'Apple' && p.name.toLowerCase().includes('iphone'));
    const macbook = products.find(p => p.name.toLowerCase().includes('macbook'));
    const airpods = products.find(p => p.name.toLowerCase().includes('airpods'));
    return [iphone, macbook, airpods];
  }, [products]);

  // Stable particle positions (do not recompute on every render)
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    []
  );

  // ── Hero carousel ──
  const SLIDE_DURATION = 5500;
  const slides = useMemo(() => [
    {
      accent: '#00d4aa',
      eyebrow: t('home.hero_period'),
      title: t('home.hero_sale_title'),
      pill: 'TECH',
      desc: t('home.hero_desc'),
      ctaLabel: t('home.view_deals'),
      ctaTo: '/catalog?filter=sale',
      product: heroProducts[0],
      tilt: -6,
    },
    {
      accent: '#ff6b35',
      eyebrow: 'MacBook Air · M2',
      title: 'PUTERE',
      pill: 'PORTABILĂ',
      desc: 'Procesor M2, ecran Liquid Retina 13.6", autonomie 18 ore.',
      ctaLabel: 'Descoperă laptopuri',
      ctaTo: '/catalog/laptopuri',
      product: heroProducts[1],
      tilt: 0,
    },
    {
      accent: '#a855f7',
      eyebrow: 'AirPods Pro 2',
      title: 'SUNET',
      pill: 'PREMIUM',
      desc: 'ANC activ, audio spațial, 30 ore cu carcasa de încărcare.',
      ctaLabel: 'Cumpără acum',
      ctaTo: '/catalog/audio',
      product: heroProducts[2],
      tilt: 4,
    },
  ], [t, heroProducts]);

  const [heroSlide, setHeroSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setHeroSlide(s => (s + 1) % slides.length), SLIDE_DURATION);
  }, [slides.length]);

  useEffect(() => {
    if (!isHovering) startTimer();
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isHovering, startTimer]);

  const goToSlide = (n: number) => { setHeroSlide(n); startTimer(); };
  const prevSlide = () => goToSlide((heroSlide - 1 + slides.length) % slides.length);
  const nextSlide = () => goToSlide((heroSlide + 1) % slides.length);

  const slide = slides[heroSlide];

  return (
    <div>
      {/* Announcement Bar */}
      <AnimatePresence>
        {announcementVisible && (
          <motion.div
            initial={{ height: 40 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-tech-accent-secondary to-orange-500 overflow-hidden"
          >
            <div className="flex items-center justify-center h-10 relative">
              <div className="overflow-hidden flex-1">
                <div className="animate-marquee whitespace-nowrap">
                  <span className="text-white text-sm font-medium inline-block">
                    {t('home.announcement')}&nbsp;&nbsp;&nbsp;&nbsp;{t('home.announcement')}&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                  <span className="text-white text-sm font-medium inline-block">
                    {t('home.announcement')}&nbsp;&nbsp;&nbsp;&nbsp;{t('home.announcement')}&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAnnouncementVisible(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Carousel ── */}
      <section
        className="relative min-h-[520px] flex items-center overflow-hidden bg-tech-bg-primary rounded-b-3xl"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Animated background blobs — color follows active slide */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`bg-${heroSlide}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse at 30% 50%, ${slide.accent}14 0%, transparent 65%)` }}
            />
            <div
              className="absolute top-16 right-64 w-80 h-80 rounded-full blur-3xl"
              style={{ background: `${slide.accent}08` }}
            />
            <div
              className="absolute bottom-8 left-8 w-96 h-96 rounded-full blur-3xl"
              style={{ background: `${slide.accent}06` }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Floating particles */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ left: `${p.left}%`, top: `${p.top}%`, background: `${slide.accent}50` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
          />
        ))}

        {/* Main content: text left + card right */}
        <div className="container-main relative z-10 py-16 w-full">
          <div className="flex items-center justify-between gap-8 lg:gap-12">

            {/* Left — text */}
            <div className="flex-1 min-w-0 max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroSlide}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                >
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.1em] mb-4 block"
                    style={{ color: slide.accent }}
                  >
                    {slide.eyebrow}
                  </span>
                  <h1 className="text-h1 text-white mb-4">
                    {slide.title}{' '}
                    <span
                      className="px-3 py-0.5 inline-block text-black"
                      style={{ background: slide.accent }}
                    >
                      {slide.pill}
                    </span>
                  </h1>
                  <p className="text-h3 text-tech-text-secondary mb-8">{slide.desc}</p>
                  <Link
                    to={slide.ctaTo}
                    className="inline-flex items-center gap-2 text-base px-8 py-4 rounded-[10px] font-semibold group transition-all hover:brightness-110"
                    style={{ background: slide.accent, color: '#000' }}
                  >
                    {slide.ctaLabel}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right — product card (shifted slightly right for symmetry) */}
            <div className="hidden lg:flex flex-1 items-center justify-center lg:pl-12 xl:pl-20">
              <div className="relative">
                {/* Ambient halo behind everything */}
                <motion.div
                  key={`halo-${heroSlide}`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${slide.accent}1f 0%, transparent 60%)` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                />

                {/* Large dashed ring — slowly rotating */}
                <motion.svg
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  width={500} height={500} viewBox="0 0 500 500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                >
                  <circle
                    cx={250} cy={250} r={246}
                    fill="none"
                    stroke={slide.accent}
                    strokeOpacity={0.22}
                    strokeWidth="1"
                    strokeDasharray="3 14"
                  />
                </motion.svg>

                {/* Inner subtle ring */}
                <motion.svg
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  width={400} height={400} viewBox="0 0 400 400"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                >
                  <circle
                    cx={200} cy={200} r={196}
                    fill="none"
                    stroke={slide.accent}
                    strokeOpacity={0.10}
                    strokeWidth="1"
                    strokeDasharray="2 10"
                  />
                </motion.svg>

                {/* Product card — tilted per slide, color reacts to accent */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`card-${heroSlide}`}
                    className="relative w-[340px] h-[380px] rounded-[28px] overflow-hidden"
                    style={{
                      background: `
                        radial-gradient(ellipse at 100% 0%, ${slide.accent}33 0%, transparent 55%),
                        radial-gradient(ellipse at 0% 100%, ${slide.accent}1a 0%, transparent 55%),
                        linear-gradient(155deg, rgba(26, 22, 48, 0.96) 0%, rgba(14, 11, 28, 0.98) 100%)
                      `,
                      border: `1px solid ${slide.accent}33`,
                      boxShadow: `
                        0 36px 72px -24px rgba(0, 0, 0, 0.7),
                        0 16px 48px -12px ${slide.accent}33,
                        inset 0 1px 0 rgba(255, 255, 255, 0.06),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.4)
                      `,
                    }}
                    initial={{ opacity: 0, scale: 0.92, rotate: slide.tilt + 8 }}
                    animate={{ opacity: 1, scale: 1, rotate: slide.tilt }}
                    exit={{ opacity: 0, scale: 0.92, rotate: slide.tilt - 8 }}
                    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Discount badge — tinted with accent */}
                    {slide.product?.discount && (
                      <div
                        className="absolute top-4 left-4 z-10 text-xs font-bold px-2.5 py-1 rounded-md"
                        style={{
                          background: `${slide.accent}26`,
                          color: slide.accent,
                          border: `1px solid ${slide.accent}55`,
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        −{slide.product.discount}%
                      </div>
                    )}

                    {/* Top edge specular */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {/* Soft corner glow */}
                    <div
                      className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none"
                      style={{ background: `${slide.accent}40` }}
                    />

                    {/* Product image */}
                    <motion.img
                      src={slide.product?.images[0] || ''}
                      alt={slide.product?.name || ''}
                      className="relative w-full h-full object-contain p-8"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

        {/* ── Navigation pill (liquid glass) ── */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.16)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.12)',
          }}
        >
          <button
            onClick={prevSlide}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
            style={{ color: slide.accent }}
          >
            <ChevronLeft size={16} />
          </button>

          {slides.map((_s, i) => (
            <button key={i} onClick={() => goToSlide(i)} className="relative h-1 rounded-full overflow-hidden transition-all"
              style={{ width: i === heroSlide ? 44 : 28, background: 'rgba(255,255,255,0.20)' }}
            >
              {i === heroSlide && (
                <motion.span
                  key={heroSlide}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: slide.accent }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
                />
              )}
            </button>
          ))}

          <button
            onClick={nextSlide}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
            style={{ color: slide.accent }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Category Icons */}
      <section className="py-12">
        <div className="container-main">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-h3 text-white text-center mb-8"
          >
            {t('home.popular_categories')}
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {categories.map((cat, i) => (
              <CategoryIcon key={cat.id} name={cat.name} slug={cat.slug} icon={cat.icon} iconColor={cat.iconColor} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container-main">
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-h2 text-white"
            >
              {t('home.smartphones_section')}
            </motion.h2>
            <Link to="/catalog/telefoane" className="flex items-center gap-1 text-tech-accent-primary text-sm font-medium hover:gap-2 transition-all">
              {t('home.all_products')} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-12">
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Trade-in Banner */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="card-base p-8 md:p-10 hover:border-tech-accent-primary/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-h2 text-white mb-3">{t('home.trade_in')}</h3>
                  <p className="text-tech-text-secondary mb-6">{t('home.trade_in_detail_desc')}</p>
                  <Link to="/" className="btn-secondary inline-flex items-center gap-2 group/btn">
                    {t('home.learn_more')}
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="w-32 h-32 md:w-40 md:h-40 bg-tech-accent-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <rect x="20" y="10" width="24" height="40" rx="4" stroke="#00d4aa" strokeWidth="2" fill="none" />
                    <rect x="36" y="30" width="24" height="40" rx="4" stroke="#00d4aa" strokeWidth="2" fill="none" />
                    <path d="M44 25L52 35" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" />
                    <path d="M48 22L55 32" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" />
                    <polygon points="52,18 58,28 46,28" fill="#00d4aa" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Daily Deals Banner */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card-base p-8 md:p-10 hover:border-tech-accent-secondary/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-h2 text-white mb-3">{t('home.limited_offers')}</h3>
                  <p className="text-tech-text-secondary mb-6">{t('home.limited_offers_desc')}</p>
                  <Link to="/catalog?filter=limited" className="btn-secondary inline-flex items-center gap-2 group/btn">
                    {t('home.view_offers')}
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="w-32 h-32 md:w-40 md:h-40 bg-tech-accent-secondary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="28" stroke="#ff6b35" strokeWidth="2" fill="none" />
                    <text x="40" y="45" textAnchor="middle" fill="#ff6b35" fontSize="20" fontWeight="bold">-50%</text>
                    <path d="M15 25L20 20" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" />
                    <path d="M60 60L65 55" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="18" cy="22" r="3" fill="#ff6b35" opacity="0.5" />
                    <circle cx="62" cy="58" r="3" fill="#ff6b35" opacity="0.5" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Promo Products */}
      <section className="py-12">
        <div className="container-main">
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-h2 text-white"
            >
              {t('home.sale_products')}
            </motion.h2>
            <Link to="/catalog?filter=sale" className="flex items-center gap-1 text-tech-accent-primary text-sm font-medium hover:gap-2 transition-all">
              {t('home.all_sales')} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {promoProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-12 pb-16">
        <div className="container-main">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-h2 text-white mb-8"
          >
            {t('home.articles')}
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {blogPosts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-tech-bg-secondary">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="text-tech-accent-primary text-xs font-medium uppercase tracking-wider">{post.category}</span>
                <h3 className="text-white font-semibold mt-2 line-clamp-2 group-hover:text-tech-accent-primary transition-colors">{post.title}</h3>
                <span className="text-tech-text-muted text-xs mt-2 block">{post.date}</span>
              </motion.article>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/" className="inline-flex items-center gap-1 text-tech-accent-primary text-sm font-medium hover:gap-2 transition-all">
              {t('home.all_blog')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}