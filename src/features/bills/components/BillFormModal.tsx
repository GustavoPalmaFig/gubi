import { AppModal } from '@/components/shared/AppModal';
import { useTranslation } from 'react-i18next';
import type { Space } from '@/features/spaces/types/space';
import BillForm from './BillForm';
import type { Bill } from '../types/bill';

interface BillFormModalProps {
  opened: boolean;
  onClose: () => void;
  bill?: Bill;
  space: Space;
  isEditing?: boolean;
}

export function BillFormModal({
  opened,
  onClose,
  bill,
  space,
  isEditing = false
}: BillFormModalProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'bills.form' });

  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      title={isEditing ? t('editTitle') : t('createTitle')}
      subTitle={isEditing ? t('editDescription') : t('createDescription')}
      size="70rem"
      classNames={{
        content: 'bg-background'
      }}
    >
      <BillForm bill={bill} space={space} onFinish={onClose} />
    </AppModal>
  );
}
