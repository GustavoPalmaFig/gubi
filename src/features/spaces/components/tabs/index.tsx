import { cn } from '@/lib/utils';
import { Tabs } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BillTab } from './bill/BillTab';
import type { Space } from '../../types/space';

const spaceTabs = ['bills', 'expenses', 'members'] as const;
type SpaceTabs = (typeof spaceTabs)[number];

export function SpaceTabs({ space, referencePeriod }: { space: Space; referencePeriod: string }) {
  const { t } = useTranslation('translation', { keyPrefix: 'spaces' });

  const [activeTab, setActiveTab] = useState<SpaceTabs>('bills');

  return (
    <Tabs
      defaultValue="bills"
      value={activeTab}
      onChange={value => setActiveTab(value as SpaceTabs)}
    >
      <Tabs.List className="text-muted-foreground">
        {spaceTabs.map(tab => (
          <Tabs.Tab
            key={tab}
            value={tab}
            className={cn('text-base font-medium', activeTab === tab && 'text-primary')}
          >
            {t(`tabs.${tab}.title`)}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="bills" pt="lg">
        <BillTab space={space} referencePeriod={referencePeriod} />
      </Tabs.Panel>

      <Tabs.Panel value="expenses" pt="lg">
        Expenses tab
      </Tabs.Panel>

      <Tabs.Panel value="members" pt="lg">
        Members tab
      </Tabs.Panel>
    </Tabs>
  );
}
