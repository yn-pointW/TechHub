import { useTranslation } from 'react-i18next';
import { formatPrice, formatMonthlyPayment } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  oldPrice?: number | null;
  monthlyPayment?: number | null;
  cashback?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceDisplay({ price, oldPrice, monthlyPayment, cashback, size = 'md' }: PriceDisplayProps) {
  const { t } = useTranslation();
  const priceClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-[28px]',
  };

  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2 flex-wrap">
        {oldPrice && (
          <span className="text-tech-text-muted line-through text-sm">{formatPrice(oldPrice)}</span>
        )}
        <span className={`${priceClasses[size]} font-bold text-white`}>{formatPrice(price)}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {monthlyPayment && (
          <span className="inline-block bg-tech-accent-primary/10 text-tech-accent-primary text-xs font-medium px-2 py-0.5 rounded">
            {formatMonthlyPayment(price)}
          </span>
        )}
        {cashback && (
          <span className="inline-block bg-tech-success/10 text-tech-success text-xs font-medium px-2 py-0.5 rounded">
            {t('product.cashback')} {cashback.toLocaleString('ro-MD')} lei
          </span>
        )}
      </div>
    </div>
  );
}
