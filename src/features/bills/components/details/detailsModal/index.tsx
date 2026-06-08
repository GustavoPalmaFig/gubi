import { AppModal } from '@/components/shared/AppModal';
import { cn } from '@/lib/utils';
import { Tabs } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FrameContent from '@/components/shared/FrameContent';
import { BillPaidBadge } from '../BillPaidBadge';
import BasicInfosTab from './BasicInfosTab';
import type { Bill } from '../../../types/bill';

interface BillDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  bill: Bill;
}

const billDetailsTabs = ['basicInfos', 'splits', 'files'] as const;
type BillDetailsTabs = (typeof billDetailsTabs)[number];

export function BillDetailsModal({ opened, onClose, bill }: BillDetailsModalProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'bills.card.detailsModal.tabs' });

  const [activeTab, setActiveTab] = useState<BillDetailsTabs>('basicInfos');

  return (
    <AppModal opened={opened} onClose={onClose} title={bill.title} size="30rem">
      <Tabs
        defaultValue="bills"
        value={activeTab}
        onChange={value => setActiveTab(value as BillDetailsTabs)}
      >
        <Tabs.List className="text-muted-foreground">
          {billDetailsTabs.map(tab => (
            <Tabs.Tab
              key={tab}
              value={tab}
              className={cn('text-base font-medium', activeTab === tab && 'text-primary')}
            >
              {t(`${tab}.tabTitle`)}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <FrameContent
          title={t(`${activeTab}.title`)}
          headerRightSection={
            activeTab === 'basicInfos' && <BillPaidBadge isPaid={!!bill.paid_at} size="lg" />
          }
        >
          <Tabs.Panel value="basicInfos">
            <BasicInfosTab bill={bill} />
          </Tabs.Panel>

          <Tabs.Panel value="splits">texto</Tabs.Panel>

          <Tabs.Panel value="files">texto</Tabs.Panel>
        </FrameContent>
      </Tabs>
    </AppModal>
  );
}
