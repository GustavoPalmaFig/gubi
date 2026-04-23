import { AppAvatar } from '@/components/shared/AppAvatar';
import { Combobox, Text, useCombobox, ScrollArea, Loader, TextInput, Center } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '@/features/auth/types/user';
import { useSearchUsersForSpaceQuery } from '../hooks/useSpace';
import type { SpaceMember } from '../types/spaceMember';

type AddMembersSectionProps = {
  spaceId?: number;
  currentMembers: SpaceMember[];
  onSelectUser: (user: User) => void;
};

function getUserValue(user: User) {
  return String(user.id);
}

export function AddMembersSection({
  spaceId,
  currentMembers,
  onSelectUser
}: AddMembersSectionProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption()
  });

  const [search, setSearch] = useState('');

  const { data: usersSearchResults = [], isFetching: isFetchingUsers } =
    useSearchUsersForSpaceQuery(search, spaceId ?? null);

  const users = useMemo(() => {
    return usersSearchResults.filter(
      user => !currentMembers.some(member => member.user_id === user.id)
    );
  }, [usersSearchResults, currentMembers]);

  const { t } = useTranslation('translation', { keyPrefix: 'spaces.membersForm' });

  const handleOptionSubmit = (optionValue: string) => {
    const selectedOption = users.find(user => getUserValue(user) === optionValue);

    if (selectedOption?.id == null) {
      return;
    }

    onSelectUser(selectedOption);
    combobox.closeDropdown();
    setSearch('');
  };

  const handleChange = (query: string) => {
    setSearch(query);

    if (query.length > 2) {
      combobox.openDropdown();
      combobox.updateSelectedOptionIndex();
    }
  };

  return (
    <div className="w-full md:w-1/4">
      <Combobox store={combobox} withinPortal onOptionSubmit={handleOptionSubmit}>
        <Combobox.Target>
          <TextInput
            rightSectionPointerEvents="none"
            placeholder={t('search_users')}
            value={search}
            onChange={event => handleChange(event.currentTarget.value)}
            onClick={() => !isFetchingUsers && search.length > 2 && combobox.openDropdown()}
          />
        </Combobox.Target>

        <Combobox.Dropdown>
          <Text className="p-2 text-sm">{t('available_users')}</Text>
          <ScrollArea.Autosize mah={300}>
            {users.length > 0 ? (
              users.map(user => (
                <Combobox.Option value={getUserValue(user)} key={user.id}>
                  <AppAvatar user={user} size="sm" className="justify-start" />
                </Combobox.Option>
              ))
            ) : (
              <Combobox.Empty>
                {isFetchingUsers ? (
                  <Center>
                    <Loader size={18} type="dots" />
                  </Center>
                ) : (
                  <Text>{t('nothing_found')}</Text>
                )}
              </Combobox.Empty>
            )}
          </ScrollArea.Autosize>
        </Combobox.Dropdown>
      </Combobox>
    </div>
  );
}
