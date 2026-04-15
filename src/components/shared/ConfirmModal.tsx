import { Button, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AppModal } from './AppModal';

interface ConfirmModalProps {
  opened: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmModal({
  opened,
  title,
  description,
  confirmLabel,
  cancelLabel,
  loading = false,
  onClose,
  onConfirm
}: ConfirmModalProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'common' });

  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      title={title}
      withCloseButton={false}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <Stack gap="xl">
        <Text>{description}</Text>
        <Group justify="end">
          <Button variant="outline" color="gray" onClick={onClose} disabled={loading} size="sm">
            <Text className="font-normal">{cancelLabel ?? t('cancel')}</Text>
          </Button>
          <Button
            color={'negative'}
            loading={loading}
            loaderProps={{ type: 'dots' }}
            onClick={onConfirm}
            size="sm"
          >
            <Text className="font-normal text-white">{confirmLabel ?? t('confirm')}</Text>
          </Button>
        </Group>
      </Stack>
    </AppModal>
  );
}
