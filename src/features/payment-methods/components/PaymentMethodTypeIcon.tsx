import { IconWallet } from '@tabler/icons-react';
import {
  paymentMethodTypeIconsMap,
  type PaymentMethodIconTone
} from '../constants/paymentMethodTypeIconsMap';
import type { PaymentMethodType } from '../types/PaymentMethodType';

const paymentMethodIconToneClassMap: Record<
  PaymentMethodIconTone,
  {
    iconClassName: string;
    backgroundClassName: string;
  }
> = {
  blue: {
    iconClassName: 'text-blue',
    backgroundClassName: 'bg-blue/15'
  },
  cyan: {
    iconClassName: 'text-cyan',
    backgroundClassName: 'bg-cyan/15'
  },
  green: {
    iconClassName: 'text-green',
    backgroundClassName: 'bg-green/15'
  },
  yellow: {
    iconClassName: 'text-yellow',
    backgroundClassName: 'bg-yellow/15'
  },
  orange: {
    iconClassName: 'text-orange',
    backgroundClassName: 'bg-orange/15'
  },
  gray: {
    iconClassName: 'text-gray',
    backgroundClassName: 'bg-gray/15'
  }
};

export function PaymentMethodTypeIcon({ type }: { type: PaymentMethodType | null }) {
  const { IconComponent, tone } = type
    ? paymentMethodTypeIconsMap[type]
    : { IconComponent: IconWallet, tone: 'gray' as const };

  const { iconClassName, backgroundClassName } = paymentMethodIconToneClassMap[tone];

  return (
    <div
      className={`border-border-light flex items-center justify-center rounded-md border p-3 ${backgroundClassName}`}
    >
      <IconComponent size={20} className={`shrink-0 ${iconClassName}`} />
    </div>
  );
}
