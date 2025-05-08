import { iBill } from './bill.interface';

export interface iBillView extends iBill {
  payer_email?: string;
  payer_name?: string;
}
