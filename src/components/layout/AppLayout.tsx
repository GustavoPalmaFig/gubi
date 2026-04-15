import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';
import { AppHeader } from './AppHeader';
import { AppNavBar } from './AppNavBar';

export function AppLayout() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);

  const isTabletUp = useMediaQuery('(min-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1280px)');

  const [desktopExpanded, setDesktopExpanded] = useState(true);

  const previousIsTabletUp = useRef(isTabletUp);
  const previousIsDesktop = useRef(isDesktop);

  useEffect(() => {
    if (!isTabletUp) {
      previousIsTabletUp.current = isTabletUp;
      previousIsDesktop.current = isDesktop;
      return;
    }

    const enteredTablet = !previousIsTabletUp.current && isTabletUp;
    const changedDesktopRange = previousIsDesktop.current !== isDesktop;

    if (enteredTablet || changedDesktopRange) {
      setDesktopExpanded(isDesktop);
    }

    previousIsTabletUp.current = isTabletUp;
    previousIsDesktop.current = isDesktop;
  }, [isTabletUp, isDesktop]);

  const navbarWidth = desktopExpanded ? 255 : 80;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: { base: '100%', sm: navbarWidth },
        breakpoint: 'sm',
        collapsed: {
          mobile: !mobileOpened,
          desktop: false
        }
      }}
      padding="md"
    >
      <AppHeader
        mobileOpened={mobileOpened}
        desktopExpanded={desktopExpanded}
        onMobileToggle={toggleMobile}
        onDesktopToggle={() => setDesktopExpanded(current => !current)}
      />

      <AppNavBar isExpanded={!isTabletUp || desktopExpanded} />

      <AppShell.Main className="mx-auto max-w-[1600px]">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
