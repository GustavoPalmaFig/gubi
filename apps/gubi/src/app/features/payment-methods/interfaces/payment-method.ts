export interface iPaymentMethod {
  id: number;
  owner_id: number;
  name: string;
  split_by_default: boolean;
  created_at: Date;
  updated_at: Date;
}
