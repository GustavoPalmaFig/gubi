import {
  ActionIcon,
  Button,
  Checkbox,
  Collapse,
  Group,
  Select,
  Stack,
  Text,
  TextInput
} from '@mantine/core';
import { Controller, useForm } from 'react-hook-form';
import { IconQuestionMark } from '@tabler/icons-react';
import { showErrorNotification } from '@/utils/errors';
import { showNotification } from '@/utils/showNotification';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation
} from '../hooks/usePaymentMethod';
import { PaymentMethodTypeIcon } from './PaymentMethodTypeIcon';
import { paymentMethodTypeOptions } from '../constants/paymentMethodTypeOptions';
import type { PaymentMethodFormData } from '../types/paymentMethodFormData';

const paymentMethodFormSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  affects_balance: z.boolean(),
  type: z.enum(paymentMethodTypeOptions).nullable()
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodFormSchema>;

interface PaymentMethodFormProps {
  paymentMethod?: PaymentMethodFormData;
  finish: () => void;
}

export function PaymentMethodForm({ paymentMethod, finish }: PaymentMethodFormProps) {
  const { mutate: createPaymentMethod, isPending: isCreatingPaymentMethod } =
    useCreatePaymentMethodMutation();
  const { mutate: updatePaymentMethod, isPending: isUpdatingPaymentMethod } =
    useUpdatePaymentMethodMutation();

  const [affectsBalanceExpanded, { toggle: toggleAffectsBalanceExpanded }] = useDisclosure(false);

  const { t } = useTranslation('translation', { keyPrefix: 'paymentMethod' });

  const paymentMethodTypeSelectOptions = paymentMethodTypeOptions.map(type => ({
    value: type,
    label: t(`paymentMethodType.${type}`)
  }));

  const isEditing = !!paymentMethod?.id;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      affects_balance: false,
      type: null
    }
  });

  useEffect(() => {
    reset({
      name: paymentMethod?.name ?? '',
      affects_balance: paymentMethod?.affects_balance ?? false,
      type: paymentMethod?.type ?? null
    });
  }, [paymentMethod, reset]);

  const handleSubmitPaymentMethod = (data: PaymentMethodFormValues) => {
    const payload: PaymentMethodFormData = {
      id: paymentMethod?.id,
      ...data
    };

    const mutate = isEditing ? updatePaymentMethod : createPaymentMethod;

    mutate(payload, {
      onSuccess: () => {
        showNotification({
          title: isEditing ? t('form.update_success') : t('form.create_success'),
          message: isEditing
            ? t('form.update_success_description')
            : t('form.create_success_description'),
          type: 'positive'
        });
        reset();
        finish();
      },
      onError: (error: unknown) => {
        showErrorNotification(error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitPaymentMethod)}>
      <Stack gap="lg">
        <TextInput
          label={t('form.name')}
          placeholder={t('form.name_placeholder')}
          error={errors.name?.message}
          {...register('name')}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Group align="end" gap="sm" w="100%" className="flex-1">
              <Select
                clearable
                label={t('form.type')}
                placeholder={t('form.type_placeholder')}
                data={paymentMethodTypeSelectOptions}
                value={field.value}
                onChange={value => field.onChange(value)}
                className="flex-1"
              />
              <PaymentMethodTypeIcon type={field.value} />
            </Group>
          )}
        />

        <Group gap="xs" className="mt-1">
          <Controller
            name="affects_balance"
            control={control}
            render={({ field }) => (
              <Checkbox
                label={t('form.affects_balance_label')}
                checked={field.value}
                onChange={event => field.onChange(event.currentTarget.checked)}
              />
            )}
          />
          <ActionIcon
            variant="outline"
            color="gray"
            radius="xl"
            size="xs"
            onClick={toggleAffectsBalanceExpanded}
          >
            <IconQuestionMark size={16} stroke={3} />
          </ActionIcon>

          <Collapse expanded={affectsBalanceExpanded}>
            <Text size="xs" className="text-muted-foreground font-light">
              {t('form.affects_balance_description')}
            </Text>
          </Collapse>
        </Group>

        <Group justify="end" mt="lg">
          <Button
            type="submit"
            disabled={!isValid}
            loading={isSubmitting || isCreatingPaymentMethod || isUpdatingPaymentMethod}
            loaderProps={{ type: 'dots' }}
          >
            {t('form.save')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
