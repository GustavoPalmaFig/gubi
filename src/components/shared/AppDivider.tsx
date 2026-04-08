import { cn } from 'cn';
import { Separator } from '@/components/ui/separator';
import { type ReactNode } from 'react';

type DividerProps = {
  label?: ReactNode;
  labelPosition?: 'left' | 'center' | 'right';
  className?: string;
};

export function AppDivider({ label, labelPosition = 'center', className }: DividerProps) {
  if (label == null) {
    return <Separator className={className} />;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {labelPosition !== 'left' && <Separator className="flex-1" />}

      <span className="text-muted-foreground mb-1 shrink-0 text-xs">{label}</span>

      {labelPosition !== 'right' && <Separator className="flex-1" />}
    </div>
  );
}
