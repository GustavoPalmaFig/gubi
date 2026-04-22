import { spaceIconMap } from '../constants/spaceIconMap';
import type { SpaceIcon } from '../types/spaceIcon';

export default function SpaceIcon({
  icon,
  color,
  hasBackground = true
}: {
  icon: SpaceIcon;
  color: string;
  hasBackground?: boolean;
}) {
  const IconComponent = spaceIconMap[icon];

  return (
    <div
      className={`flex size-16 items-center justify-center rounded-md`}
      style={{ backgroundColor: hasBackground ? `${color}25` : 'transparent' }}
    >
      <IconComponent size={30} stroke={1.5} className={`shrink-0`} color={color} />
    </div>
  );
}
