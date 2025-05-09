export interface iBill {
  id: number;
  space_id: number;
  name: string;
  value?: number;
  deadline?: string;
  reference_period: string;
  payer_id?: string;
  paid_at?: string;
  creator_id: string;
  created_at: Date;
  updated_at?: Date;
  updated_by?: string;
}
