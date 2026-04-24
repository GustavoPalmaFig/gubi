import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { IconDotsVertical, IconPencilFilled, IconTrashFilled } from '@tabler/icons-react';
import { Menu, ActionIcon } from '@mantine/core';
import { showErrorNotification } from '@/utils/errors';
import { showNotification } from '@/utils/showNotification';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useDeleteSpaceMutation } from '../hooks/useSpace';
import type { Space } from '../types/space';

interface SpaceMenuProps {
  space: Space;
  onEdit: (space: Space) => void;
}

export function SpaceMenu({ space, onEdit }: SpaceMenuProps) {
  const { mutateAsync: deleteSpace, isPending } = useDeleteSpaceMutation();
  const [opened, { open, close }] = useDisclosure(false);

  const { t } = useTranslation('translation', { keyPrefix: 'spaces.menu' });

  const handleConfirm = async () => {
    try {
      await deleteSpace(space.id!);
      showNotification({
        title: t('delete_success'),
        message: t('delete_success_description'),
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
          <Menu.Item leftSection={<IconPencilFilled size={16} />} onClick={() => onEdit(space)}>
            {t('edit')}
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrashFilled size={16} />}
            onClick={open}
            className="hover:text-white"
          >
            {t('delete')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <ConfirmModal
        opened={opened}
        onClose={close}
        onConfirm={handleConfirm}
        title={t('delete_confirmation_title')}
        description={t('delete_confirmation')}
        loading={isPending}
      />
    </>
  );
}
