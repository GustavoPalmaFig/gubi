import { Avatar } from '@mantine/core';
import { stringToColor } from '@/utils/helpers';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function AppAvatar() {
  const { user } = useAuth();

  const color = stringToColor(user?.full_name ?? '');

  return (
    <Avatar
      src={user?.avatar_url}
      name={user?.full_name}
      color="initials"
      allowedInitialsColors={[color]}
    />
  );
}
