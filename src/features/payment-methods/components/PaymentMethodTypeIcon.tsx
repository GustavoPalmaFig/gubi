import { IconWallet } from '@tabler/icons-react';
import {
  paymentMethodTypeIconsMap,
  type PaymentMethodIconTone
} from '../constants/paymentMethodTypeIconsMap';
import type { PaymentMethodType } from '../types/paymentMethodType';

const paymentMethodIconToneClassMap: Record<
  PaymentMethodIconTone,
  {
    iconClassName: string;
    containerClassName: string;
  }
> = {
  blue: {
    iconClassName: 'text-blue',
    containerClassName: 'bg-blue/15 border-blue/15'
  },
  cyan: {
    iconClassName: 'text-cyan',
    containerClassName: 'bg-cyan/15 border-cyan/15'
  },
  green: {
    iconClassName: 'text-green',
    containerClassName: 'bg-green/15 border-green/15'
  },
  yellow: {
    iconClassName: 'text-yellow',
    containerClassName: 'bg-yellow/15 border-yellow/15'
  },
  orange: {
    iconClassName: 'text-orange',
    containerClassName: 'bg-orange/15 border-orange/15'
  },
  gray: {
    iconClassName: 'text-gray',
    containerClassName: 'bg-gray/15 border-gray/15'
  }
};

export function PaymentMethodTypeIcon({ type }: { type: PaymentMethodType | null }) {
  const { IconComponent, tone } = type
    ? paymentMethodTypeIconsMap[type]
    : { IconComponent: IconWallet, tone: 'gray' as const };

  const { iconClassName, containerClassName } = paymentMethodIconToneClassMap[tone];

  return (
    <div className={`flex items-center justify-center rounded-md border p-3 ${containerClassName}`}>
      <IconComponent size={20} className={`shrink-0 ${iconClassName}`} />
    </div>
  );
}
