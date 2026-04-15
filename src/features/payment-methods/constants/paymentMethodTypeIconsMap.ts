import {
  IconCreditCard,
  IconCards,
  IconQrcode,
  IconCash,
  IconBuildingBank,
  IconWallet,
  type Icon
} from '@tabler/icons-react';
import type { PaymentMethodType } from '../types/PaymentMethodType';

export type PaymentMethodIconTone = 'blue' | 'cyan' | 'green' | 'yellow' | 'orange' | 'gray';

export const paymentMethodTypeIconsMap: Record<
  PaymentMethodType,
  {
    IconComponent: Icon;
    tone: PaymentMethodIconTone;
  }
> = {
  credit_card: {
    IconComponent: IconCreditCard,
    tone: 'blue'
  },
  debit_card: {
    IconComponent: IconCards,
    tone: 'cyan'
  },
  pix: {
    IconComponent: IconQrcode,
    tone: 'green'
  },
  cash: {
    IconComponent: IconCash,
    tone: 'yellow'
  },
  cash_transaction: {
    IconComponent: IconBuildingBank,
    tone: 'orange'
  },
  other: {
    IconComponent: IconWallet,
    tone: 'gray'
  }
};
