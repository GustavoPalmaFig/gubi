import { cn } from '@/lib/utils';
import { Stack } from '@mantine/core';

export interface SplitSummaryBoxProps {
  label: string;
  value: string;
  variant: 'total' | 'paid' | 'pending';
}

const variantClasses = {
  total: 'bg-muted-foreground/5 border-muted-foreground/20',
  paid: 'bg-primary/5 border-primary/20',
  pending: 'bg-orange/5 border-orange/20'
};

const variantLabelColors = {
  total: 'text-muted-foreground',
  paid: 'text-primary',
  pending: 'text-orange'
};

const variantValueColors = {
  total: 'text-foreground',
  paid: 'text-primary',
  pending: 'text-orange'
};

export default function SplitSummaryBox({ label, value, variant }: SplitSummaryBoxProps) {
  return (
    <Stack className={cn('gap-1 rounded-md border p-2.5 text-sm', variantClasses[variant])}>
      <span className={variantLabelColors[variant]}>{label}</span>
      <span className={cn('font-semibold', variantValueColors[variant])}>{value}</span>
    </Stack>
  );
}
