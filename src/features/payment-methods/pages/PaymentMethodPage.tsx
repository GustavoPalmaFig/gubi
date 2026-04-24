import { Button, SimpleGrid } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { PageFrame } from '@/components/layout/PageFrame';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddCardButton from '@/components/shared/AddCardButton';
import Skeletons from '@/components/shared/Skeletons';
import { PaymentMethodCard } from '../components/PaymentMethodCard';
import { PaymentMethodFormModal } from '../components/PaymentMethodFormModal';
import { usePaymentMethodOverview } from '../hooks/usePaymentMethod';
import type { PaymentMethod } from '../types/paymentMethod';

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
        {isLoading || isRefetching ? (
          <Skeletons height={220} />
        ) : (
          <>
            {data &&
              data.cards.length > 0 &&
              data.cards.map(paymentMethod => (
                <div key={paymentMethod.id}>
                  <PaymentMethodCard
                    paymentMethod={paymentMethod}
                    onEdit={handleEditPaymentMethod}
                  />
                </div>
              ))}

            <AddCardButton
              title={t('add')}
              description={t('add_description')}
              height={220}
              show={!isLoading && !isRefetching}
              onClick={handleCreatePaymentMethod}
            />
          </>
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
