import { BillFormModal } from '@/features/bills/components/billForm/BillFormModal';
import { Button, Group, SimpleGrid, Stack, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useBillsBySpace } from '@/features/bills/hooks/useBill';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddCardButton from '@/components/shared/AddCardButton';
import BillCard from '@/features/bills/components/details/BillCard';
import Skeletons from '@/components/shared/Skeletons';
import type { Bill } from '@/features/bills/types/bill';
import type { Space } from '@/features/spaces/types/space';
import { MemberBreakdownCard } from './MemberBreakdownCard';
import { PaymentSummaryCard } from './PaymentSummaryCard';
import { TotalSummaryCard } from './TotalSummaryCard';

export function BillTab({ space, referencePeriod }: { space: Space; referencePeriod: string }) {
  const {
    data: billTabContent,
    isLoading,
    isRefetching
  } = useBillsBySpace(space.id!, referencePeriod);

  const [isBillFormOpen, { open: openBillForm, close: closeBillForm }] = useDisclosure(false);

  const { t } = useTranslation('translation', { keyPrefix: 'spaces.tabs.bills' });

  const [selectedBill, setSelectedBill] = useState<Bill | undefined>(undefined);

  const handleCloseBillForm = () => {
    setSelectedBill(undefined);
    closeBillForm();
  };

  return (
    <>
      <Stack gap="lg">
        {!isLoading && billTabContent && billTabContent.summaryCards && (
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            <TotalSummaryCard
              totalSummary={billTabContent.summaryCards.totalSummary}
              referencePeriod={referencePeriod}
            />
            <PaymentSummaryCard paymentSummary={billTabContent.summaryCards.paymentSummary} />
            <MemberBreakdownCard memberBreakdown={billTabContent.summaryCards.memberBreakdown} />
          </SimpleGrid>
        )}

        <Group justify="space-between" align="center" mt="md">
          <Title order={4}>{t('sectionTitle')}</Title>
          <Button leftSection={<IconPlus size={16} stroke={2} />} onClick={openBillForm}>
            {t('add')}
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {!isLoading && !billTabContent && (
            <AddCardButton
              title={t('add')}
              description={t('add_description')}
              height={220}
              show={!isLoading && !isRefetching}
              onClick={openBillForm}
            />
          )}

          {isLoading || isRefetching ? (
            <Skeletons />
          ) : (
            billTabContent?.bills?.map(bill => (
              <BillCard
                bill={bill}
                onEdit={bill => {
                  setSelectedBill(bill);
                  openBillForm();
                }}
              />
            ))
          )}
        </SimpleGrid>
      </Stack>

      <BillFormModal
        opened={isBillFormOpen}
        onClose={handleCloseBillForm}
        bill={selectedBill}
        space={space}
      />
    </>
  );
}
