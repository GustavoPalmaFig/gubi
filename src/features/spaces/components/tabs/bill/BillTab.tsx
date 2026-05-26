import { BillFormModal } from '@/features/bills/components/billForm/BillFormModal';
import { Button, Group, SimpleGrid, Stack, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useBillsBySpace } from '@/features/bills/hooks/useBill';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BillCard from '@/features/bills/components/details/BillCard';
import Skeletons from '@/components/shared/Skeletons';
import type { Bill } from '@/features/bills/types/bill';
import type { Space } from '@/features/spaces/types/space';

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
      <Stack>
        <Group justify="space-between" align="center">
          <Title order={4}>{t('title')}</Title>
          <Button variant="outline" leftSection={<IconPlus size={16} />} onClick={openBillForm}>
            {t('add')}
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
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
