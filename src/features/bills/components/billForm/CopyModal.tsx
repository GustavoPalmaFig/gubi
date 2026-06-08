import { AppModal } from '@/components/shared/AppModal';
import { IconAlertTriangleFilled } from '@tabler/icons-react';
import { showErrorNotification } from '@/utils/errors';
import { showNotification } from '@/utils/showNotification';
import { Stack, Group, Button } from '@mantine/core';
import { Trans, useTranslation } from 'react-i18next';
import type { Space } from '@/features/spaces/types/space';
import { useCopyBillsMutation } from '../../hooks/useBill';

interface CopyModalProps {
  opened: boolean;
  onClose: () => void;
  space: Space;
  referencePeriod: string;
}

export function CopyModal({ opened, onClose, space, referencePeriod }: CopyModalProps) {
  const { mutate: copyBills, isPending } = useCopyBillsMutation();

  const { t } = useTranslation('translation', { keyPrefix: 'bills.copyModal' });

  const handleCopyBills = () => {
    copyBills(
      { spaceId: space.id!, referencePeriod },
      {
        onSuccess: () => {
          showNotification({
            title: t('success'),
            message: t('successDescription'),
            type: 'positive'
          });
        },
        onError: showErrorNotification,
        onSettled: onClose
      }
    );
  };

  return (
    <AppModal opened={opened} onClose={onClose} title={t('title')} size="30rem">
      <Stack gap="lg">
        <Group align="center" wrap="nowrap">
          <IconAlertTriangleFilled size={24} className="shrink-0" />
          <Trans i18nKey="bills.copyModal.description" />
        </Group>

        <Group justify="end">
          <Button variant="outline" color="negative" onClick={onClose}>
            {t('no')}
          </Button>
          <Button
            variant="outline"
            color="primary"
            onClick={handleCopyBills}
            loading={isPending}
            loaderProps={{ type: 'dots' }}
          >
            {t('yes')}
          </Button>
        </Group>
      </Stack>
    </AppModal>
  );
}
