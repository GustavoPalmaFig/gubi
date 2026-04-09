import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Field, FieldLabel } from '@/components/ui/field';
import { useTranslation } from 'react-i18next';
import type { ComponentProps, ReactNode } from 'react';

export type AppSelectOption = {
  value: string;
  label: ReactNode;
};

export type AppSelectProps = Omit<
  ComponentProps<typeof Select>,
  'children' | 'value' | 'defaultValue' | 'onValueChange' | 'multiple'
> & {
  id?: string;
  label: ReactNode;
  options: AppSelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  leftSection?: ReactNode;
  invalid?: boolean;
  className?: string;
};

export function AppSelect({
  id,
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  leftSection,
  invalid,
  disabled,
  className,
  ...selectProps
}: AppSelectProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'common' });

  const resolvedPlaceholder = placeholder ?? t('select');

  return (
    <Field data-disabled={disabled}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select<string>
        {...selectProps}
        items={options}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id={id} aria-invalid={invalid} className={className}>
          {leftSection}
          <SelectValue placeholder={resolvedPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.length > 0 ? (
              options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <div className="text-muted-foreground p-2 text-sm">{t('noResults')}</div>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
