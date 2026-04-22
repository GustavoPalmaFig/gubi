import { Avatar, type MantineSize } from '@mantine/core';
import { cn } from '@/lib/utils';
import { stringToColor } from '@/utils/helpers';
import type { User } from '@/features/auth/types/user';

type AppAvatarProps = {
  user: User | null;
  showName?: boolean;
  showEmail?: boolean;
  size?: MantineSize;
  className?: string;
};

export function AppAvatar({
  user,
  showName = true,
  showEmail = true,
  size = 'md',
  className
}: AppAvatarProps) {
  if (!user) return null;

  const color = stringToColor(user.full_name);

  return (
    <div className={cn('flex w-full items-center justify-center gap-2', className)}>
      <Avatar
        src={user.avatar_url}
        name={user.full_name}
        color="initials"
        allowedInitialsColors={[color]}
        size={size}
      />
      {(showName || showEmail) && (
        <div className="flex flex-col truncate">
          {showName && <span>{user.full_name}</span>}
          {showEmail && <span className="text-muted-foreground text-xs">{user.email}</span>}
        </div>
      )}
    </div>
  );
}
