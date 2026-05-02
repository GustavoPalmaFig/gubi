import { Button, Card, Grid, Group, SimpleGrid, Stack, TextInput, Title } from '@mantine/core';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { showErrorNotification } from '@/utils/errors';
import { showNotification } from '@/utils/showNotification';
import { toISODateString } from '@/utils/formatDate';
import { useCallback, useEffect, useMemo } from 'react';
import { UsersSelect } from '@/components/shared/UsersSelect';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import AppDatePickerInput from '@/components/shared/AppDatePickerInput';
import AppMonthPickerInput from '@/components/shared/AppMonthPickerInput';
import AppNumberInput from '@/components/shared/AppNumberInput';
import dayjs from 'dayjs';
import type { Space } from '@/features/spaces/types/space';
import z from 'zod';
import { useCreateBillMutation, useUpdateBillMutation } from '../../hooks/useBill';
import SplitsSection from './SplitsSection';
import type { Bill } from '../../types/bill';

interface BillFormProps {
  bill?: Bill;
  space: Space;
  onFinish: (bill?: Bill) => void;
}

const billSplitSchema = z.object({
  user_id: z.uuid(),
  split_value: z.number().min(0),
  paid_at: z.string().nullable().optional()
});

const billFileSchema = z.object({
  filename: z.string().trim(),
  storage_path: z.string().trim()
});

const CURRENT_MONTH_REFERENCE_PERIOD = toISODateString(dayjs().startOf('month'));

export default function BillForm({ bill, space, onFinish }: BillFormProps) {
  const isEditing = !!bill?.id;

  const { mutate: createBill, isPending: isCreatingBill } = useCreateBillMutation();
  const { mutate: updateBill, isPending: isUpdatingBill } = useUpdateBillMutation();

  const { t } = useTranslation('translation', { keyPrefix: 'bills.form' });

  const billFormSchema = z.object({
    space_id: z.number(),
    title: z.string().trim().min(1, t('dataSection.titleRequiredMessage')),
    reference_period: z.string(),
    value: z.number().positive(t('dataSection.valueRequiredMessage')),
    deadline: z.string().optional().nullable(),
    payer_id: z.string().optional().nullable(),
    paid_at: z.string().optional().nullable(),
    splits: z.array(billSplitSchema),
    files: z.array(billFileSchema).optional()
  });

  type BillFormValues = z.infer<typeof billFormSchema>;

  const defaultSplits = useMemo(
    () =>
      bill?.splits?.length
        ? bill.splits
        : space.members.map(m => ({
            user_id: m.user.id,
            split_value: 0,
            paid_at: null,
            user: m.user
          })),
    [bill, space.members]
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid }
  } = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    mode: 'onChange',
    defaultValues: {
      ...bill,
      space_id: space.id,
      reference_period: CURRENT_MONTH_REFERENCE_PERIOD,
      splits: defaultSplits,
      files: []
    }
  });

  const watchedValue = useWatch({ control, name: 'value', defaultValue: 0 });
  const watchedSplits = useWatch({ control, name: 'splits', defaultValue: defaultSplits });

  useEffect(() => {
    if (bill) reset(bill);
  }, [bill, reset]);

  const handleSplitsChange = useCallback(
    (nextSplits: BillFormValues['splits']) => {
      setValue('splits', nextSplits, {
        shouldDirty: true,
        shouldValidate: true
      });
    },
    [setValue]
  );

  const handleSubmitBill = (data: BillFormValues) => {
    const payload: Bill = {
      ...data,
      id: bill?.id
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
      onError: showErrorNotification
    });
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitBill)}>
      <Stack gap="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="xl">
              <Card radius="lg" padding="lg" shadow="sm" withBorder>
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
                        withAsterisk
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

              <SplitsSection
                totalValue={watchedValue}
                members={space.members}
                splits={watchedSplits}
                shouldApplyDefaultSplits={!bill?.splits?.length}
                onChange={handleSplitsChange}
              />
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xl">
              <Card radius="lg" padding="lg" shadow="sm" withBorder>
                <Title order={4} mb="lg">
                  {t('filesSection.sectionTitle')}
                </Title>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

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
