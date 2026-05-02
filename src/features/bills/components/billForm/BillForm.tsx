import { Button, Card, Grid, Group, SimpleGrid, Stack, TextInput, Title } from '@mantine/core';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { showErrorNotification } from '@/utils/errors';
import { showNotification } from '@/utils/showNotification';
import { toISODateString } from '@/utils/formatDate';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { UsersSelect } from '@/components/shared/UsersSelect';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import AppDatePickerInput from '@/components/shared/AppDatePickerInput';
import AppMonthPickerInput from '@/components/shared/AppMonthPickerInput';
import AppNumberInput from '@/components/shared/AppNumberInput';
import dayjs from 'dayjs';
import type { Space } from '@/features/spaces/types/space';
import z from 'zod';
import { useSaveBillMutation } from '../../hooks/useBill';
import FileSection from './FileSection';
import SplitsSection from './SplitsSection';
import type { Bill } from '../../types/bill';
import type { BillFile } from '../../types/billFile';

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
  id: z.number().optional(),
  bill_id: z.number().optional(),
  filename: z.string().trim(),
  storage_path: z.string().trim(),
  size: z.number().min(0)
});

const CURRENT_MONTH_REFERENCE_PERIOD = toISODateString(dayjs().startOf('month'));

export default function BillForm({ bill, space, onFinish }: BillFormProps) {
  const isEditing = !!bill?.id;

  const { mutate: saveBill, isPending: isSavingBill } = useSaveBillMutation();
  const [removedFiles, setRemovedFiles] = useState<BillFile[]>([]);

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
      reference_period: bill?.reference_period ?? CURRENT_MONTH_REFERENCE_PERIOD,
      splits: defaultSplits,
      files: bill?.files ?? []
    }
  });

  const watchedValue = useWatch({ control, name: 'value', defaultValue: 0 });
  const watchedSplits = useWatch({ control, name: 'splits', defaultValue: defaultSplits });
  const watchedReferencePeriod = useWatch({
    control,
    name: 'reference_period',
    defaultValue: bill?.reference_period ?? CURRENT_MONTH_REFERENCE_PERIOD
  });
  const watchedFiles = useWatch({ control, name: 'files', defaultValue: bill?.files ?? [] });

  useEffect(() => {
    if (bill) {
      reset(bill);
      setRemovedFiles([]);
    }
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

  const handleFilesChange = useCallback(
    (nextFiles: BillFormValues['files']) => {
      setValue('files', nextFiles, {
        shouldDirty: true,
        shouldValidate: true
      });
    },
    [setValue]
  );

  const handleSavedFileRemove = useCallback((file: BillFile) => {
    setRemovedFiles(prevFiles =>
      prevFiles.some(removedFile => removedFile.storage_path === file.storage_path)
        ? prevFiles
        : [...prevFiles, file]
    );
  }, []);

  const handleSubmitBill = (data: BillFormValues) => {
    const payload: Bill = {
      ...data,
      id: bill?.id
    };

    saveBill(
      { bill: payload, removed_files: removedFiles },
      {
        onSuccess: () => {
          showNotification({
            title: isEditing ? t('updateSuccess') : t('createSuccess'),
            message: isEditing ? t('updateSuccessDescription') : t('createSuccessDescription'),
            type: 'positive'
          });
          onFinish();
        },
        onError: showErrorNotification
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitBill)}>
      <Stack gap="xl">
        <Grid gap="xl">
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
            <FileSection
              billId={bill?.id}
              referencePeriod={watchedReferencePeriod}
              files={watchedFiles ?? []}
              onChange={handleFilesChange}
              onRemoveSavedFile={handleSavedFileRemove}
            />
          </Grid.Col>
        </Grid>

        <Group justify="end">
          <Button
            type="submit"
            disabled={!isValid}
            loading={isSubmitting || isSavingBill}
            loaderProps={{ type: 'dots' }}
          >
            {t('save')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
