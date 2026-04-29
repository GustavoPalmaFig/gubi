import {
  IconBuilding,
  IconCreditCard,
  IconHome,
  IconLogout,
  IconReport,
  IconSettings
} from '@tabler/icons-react';
import { AppShell, ScrollArea, Button, Divider } from '@mantine/core';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser';
import { useTranslation } from 'react-i18next';
import { AppAvatar } from '../shared/AppAvatar';

type AppNavBarProps = {
  isExpanded: boolean;
};

export function AppNavBar({ isExpanded }: AppNavBarProps) {
  const { logout } = useAuth();
  const { user } = useAuthenticatedUser();
  const { t } = useTranslation('translation', { keyPrefix: 'navigation' });

  const items = [
    { label: 'home', icon: IconHome, href: '/' },
    { label: 'spaces', icon: IconBuilding, href: '/spaces' },
    { label: 'payment_methods', icon: IconCreditCard, href: '/payment-methods' },
    { label: 'reports', icon: IconReport, href: '/reports' },
    { label: 'settings', icon: IconSettings, href: '/settings' }
  ];

  return (
    <AppShell.Navbar className="bg-background-secondary text-sm">
      <AppShell.Section grow my="xl" component={ScrollArea} px="md">
        {items.map(item => (
          <NavLink
            to={item.href}
            key={item.label}
            className={({ isActive }) =>
              cn(
                'text-muted-foreground flex items-center gap-2 rounded-md p-3 transition-colors',
                isActive
                  ? 'text-primary border-primary bg-primary-foreground border-l-4'
                  : 'text-muted-foreground hover:bg-transparent'
              )
            }
          >
            <item.icon size={20} color="currentColor" className="shrink-0" />
            {isExpanded && <span>{t(item.label)}</span>}
          </NavLink>
        ))}
      </AppShell.Section>

      <Divider mx="md" />

      <AppShell.Section p="md" my="md" className="flex flex-col gap-4">
        <AppAvatar
          user={user}
          showName={isExpanded}
          showEmail={isExpanded}
          className={cn(isExpanded ? 'justify-start' : 'justify-center')}
        />
        <Button
          leftSection={<IconLogout size={20} />}
          classNames={{
            root: 'text-primary-foreground px-0',
            section: cn(!isExpanded && 'mx-0')
          }}
          onClick={() => logout()}
        >
          {isExpanded ? t('logout') : null}
        </Button>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
