import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { IconDotsVertical, IconPencilFilled, IconTrashFilled } from '@tabler/icons-react';
import { Menu, ActionIcon } from '@mantine/core';
import { showErrorNotification } from '@/utils/errors';
import { showNotification } from '@/utils/showNotification';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useDeletePaymentMethodMutation } from '../hooks/usePaymentMethod';
import type { PaymentMethodCard } from '../types/paymentMethodOverview/paymentMethodCard';
import type { PaymentMethodFormData } from '../types/paymentMethodFormData';

interface PaymentMethodMenuProps {
  paymentMethod: PaymentMethodCard;
  onEdit: (paymentMethod: PaymentMethodFormData) => void;
}

export function PaymentMethodMenu({ paymentMethod, onEdit }: PaymentMethodMenuProps) {
  const { mutateAsync: deletePaymentMethod, isPending } = useDeletePaymentMethodMutation();
  const [opened, { open, close }] = useDisclosure(false);

  const { t } = useTranslation('translation', { keyPrefix: 'paymentMethod' });

  const handleConfirm = async () => {
    try {
      await deletePaymentMethod(paymentMethod.id);
      showNotification({
        title: t('card.delete_success'),
        message: t('card.delete_success_description'),
        type: 'positive'
      });
      close();
    } catch (error) {
      showErrorNotification(error);
    }
  };

  return (
    <>
      <Menu shadow="md" width={150} position="bottom-end">
        <Menu.Target>
          <ActionIcon variant="subtle" color="muted" radius="lg" size="md">
            <IconDotsVertical size={18} color="gray" />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown className="py-2">
          <Menu.Item
            leftSection={<IconPencilFilled size={16} />}
            onClick={() => onEdit(paymentMethod)}
          >
            {t('card.edit')}
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrashFilled size={16} />}
            onClick={open}
            className="hover:text-white"
          >
            {t('card.delete')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <ConfirmModal
        opened={opened}
        onClose={close}
        onConfirm={handleConfirm}
        title={t('card.delete_confirmation_title')}
        description={t('card.delete_confirmation')}
        loading={isPending}
      />
    </>
  );
}
