import type { User } from '@/features/auth/types/user';
import type { Bill } from './bill';

export interface PaymentProgress {
  paidValue: number;
  paidPercentage: number;
  pendingValue: number;
  pendingPercentage: number;
}

export interface BillTotalSummary {
  totalValue: number;
  differencePercentageFromLastMonth: number;
}

export interface BillPaymentSummary extends PaymentProgress {
  paidBillsCount: number;
  totalBillsCount: number;
}

export interface BillMemberBreakdown extends PaymentProgress {
  user: User;
  totalValue: number;
}

export interface BillSummaryCards {
  totalSummary: BillTotalSummary;
  paymentSummary: BillPaymentSummary;
  memberBreakdown: BillMemberBreakdown[];
  nextDeadline: Bill | null;
}

export interface BillTabContent {
  bills: Bill[] | null;
  summaryCards: BillSummaryCards | null;
  showCopyModal: boolean;
}
