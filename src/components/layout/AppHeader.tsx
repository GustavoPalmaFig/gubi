import { AppShell, Burger, Group, UnstyledButton } from '@mantine/core';
import LogoIcon from '@/assets/logo/gubi-logo-icon.svg?react';
import LogoName from '@/assets/logo/gubi-logo-name.svg?react';
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser';
import { AppAvatar } from '../shared/AppAvatar';

type AppHeaderProps = {
  mobileOpened: boolean;
  desktopExpanded: boolean;
  onMobileToggle: () => void;
  onDesktopToggle: () => void;
};

export function AppHeader({
  mobileOpened,
  desktopExpanded,
  onMobileToggle,
  onDesktopToggle
}: AppHeaderProps) {
  const { user } = useAuthenticatedUser();

  return (
    <AppShell.Header className="bg-background-secondary">
      <Group h="100%" justify="space-between" px="md">
        <Group>
          <Group hiddenFrom="sm">
            <LogoIcon className="text-primary h-10 w-auto" />
          </Group>
          <Burger opened={desktopExpanded} onClick={onDesktopToggle} visibleFrom="sm" size="sm" />
        </Group>

        <Group visibleFrom="sm">
          <LogoName className="text-primary h-10 w-auto" />
        </Group>

        <Group>
          <Group visibleFrom="sm">
            <UnstyledButton>
              <AppAvatar user={user} showName={false} showEmail={false} />
            </UnstyledButton>
          </Group>
          <Burger opened={mobileOpened} onClick={onMobileToggle} hiddenFrom="sm" size="sm" />
        </Group>
      </Group>
    </AppShell.Header>
  );
}
