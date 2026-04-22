import {
  Card,
  ColorPicker,
  Group,
  SimpleGrid,
  Stack,
  Switch,
  Textarea,
  TextInput,
  Title,
  Text,
  Button,
  Grid,
  UnstyledButton,
  Divider,
  Flex
} from '@mantine/core';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { IconReceipt2, IconWallet } from '@tabler/icons-react';
import { PageFrame } from '@/components/layout/PageFrame';
import { PaymentMethodSelect } from '@/features/payment-methods/components/shared/PaymentMethodSelect';
import { showErrorNotification } from '@/utils/errors';
import { showNotification } from '@/utils/showNotification';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePaymentMethodsWithOwner } from '@/features/payment-methods/hooks/usePaymentMethod';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { spaceIconOptions } from '../constants/spaceIconOptions';
import { useCreateSpaceMutation, useSpaceData, useUpdateSpaceMutation } from '../hooks/useSpace';
import SpaceIcon from '../components/SpaceIcon';
import type { Space } from '../types/space';

export default function SpaceFormPage() {
  const { spaceId } = useParams();
  const isEditing = !!spaceId;

  const navigate = useNavigate();

  const { data: space, isLoading: isLoadingSpace } = useSpaceData(Number(spaceId));
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } =
    usePaymentMethodsWithOwner();
  const { mutate: createSpace, isPending: isCreatingSpace } = useCreateSpaceMutation();
  const { mutate: updateSpace, isPending: isUpdatingSpace } = useUpdateSpaceMutation();

  const { t } = useTranslation('translation', { keyPrefix: 'spaces.form' });

  const spaceFormSchema = z.object({
    name: z.string().trim().min(1, t('form.name_required_message')),
    description: z.string().trim().nullable(),
    bill_tab: z.boolean(),
    expense_tab: z.boolean(),
    default_payment_method_id: z.number().nullable(),
    icon: z.enum(spaceIconOptions),
    color: z.string()
  });

  type SpaceFormValues = z.infer<typeof spaceFormSchema>;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm<SpaceFormValues>({
    resolver: zodResolver(spaceFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      bill_tab: true,
      expense_tab: true,
      default_payment_method_id: null,
      icon: 'home',
      color: '#57b497'
    }
  });

  useEffect(() => {
    reset({
      name: space?.name ?? '',
      description: space?.description ?? '',
      bill_tab: space?.bill_tab ?? true,
      expense_tab: space?.expense_tab ?? true,
      default_payment_method_id: space?.default_payment_method_id ?? null,
      icon: space?.icon ?? 'home',
      color: space?.color ?? '#57b497'
    });
  }, [space, reset]);

  const handleSubmitSpace = (data: SpaceFormValues) => {
    const payload: Space = {
      id: space?.id,
      ...data,
      members: space?.members ?? []
    };

    const mutate = isEditing ? updateSpace : createSpace;

    mutate(payload, {
      onSuccess: id => {
        const spaceId = space?.id ?? id;
        showNotification({
          title: isEditing ? t('update_success') : t('create_success'),
          message: isEditing ? t('update_success_description') : t('create_success_description'),
          type: 'positive'
        });
        reset();
        navigate(`/spaces/${spaceId}/edit`);
      },
      onError: (error: unknown) => {
        showErrorNotification(error);
      }
    });
  };

  const watchedIcon = useWatch({ control, name: 'icon' });
  const watchedColor = useWatch({ control, name: 'color' });

  return (
    <PageFrame
      title={isEditing ? t('edit_title') : t('create_title')}
      description={isEditing ? t('edit_description') : t('create_description')}
      isLoading={isLoadingSpace || isLoadingPaymentMethods}
    >
      <form onSubmit={handleSubmit(handleSubmitSpace)}>
        <Stack gap="xl">
          <Card radius="lg" padding="xl" shadow="sm" withBorder>
            <Stack gap="lg">
              <Title order={4}>{t('space_data_title')}</Title>

              <Group align="flex-end">
                <SpaceIcon icon={watchedIcon} color={watchedColor} />
                <TextInput
                  label={t('name')}
                  placeholder={t('name_placeholder')}
                  error={errors.name?.message}
                  withAsterisk
                  {...register('name')}
                  className="flex-1"
                />
              </Group>

              <Textarea
                label={t('description')}
                placeholder={t('description_placeholder')}
                resize="vertical"
                rows={3}
                {...register('description')}
              />

              <Grid align="center" gap="xl" grow>
                <Grid.Col span={{ base: 12, md: 9 }}>
                  <Text className="mb-2">{t('icon_title')}</Text>

                  <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                      <SimpleGrid cols={{ base: 4, md: 8 }} spacing="xs">
                        {spaceIconOptions.map(icon => {
                          const isSelected = field.value === icon;
                          const color = isSelected ? watchedColor : 'var(--muted-foreground)';

                          return (
                            <UnstyledButton
                              key={icon}
                              onClick={() => field.onChange(icon)}
                              className="flex items-center justify-center rounded-md"
                              style={{
                                backgroundColor: isSelected ? `${color}20` : 'transparent',
                                border: isSelected
                                  ? `1px solid ${color}`
                                  : '1px solid color-mix(in srgb, var(--muted-foreground) 50%, transparent)',
                                transition: 'all 0.05s ease'
                              }}
                            >
                              <SpaceIcon icon={icon} color={color} hasBackground={false} />
                            </UnstyledButton>
                          );
                        })}
                      </SimpleGrid>
                    )}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 3 }} className="">
                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <ColorPicker
                        value={field.value}
                        onChange={value => field.onChange(value)}
                        format="hex"
                        className="w-full"
                      />
                    )}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          <Card radius="lg" padding="xl" shadow="sm" withBorder>
            <Stack gap="lg">
              <Title order={4}>{t('settings_title')}</Title>

              <Flex gap="xl" direction={{ base: 'column', sm: 'row' }}>
                <Stack gap="sm" className="flex-1">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconReceipt2 size={24} />
                      <Text>{t('bill_tab_title')}</Text>
                    </Group>
                    <Controller
                      name="bill_tab"
                      control={control}
                      render={({ field }) => (
                        <Switch size="md" checked={field.value} onChange={field.onChange} />
                      )}
                    />
                  </Group>

                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconWallet size={24} />
                      <Text>{t('expense_tab_title')}</Text>
                    </Group>
                    <Controller
                      name="expense_tab"
                      control={control}
                      render={({ field }) => (
                        <Switch size="md" checked={field.value} onChange={field.onChange} />
                      )}
                    />
                  </Group>
                </Stack>

                <Divider orientation="vertical" visibleFrom="md" />
                <Divider orientation="horizontal" hiddenFrom="md" />

                <Controller
                  name="default_payment_method_id"
                  control={control}
                  render={({ field }) => (
                    <PaymentMethodSelect
                      label={t('default_payment_method')}
                      placeholder={t('default_payment_method_placeholder')}
                      data={paymentMethods}
                      value={field.value}
                      onChange={field.onChange}
                      className="flex-1"
                    />
                  )}
                />
              </Flex>
            </Stack>
          </Card>

          <Group justify="end" mt="lg">
            <Button
              type="submit"
              disabled={!isValid}
              loading={isSubmitting || isCreatingSpace || isUpdatingSpace}
              loaderProps={{ type: 'dots' }}
            >
              {t('save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </PageFrame>
  );
}
