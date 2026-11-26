import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/components/ui/input-group';
import { Field, FieldLabel } from '@/components/ui/field';
import { useTranslation } from 'react-i18next';
import { XIcon } from 'lucide-react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

export type AppInputBaseProps = ComponentPropsWithRef<'input'> & {
  label: ReactNode;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  invalid?: boolean;
  showClear?: boolean;
  onClear?: () => void;
};

export function AppInputBase({
  id,
  type = 'text',
  ref,
  label,
  placeholder,
  leftSection,
  rightSection,
  disabled,
  invalid,
  showClear = false,
  onClear,
  className,
  ...inputProps
}: AppInputBaseProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'common' });

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup className={className} data-disabled={disabled}>
        <InputGroupInput
          {...inputProps}
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder ?? t('insert')}
          disabled={disabled}
          aria-invalid={invalid}
        />

        {leftSection && (
          <InputGroupAddon align="inline-start">{leftSection}</InputGroupAddon>
        )}

        {rightSection && (
          <InputGroupAddon align="inline-end">{rightSection}</InputGroupAddon>
        )}

        {showClear && onClear && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label={t('clear')}
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground"
              icon={<XIcon className="size-3" />}
            />
          </InputGroupAddon>
        )}
      </InputGroup>
    </Field>
  );
}
