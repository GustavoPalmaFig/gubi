import { AppModal } from '@/components/shared/AppModal';
import { useTranslation } from 'react-i18next';

interface InviteMembersModalProps {
  spaceId?: number;
  opened: boolean;
  onClose: () => void;
}

export function InviteMembersModal({ spaceId, opened, onClose }: InviteMembersModalProps) {
  const { t } = useTranslation('translation', {
    keyPrefix: 'spaces.membersForm.inviteMembersModal'
  });

  return (
    <AppModal opened={opened} onClose={onClose} title={t('title')} subTitle={t('subTitle')}>
      <div>{spaceId}</div>
    </AppModal>
  );
}
