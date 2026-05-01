import {
  Combobox,
  InputBase,
  Text,
  useCombobox,
  Input,
  CloseButton,
  ScrollArea
} from '@mantine/core';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { User } from '@/features/auth/types/user';
import { AppAvatar } from './AppAvatar';

export type UsersSelectProps = {
  users: User[];
  value?: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
};

function userToOptionValue(user: User) {
  return user.id;
}

function UserOptionRow({ user }: { user: User }) {
  return <AppAvatar user={user} showEmail={false} size="sm" className="justify-start py-0.5" />;
}

export function UsersSelect({
  users,
  value,
  onChange,
  label,
  placeholder,
  clearable = true,
  disabled = false,
  error,
  className
}: UsersSelectProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'forms.select' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'common' });

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption()
  });

  const selectedUser = value === null ? null : (users.find(u => u.id === value) ?? null);

  const handleOptionSubmit = (optionValue: string) => {
    const user = users.find(u => userToOptionValue(u) === optionValue);
    if (!user) return;
    onChange(user.id);
    combobox.closeDropdown();
  };

  return (
    <Combobox store={combobox} withinPortal onOptionSubmit={handleOptionSubmit}>
      <Combobox.Target>
        <InputBase
          label={label}
          disabled={disabled}
          error={error}
          className={className}
          component="button"
          type="button"
          pointer
          leftSection={
            selectedUser && (
              <AppAvatar user={selectedUser} showName={false} showEmail={false} size="sm" />
            )
          }
          rightSection={
            clearable && value !== null ? (
              <CloseButton
                size="sm"
                onMouseDown={event => event.preventDefault()}
                onClick={() => onChange(null)}
              />
            ) : (
              <Combobox.Chevron />
            )
          }
          rightSectionPointerEvents={value === null ? 'none' : 'all'}
          onClick={() => combobox.toggleDropdown()}
        >
          {selectedUser ? (
            <Text size="sm" truncate ta="left" component="span">
              {selectedUser.full_name}
            </Text>
          ) : (
            <Input.Placeholder>{placeholder ?? t('placeholder')}</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <ScrollArea.Autosize mah={280}>
          {users.length === 0 ? (
            <Combobox.Empty>
              <Text size="sm">{tCommon('nothing_found')}</Text>
            </Combobox.Empty>
          ) : (
            users.map(user => (
              <Combobox.Option
                key={user.id}
                value={userToOptionValue(user)}
                active={user.id === value}
                className={cn(user.id === value && 'bg-primary/10 rounded-md')}
              >
                <UserOptionRow user={user} />
              </Combobox.Option>
            ))
          )}
        </ScrollArea.Autosize>
      </Combobox.Dropdown>
    </Combobox>
  );
}
