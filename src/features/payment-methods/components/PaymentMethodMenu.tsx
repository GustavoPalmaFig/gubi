import { IconDotsVertical, IconPencilFilled, IconTrashFilled } from '@tabler/icons-react';
import { Menu, ActionIcon } from '@mantine/core';
import { showErrorNotification } from '@/utils/errors';
import { showNotification } from '@/utils/showNotification';
import { useTranslation } from 'react-i18next';
import { useDeletePaymentMethodMutation } from '../hooks/usePaymentMethod';
import type { PaymentMethodCard } from '../types/paymentMethodOverview/paymentMethodCard';
import type { PaymentMethodFormData } from '../types/paymentMethodFormData';

interface PaymentMethodMenuProps {
  paymentMethod: PaymentMethodCard;
  onEdit: (paymentMethod: PaymentMethodFormData) => void;
}

export function PaymentMethodMenu({ paymentMethod, onEdit }: PaymentMethodMenuProps) {
  const { mutate: deletePaymentMethod } = useDeletePaymentMethodMutation();

  const { t } = useTranslation('translation', { keyPrefix: 'paymentMethod' });

  const handleDeletePaymentMethod = async (id: number) => {
    deletePaymentMethod(id, {
      onSuccess: () => {
        showNotification({
          title: t('card.delete_success'),
          message: t('card.delete_success_description'),
          type: 'positive'
        });
      },
      onError: (error: unknown) => {
        showErrorNotification(error);
      }
    });
  };

  return (
    <Menu shadow="md" width={150} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="light" color="gray" radius="md" size="md">
          <IconDotsVertical size={18} />
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
          onClick={() => handleDeletePaymentMethod(paymentMethod.id)}
        >
          {t('card.delete')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
