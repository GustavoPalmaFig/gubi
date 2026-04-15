import type { paymentMethodTypeOptions } from '../constants/paymentMethodTypeOptions';

export type PaymentMethodType = (typeof paymentMethodTypeOptions)[number];
