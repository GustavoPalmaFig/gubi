import { Button, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { PageFrame } from '@/components/layout/PageFrame';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentMethodCard } from '../components/PaymentMethodCard';
import { PaymentMethodFormModal } from '../components/PaymentMethodFormModal';
import { usePaymentMethodOverview } from '../hooks/usePaymentMethod';
import type { PaymentMethod } from '../types/paymentMethod';

const SKELETON_CARDS = Array.from({ length: 3 }, (_, index) => index);

export function PaymentMethodPage() {
  const { data, isLoading, isRefetching } = usePaymentMethodOverview();

  const [opened, { open, close }] = useDisclosure(false);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>();

  const { t } = useTranslation('translation', { keyPrefix: 'paymentMethod' });

  const handleCreatePaymentMethod = () => {
    setSelectedPaymentMethod(undefined);
    open();
  };

  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    open();
  };

  const handleCloseModal = () => {
    setSelectedPaymentMethod(undefined);
    close();
  };

  return (
    <PageFrame
      title={t('title')}
      description={t('description')}
      headerRightSection={
        <Button leftSection={<IconPlus size={18} />} onClick={handleCreatePaymentMethod}>
          {t('add')}
        </Button>
      }
    >
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {isLoading || isRefetching
          ? SKELETON_CARDS.map(index => (
              <div key={index}>
                <Skeleton height={220} radius="lg" />
              </div>
            ))
          : data?.cards.map(paymentMethod => (
              <div key={paymentMethod.id}>
                <PaymentMethodCard paymentMethod={paymentMethod} onEdit={handleEditPaymentMethod} />
              </div>
            ))}
        {!isLoading && !isRefetching && (
          <div>
            <Button
              variant="white"
              fullWidth
              h={220}
              className="border-primary rounded-lg border border-dashed"
              onClick={handleCreatePaymentMethod}
            >
              <Stack align="center" justify="center" gap="xs">
                <div className="bg-primary-foreground text-primary flex items-center justify-center rounded-full p-4">
                  <IconPlus size={18} stroke={3} />
                </div>
                <Stack gap="0">
                  <Text>{t('add')}</Text>
                  <Text className="text-muted-foreground text-sm">{t('add_description')}</Text>
                </Stack>
              </Stack>
            </Button>
          </div>
        )}
      </SimpleGrid>

      <PaymentMethodFormModal
        opened={opened}
        onClose={handleCloseModal}
        paymentMethod={selectedPaymentMethod}
        isEditing={!!selectedPaymentMethod}
      />
    </PageFrame>
  );
}
