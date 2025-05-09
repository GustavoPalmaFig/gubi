export interface iExpense {
  id: number;
  space_id: number;
  title: string;
  value?: number;
  date?: Date;
  note?: string;
  reference_period: Date;
  payment_method_id?: number;
  category_id?: number;
  force_split?: boolean;
  creator_id: string;
  created_at: Date;
  updated_at?: Date;
  updated_by?: string;
}
