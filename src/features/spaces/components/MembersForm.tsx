import {
  Card,
  Stack,
  Title,
  Table,
  ActionIcon,
  Text,
  Select,
  NumberInput,
  Group,
  Button,
  Divider
} from '@mantine/core';
import { AppAvatar } from '@/components/shared/AppAvatar';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { IconLock, IconTrash } from '@tabler/icons-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDisclosure } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '@/features/auth/types/user';
import { AddMembersSection } from './AddMembersSection';
import { MemberRoleBadge } from './MemberRoleBadge';
import { MemberStatusBadge } from './MemberStatusBadge';
import { spaceMemberRoleOptions } from '../constants/spaceMemberRoleOptions';
import type { SpaceMember } from '../types/spaceMember';
import type { SpaceMemberRole } from '../types/spaceMemberRole';

function isMemberEditable(member: SpaceMember, currentUser: User | null): boolean {
  if (!currentUser) return false;
  return member.user_id !== currentUser.id && member.role !== 'owner';
}

type MembersFormProps = {
  spaceId?: number;
  members: SpaceMember[];
  onChange: (members: SpaceMember[]) => void;
};

export default function MembersForm({ spaceId, members, onChange }: MembersFormProps) {
  const [isConfirmModalOpen, { open: openConfirmModal, close: closeConfirmModal }] =
    useDisclosure(false);

  const { user: currentUser } = useAuth();

  const { t } = useTranslation('translation', { keyPrefix: 'spaces.membersForm' });

  const [selectedUserForRemoval, setSelectedUserForRemoval] = useState<User | null>(null);

  const rolesOptions = useMemo(() => {
    return spaceMemberRoleOptions.map(role => ({
      value: role,
      label: t(`roles.${role}`)
    }));
  }, [t]);

  const defaultSplitPercentage = useMemo(() => {
    const totalMembers = members.length;
    const totalSplitPercentage = 100;
    return totalSplitPercentage / totalMembers;
  }, [members]);

  const handleAddMember = (user: User) => {
    const newMember: SpaceMember = {
      user_id: user.id,
      role: 'member',
      status: 'pending',
      default_split_percentage: null,
      user: user
    };

    onChange([...members, newMember]);
  };

  const handleRemoveMember = (member: SpaceMember) => {
    const user = member.user;
    setSelectedUserForRemoval(user);

    if (!member.invited_by) {
      handleConfirmRemoval();
      return;
    }
    openConfirmModal();
  };

  const handleConfirmRemoval = () => {
    onChange(members.filter(member => member.user_id !== selectedUserForRemoval?.id));
    closeConfirmModal();
  };

  const handleRoleChange = (userId: string, role: SpaceMemberRole | null) => {
    if (!role) {
      return;
    }

    onChange(members.map(member => (member.user_id === userId ? { ...member, role } : member)));
  };

  const handleDefaultSplitChange = (userId: string, value: string | number) => {
    const defaultSplitPercentage =
      value === '' || Number.isNaN(Number(value)) ? null : Number(value);

    onChange(
      members.map(member =>
        member.user_id === userId
          ? { ...member, default_split_percentage: defaultSplitPercentage }
          : member
      )
    );
  };

  return (
    <>
      <Card radius="lg" padding="xl" shadow="sm" withBorder>
        <Stack gap="lg">
          <Stack gap={2}>
            <Title order={4}>{t('title')}</Title>
            <Text className="text-muted-foreground text-sm">{t('subTitle')}</Text>
          </Stack>

          <AddMembersSection
            spaceId={spaceId}
            currentMembers={members}
            onSelectUser={handleAddMember}
          />

          <Stack gap="md" hiddenFrom="md">
            {members.map(member => {
              const isEditable = isMemberEditable(member, currentUser);
              const availableRoles = isEditable
                ? rolesOptions.filter(role => role.value !== 'owner')
                : rolesOptions;

              return (
                <Card key={member.user_id} radius="md" padding="md" withBorder>
                  <Stack gap="md">
                    <AppAvatar user={member.user} className="justify-start" />

                    <Group grow align="end" wrap="nowrap">
                      <Select
                        label={t('role')}
                        data={availableRoles}
                        value={member.role}
                        disabled={!isEditable}
                        rightSection={!isEditable ? <IconLock size={18} color="gray" /> : undefined}
                        onChange={value => handleRoleChange(member.user_id, value)}
                      />

                      <NumberInput
                        label={t('default_split_percentage')}
                        value={member.default_split_percentage ?? defaultSplitPercentage}
                        onChange={value => handleDefaultSplitChange(member.user_id, value)}
                        suffix="%"
                        hideControls
                      />
                    </Group>

                    {isEditable && (
                      <>
                        <Divider />
                        <Button
                          variant="light"
                          color="red"
                          fullWidth
                          leftSection={<IconTrash size={18} />}
                          onClick={() => handleRemoveMember(member)}
                        >
                          {t('remove_member_confirmation_title')}
                        </Button>
                      </>
                    )}
                  </Stack>
                </Card>
              );
            })}
          </Stack>

          <Table stickyHeader horizontalSpacing="sm" verticalSpacing="sm" visibleFrom="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('user')}</Table.Th>
                <Table.Th>{t('role')}</Table.Th>
                <Table.Th>{t('status')}</Table.Th>
                <Table.Th>{t('default_split_percentage')}</Table.Th>
                <Table.Th>{t('actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {members.map(member => {
                const isEditable = isMemberEditable(member, currentUser);

                return (
                  <Table.Tr key={member.user_id}>
                    <Table.Td>
                      <AppAvatar user={member.user} className="w-fit justify-start" />
                    </Table.Td>
                    <Table.Td>
                      {isEditable ? (
                        <Select
                          data={rolesOptions}
                          value={member.role}
                          onChange={value => handleRoleChange(member.user_id, value)}
                          className="w-28"
                        />
                      ) : (
                        <MemberRoleBadge role={member.role} />
                      )}
                    </Table.Td>
                    <Table.Td>
                      <MemberStatusBadge status={member.status} />
                    </Table.Td>
                    <Table.Td className="w-42">
                      <NumberInput
                        value={member.default_split_percentage ?? defaultSplitPercentage}
                        onChange={value => handleDefaultSplitChange(member.user_id, value)}
                        suffix="%"
                        hideControls
                        className="w-3/5"
                      />
                    </Table.Td>
                    <Table.Td>
                      {isEditable ? (
                        <ActionIcon
                          variant="white"
                          color="red"
                          onClick={() => handleRemoveMember(member)}
                        >
                          <IconTrash size={20} />
                        </ActionIcon>
                      ) : (
                        <IconLock size={20} color="gray" />
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Stack>
      </Card>

      <ConfirmModal
        opened={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={() => Promise.resolve(handleConfirmRemoval())}
        title={t('remove_member_confirmation_title')}
        description={t('remove_member_confirmation')}
      />
    </>
  );
}
