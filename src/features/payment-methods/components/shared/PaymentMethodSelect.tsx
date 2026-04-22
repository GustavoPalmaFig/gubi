import {
  Combobox,
  InputBase,
  Group,
  Text,
  useCombobox,
  Input,
  CloseButton,
  Badge,
  Button,
  ScrollArea
} from '@mantine/core';
import { cn } from '@/lib/utils';
import { IconCirclePlus } from '@tabler/icons-react';
import { PaymentMethodTypeIcon } from '@/features/payment-methods/components/PaymentMethodTypeIcon';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PaymentMethodWithOwner } from '@/features/payment-methods/types/paymentMethodWithOwner';
import type { User } from '@/features/auth/types/user';
import { AppAvatar } from '../../../../components/shared/AppAvatar';
import { PaymentMethodFormModal } from '../PaymentMethodFormModal';
import type { PaymentMethod } from '../../types/paymentMethod';

type PaymentMethodSelectProps = {
  data: PaymentMethodWithOwner[];
  value: number | null;
  onChange: (value: number | null) => void;
  label?: string;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
};

type GroupedPaymentMethods = {
  owner: User;
  options: PaymentMethodWithOwner[];
};

function getPaymentMethodValue(paymentMethod: PaymentMethodWithOwner) {
  return String(paymentMethod.id);
}

function PaymentMethodOption({ paymentMethod }: { paymentMethod: PaymentMethodWithOwner }) {
  const { t } = useTranslation('translation', { keyPrefix: 'paymentMethod.card' });

  return (
    <Group gap="xs" className="py-0.5">
      <PaymentMethodTypeIcon type={paymentMethod.type} size={14} containerClassName="p-2" />

      <Text size="sm">{paymentMethod.name}</Text>

      {paymentMethod.affects_balance && (
        <Badge variant="light" color={'positive'} radius="md" size="sm">
          {t('affects_balance')}
        </Badge>
      )}
    </Group>
  );
}

export function PaymentMethodSelect({
  data,
  value,
  onChange,
  label,
  placeholder,
  clearable = true,
  disabled = false,
  error,
  className
}: PaymentMethodSelectProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption()
  });

  const [openedModal, { open: openModal, close: closeModal }] = useDisclosure(false);

  const { t } = useTranslation('translation', { keyPrefix: 'common' });
  const { t: tPaymentMethod } = useTranslation('translation', { keyPrefix: 'paymentMethod' });

  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(value);

  const selectedPaymentMethod =
    selectedPaymentMethodId !== null
      ? (data.find(paymentMethod => paymentMethod.id === selectedPaymentMethodId) ?? null)
      : null;

  const groupedPaymentMethods = Object.values(
    data.reduce<Record<string, GroupedPaymentMethods>>((acc, pm) => {
      const key = pm.owner.id;

      (acc[key] ??= {
        owner: pm.owner,
        options: []
      }).options.push(pm);

      return acc;
    }, {})
  );

  const handleOptionSubmit = (optionValue: string) => {
    const selectedOption = data.find(
      paymentMethod => getPaymentMethodValue(paymentMethod) === optionValue
    );

    if (selectedOption?.id == null) {
      return;
    }

    onChange(selectedOption.id);
    setSelectedPaymentMethodId(selectedOption.id);
    combobox.closeDropdown();
  };

  const handleAfterSaveModal = (paymentMethod?: PaymentMethod) => {
    closeModal();

    if (paymentMethod == null || paymentMethod?.id == null) {
      return;
    }

    onChange(paymentMethod.id);
    setSelectedPaymentMethodId(paymentMethod.id);
  };

  return (
    <>
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
              selectedPaymentMethod && (
                <AppAvatar
                  user={selectedPaymentMethod.owner}
                  showName={false}
                  showEmail={false}
                  size="sm"
                />
              )
            }
            rightSection={
              clearable && selectedPaymentMethodId !== null ? (
                <CloseButton
                  size="sm"
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => onChange(null)}
                  aria-label="Clear value"
                />
              ) : (
                <Combobox.Chevron />
              )
            }
            rightSectionPointerEvents={selectedPaymentMethodId === null ? 'none' : 'all'}
            onClick={() => combobox.toggleDropdown()}
          >
            {selectedPaymentMethod ? (
              selectedPaymentMethod.name
            ) : (
              <Input.Placeholder>{placeholder}</Input.Placeholder>
            )}
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <ScrollArea.Autosize mah={300}>
            {groupedPaymentMethods ? (
              groupedPaymentMethods.map(group => (
                <Combobox.Group
                  key={group.owner.id}
                  label={
                    <AppAvatar
                      user={group.owner}
                      showEmail={false}
                      size="sm"
                      className="justify-start"
                    />
                  }
                >
                  {group.options.map(item => (
                    <Combobox.Option
                      value={getPaymentMethodValue(item)}
                      key={item.id}
                      active={item === selectedPaymentMethod}
                      className={cn(
                        item.id === selectedPaymentMethodId && 'bg-primary/10 rounded-md'
                      )}
                    >
                      <PaymentMethodOption paymentMethod={item} />
                    </Combobox.Option>
                  ))}
                </Combobox.Group>
              ))
            ) : (
              <Combobox.Empty>
                <Text>{t('nothing_found')}</Text>
              </Combobox.Empty>
            )}
          </ScrollArea.Autosize>
          <Combobox.Footer>
            <Button
              variant="subtle"
              fullWidth
              color="mutedForeground"
              size="sm"
              leftSection={<IconCirclePlus size={18} />}
              onClick={() => {
                combobox.closeDropdown();
                openModal();
              }}
            >
              <Text size="sm">{tPaymentMethod('add_payment_method')}</Text>
            </Button>
          </Combobox.Footer>
        </Combobox.Dropdown>
      </Combobox>

      <PaymentMethodFormModal opened={openedModal} onClose={handleAfterSaveModal} />
    </>
  );
}
