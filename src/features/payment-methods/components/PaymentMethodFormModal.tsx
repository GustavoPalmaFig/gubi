import { AppModal } from '@/components/shared/AppModal';
import { useTranslation } from 'react-i18next';
import { PaymentMethodForm } from './PaymentMethodForm';
import type { PaymentMethod } from '../types/paymentMethod';

interface PaymentMethodFormModalProps {
  opened: boolean;
  onClose: (paymentMethod?: PaymentMethod) => void;
  paymentMethod?: PaymentMethod;
  isEditing?: boolean;
}

export function PaymentMethodFormModal({
  opened,
  onClose,
  paymentMethod,
  isEditing = false
}: PaymentMethodFormModalProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'paymentMethod.form' });

  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      title={isEditing ? t('editTitle') : t('createTitle')}
      subTitle={isEditing ? t('editSubTitle') : t('createSubTitle')}
    >
      <PaymentMethodForm finish={onClose} paymentMethod={paymentMethod} />
    </AppModal>
  );
}
