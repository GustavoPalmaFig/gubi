import { Button, Card, Group, SimpleGrid, Stack, TextInput, Title } from '@mantine/core';
import { Controller, useForm } from 'react-hook-form';
import { showErrorNotification } from '@/utils/errors';
import { showNotification } from '@/utils/showNotification';
import { toISODateString } from '@/utils/formatDate';
import { useEffect } from 'react';
import { UsersSelect } from '@/components/shared/UsersSelect';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import AppDatePickerInput from '@/components/shared/AppDatePickerInput';
import AppMonthPickerInput from '@/components/shared/AppMonthPickerInput';
import AppNumberInput from '@/components/shared/AppNumberInput';
import dayjs from 'dayjs';
import type { Space } from '@/features/spaces/types/space';
import z from 'zod';
import { useCreateBillMutation, useUpdateBillMutation } from '../hooks/useBill';
import type { Bill } from '../types/bill';

interface BillFormProps {
  bill?: Bill;
  space: Space;
  onFinish: (bill?: Bill) => void;
}

const CURRENT_MONTH_REFERENCE_PERIOD = toISODateString(dayjs().startOf('month').toDate());

export default function BillForm({ bill, space, onFinish }: BillFormProps) {
  const isEditing = !!bill?.id;

  const { mutate: createBill, isPending: isCreatingBill } = useCreateBillMutation();
  const { mutate: updateBill, isPending: isUpdatingBill } = useUpdateBillMutation();

  const { t } = useTranslation('translation', { keyPrefix: 'bills.form' });

  const billSplitSchema = z.object({
    user_id: z.uuid(),
    split_value: z.number().min(0),
    paid_at: z.string().nullable().optional()
  });

  const billFileSchema = z.object({
    filename: z.string().trim(),
    storage_path: z.string().trim()
  });

  const billFormSchema = z.object({
    space_id: z.number(),
    title: z.string().trim().min(1, t('dataSection.titleRequiredMessage')),
    reference_period: z.string(),
    value: z.number().positive(t('dataSection.value_required_message')),
    deadline: z.string().nullable(),
    payer_id: z.string().nullable(),
    paid_at: z.string().nullable(),
    splits: z.array(billSplitSchema).optional(),
    files: z.array(billFileSchema).optional()
  });

  type BillFormValues = z.infer<typeof billFormSchema>;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    mode: 'onChange',
    defaultValues: {
      space_id: space.id,
      title: '',
      reference_period: CURRENT_MONTH_REFERENCE_PERIOD,
      value: 0,
      deadline: null,
      payer_id: null,
      paid_at: null,
      splits: [],
      files: []
    }
  });

  useEffect(() => {
    if (!space.members) {
      return;
    }

    reset({
      title: bill?.title ?? '',
      reference_period: bill?.reference_period ?? CURRENT_MONTH_REFERENCE_PERIOD,
      value: bill?.value ?? 0,
      deadline: bill?.deadline ?? null,
      payer_id: bill?.payer_id ?? null,
      paid_at: bill?.paid_at ?? null,
      splits: bill?.splits ?? [],
      files: bill?.files ?? []
    });
  }, [bill, reset, space.members]);

  const handleSubmitBill = (data: BillFormValues) => {
    const payload: Bill = {
      id: bill?.id,
      space_id: space.id!,
      title: data.title,
      reference_period: data.reference_period,
      value: data.value,
      deadline: data.deadline,
      payer_id: data.payer_id,
      paid_at: data.paid_at,
      splits: data.splits,
      files: data.files
    };

    const mutate = isEditing ? updateBill : createBill;

    mutate(payload, {
      onSuccess: () => {
        showNotification({
          title: isEditing ? t('updateSuccess') : t('createSuccess'),
          message: isEditing ? t('updateSuccessDescription') : t('createSuccessDescription'),
          type: 'positive'
        });
        onFinish();
      },
      onError: error => {
        showErrorNotification(error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitBill)}>
      <Stack gap="xl">
        <Card radius="lg" padding="xl" shadow="sm" withBorder>
          <Title order={4} mb="lg">
            {t('dataSection.sectionTitle')}
          </Title>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <TextInput
              label={t('dataSection.title')}
              placeholder={t('dataSection.titlePlaceholder')}
              error={errors.title?.message}
              withAsterisk
              {...register('title')}
            />

            <Controller
              name="reference_period"
              control={control}
              render={({ field }) => (
                <AppMonthPickerInput
                  label={t('dataSection.referencePeriod')}
                  placeholder={'testee'}
                  value={field.value}
                  error={errors.reference_period?.message}
                  onChange={value => field.onChange(value)}
                />
              )}
            />

            <Controller
              name="value"
              control={control}
              render={({ field }) => (
                <AppNumberInput
                  label={t('dataSection.value')}
                  placeholder={t('dataSection.valuePlaceholder')}
                  value={field.value}
                  error={errors.value?.message}
                  isCurrency
                  withAsterisk
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="deadline"
              control={control}
              render={({ field }) => (
                <AppDatePickerInput
                  clearable
                  label={t('dataSection.deadline')}
                  value={field.value}
                  onChange={value => field.onChange(value)}
                />
              )}
            />

            <Controller
              name="payer_id"
              control={control}
              render={({ field }) => (
                <UsersSelect
                  users={space.members.map(m => m.user)}
                  value={field.value}
                  onChange={field.onChange}
                  label={t('dataSection.payer')}
                  clearable
                />
              )}
            />

            <Controller
              name="paid_at"
              control={control}
              render={({ field }) => (
                <AppDatePickerInput
                  clearable
                  label={t('dataSection.paidAt')}
                  value={field.value}
                  onChange={value => field.onChange(value)}
                />
              )}
            />
          </SimpleGrid>
        </Card>

        <Group justify="end">
          <Button
            type="submit"
            disabled={!isValid}
            loading={isSubmitting || isCreatingBill || isUpdatingBill}
            loaderProps={{ type: 'dots' }}
          >
            {t('save')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
