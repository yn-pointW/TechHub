import { Link } from 'react-router-dom';
import {
  Smartphone, Laptop, Gamepad2, Headphones, Watch, Bot, Zap, Tv, Cable, Apple
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const iconMap: Record<string, React.ElementType> = {
  'Smartphone': Smartphone,
  'Laptop': Laptop,
  'Gamepad2': Gamepad2,
  'Headphones': Headphones,
  'Watch': Watch,
  'Bot': Bot,
  'Zap': Zap,
  'Tv': Tv,
  'Cable': Cable,
  'Apple': Apple,
};

interface CategoryIconProps {
  name: string;
  slug: string;
  icon: string;
  iconColor: string;
  index?: number;
}

export default function CategoryIcon({ name, slug, icon, iconColor, index = 0 }: CategoryIconProps) {
  const { t } = useTranslation();
  const Icon = iconMap[icon] || Smartphone;
  const label = t(`categories.${slug}`, { defaultValue: name });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link to={`/catalog/${slug}`} className="flex flex-col items-center gap-2 group">
        <div
          className="w-20 h-20 rounded-full bg-tech-bg-secondary border border-tech-border-subtle flex items-center justify-center transition-all duration-300 group-hover:scale-105"
          style={{
            ['--hover-color' as string]: iconColor,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = iconColor;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${iconColor}30`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '';
            (e.currentTarget as HTMLElement).style.boxShadow = '';
          }}
        >
          <Icon size={32} style={{ color: iconColor }} />
        </div>
        <span className="text-tech-text-secondary text-xs text-center max-w-[90px] group-hover:text-white transition-colors leading-tight">
          {label}
        </span>
      </Link>
    </motion.div>
  );
}
