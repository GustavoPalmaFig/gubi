import {
  IconBuilding,
  IconHome2Filled,
  IconPlaneTiltFilled,
  IconReport,
  IconUsers
} from '@tabler/icons-react';
import { Loader } from '@mantine/core';
import { Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LogoIcon from '@/assets/logo/gubi-logo-icon.svg?react';
import LogoName from '@/assets/logo/gubi-logo-name.svg?react';
import { useAuth } from '../hooks/useAuth';

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation('translation', { keyPrefix: 'auth.layout' });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader type="dots" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const items = [
    { Icon: IconUsers, title: t('items.first') },
    { Icon: IconBuilding, title: t('items.second') },
    { Icon: IconReport, title: t('items.third') }
  ];

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <section className="via-primary/90 from-primary to-primary-foreground hidden w-1/2 flex-col items-start gap-12 bg-linear-to-br p-16 md:flex">
        <LogoName className="h-10 w-auto text-white" />

        <div className="mt-20 flex w-full flex-col justify-center gap-10 lg:w-3/5">
          <h1 className="text-4xl font-bold text-white">{t('title')}</h1>

          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-5">
              {items.map(item => (
                <div
                  key={item.title}
                  className="text-primary-foreground flex items-center gap-2 text-sm"
                >
                  <div className="flex size-10 items-center justify-center rounded-md bg-white/20">
                    <item.Icon size={20} color="currentColor" />
                  </div>
                  <div className="font-medium">{item.title}</div>
                </div>
              ))}
            </div>

            <div className="text-foreground relative">
              <div className="absolute top-0 left-0 flex w-60 -rotate-4 transform items-center gap-4 rounded-lg bg-white px-4 py-3 shadow transition-transform hover:rotate-0">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-300/20 text-blue-300">
                  <IconHome2Filled size={20} color="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t('examples.apartment')}</p>
                  <span className="text-muted-foreground text-xs">
                    {t('examples.apartment_description')}
                  </span>
                </div>
              </div>
              <div className="absolute top-14 left-55 z-10 flex w-60 rotate-4 transform items-center gap-4 rounded-lg bg-white px-4 py-3 shadow transition-transform hover:rotate-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-600/20 text-yellow-600">
                  <IconPlaneTiltFilled size={20} color="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t('examples.trip')}</p>
                  <span className="text-muted-foreground text-xs">
                    {t('examples.trip_description')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-primary-foreground/70 mt-auto text-sm font-medium">{t('footer')}</div>
      </section>

      <div className="mx-auto flex w-full max-w-xl flex-col gap-12 p-16 md:w-1/2">
        <LogoName className="text-primary h-10 md:hidden" />
        <LogoIcon className="text-primary hidden h-10 md:flex" />
        <Outlet />
      </div>
    </div>
  );
}
