import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  const catalogLinks = [
    { label: t('nav.catalog') + ' →', to: '/catalog' },
    { label: 'Telefoane & Tablete', to: '/catalog/telefoane' },
    { label: 'Laptopuri', to: '/catalog/laptopuri' },
    { label: 'Apple', to: '/catalog/apple' },
    { label: 'Audio', to: '/catalog/audio' },
    { label: 'Smart-ceasuri', to: '/catalog/smartwatch' },
    { label: 'TV & Foto', to: '/catalog/tv-photo' },
    { label: 'Accesorii', to: '/catalog/accessories' },
  ];

  const buyerLinks = [
    'Livrare', 'Plată', 'Garanție', 'Returnare', 'Rate', 'Trade-in', 'Blog'
  ];

  return (
    <footer className="bg-tech-bg-secondary border-t border-tech-border-subtle">
      <div className="container-main pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 - About */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="text-xl font-bold gradient-text">TechHub</span>
            </Link>
            <p className="text-tech-text-secondary text-sm leading-relaxed mb-4">
              TechHub — magazinul tău de încredere pentru electronice și gadgeturi din Moldova, din 2022. Oferim doar tehnică originală la cele mai bune prețuri.
            </p>
            <div className="space-y-2">
              <a href="tel:+37369123456" className="flex items-center gap-2 text-tech-text-secondary hover:text-tech-accent-primary text-sm transition-colors">
                <Phone size={14} /> +373 69 123-456
              </a>
              <a href="mailto:info@techhub.md" className="flex items-center gap-2 text-tech-text-secondary hover:text-tech-accent-primary text-sm transition-colors">
                <Mail size={14} /> info@techhub.md
              </a>
              <div className="flex items-center gap-2 text-tech-text-muted text-sm">
                <MapPin size={14} /> Chișinău, str. Ștefan cel Mare, 1
              </div>
            </div>
          </div>

          {/* Column 2 - Catalog */}
          <div>
            <h4 className="text-white font-semibold mb-4">Catalog</h4>
            <ul className="space-y-2.5">
              {catalogLinks.map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-tech-text-muted hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Buyers */}
          <div>
            <h4 className="text-white font-semibold mb-4">Cumpărătorilor</h4>
            <ul className="space-y-2.5">
              {buyerLinks.map(item => (
                <li key={item}>
                  <Link to="/" className="text-tech-text-muted hover:text-white text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contacts */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacte</h4>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2 text-tech-text-muted text-sm">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span>Chișinău, str. Ștefan cel Mare, 1, bir. 301</span>
              </div>
              <div className="flex items-center gap-2 text-tech-text-muted text-sm">
                <Phone size={14} />
                <span>+373 69 123-456</span>
              </div>
              <div className="flex items-center gap-2 text-tech-text-muted text-sm">
                <Mail size={14} />
                <span>info@techhub.md</span>
              </div>
            </div>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-tech-bg-tertiary border border-tech-border-subtle flex items-center justify-center text-tech-text-secondary hover:text-tech-accent-primary hover:border-tech-accent-primary/30 transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-tech-bg-tertiary border border-tech-border-subtle flex items-center justify-center text-tech-text-secondary hover:text-tech-accent-primary hover:border-tech-accent-primary/30 transition-all">
                <Send size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-tech-border-subtle mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-tech-text-muted text-xs">© 2025 TechHub Moldova. Toate drepturile rezervate.</p>
          <div className="flex gap-4 text-tech-text-muted text-xs">
            <a href="#" className="hover:text-white transition-colors">Politica de confidențialitate</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Termeni și condiții</a>
          </div>
        </div>
      </div>
    </footer>
  );
}