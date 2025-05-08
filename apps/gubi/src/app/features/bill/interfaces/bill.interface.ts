export interface iBill {
  id: number;
  space_id: number;
  name: string;
  value?: number;
  deadline?: Date;
  reference_period: Date;
  payer_id?: string;
  paid_at?: Date;
  creator_id: string;
  created_at: Date;
  updated_at?: Date;
  updated_by?: string;
}
