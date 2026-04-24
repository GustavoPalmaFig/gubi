import { cn } from '@/lib/utils';
import { spaceIconMap } from '../constants/spaceIconMap';
import type { SpaceIcon } from '../types/spaceIcon';

export default function SpaceIcon({
  icon,
  color,
  hasBackground = true,
  className = '',
  size = 30
}: {
  icon: SpaceIcon;
  color: string;
  hasBackground?: boolean;
  className?: string;
  size?: number;
}) {
  const IconComponent = spaceIconMap[icon];

  return (
    <div
      className={cn('flex size-16 items-center justify-center rounded-md', className)}
      style={{ backgroundColor: hasBackground ? `${color}25` : 'transparent' }}
    >
      <IconComponent size={size} stroke={1.5} className={`shrink-0`} color={color} />
    </div>
  );
}
