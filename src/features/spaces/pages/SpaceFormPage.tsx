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
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePaymentMethodsWithOwner } from '@/features/payment-methods/hooks/usePaymentMethod';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  useCreateSpaceMutation,
  useSpaceFormData,
  useUpdateSpaceMutation
} from '../hooks/useSpace';
import { getInitialSpaceMembers } from '../utils/spaceMemberDraft';
import { spaceIconOptions } from '../constants/spaceIconOptions';
import MembersForm from '../components/MembersForm';
import SpaceIcon from '../components/SpaceIcon';
import type { Space } from '../types/space';

export default function SpaceFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const { user: currentUser } = useAuthenticatedUser();
  const location = useLocation();
  const membersSectionRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const { data: space, isLoading: isLoadingSpace } = useSpaceFormData(Number(id));
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } =
    usePaymentMethodsWithOwner();
  const { mutate: createSpace, isPending: isCreatingSpace } = useCreateSpaceMutation();
  const { mutate: updateSpace, isPending: isUpdatingSpace } = useUpdateSpaceMutation();

  const { t } = useTranslation('translation', { keyPrefix: 'spaces.form' });

  const spaceFormSchema = z.object({
    name: z.string().trim().min(1, t('dataSection.name_required_message')),
    description: z.string().trim().nullable(),
    bill_tab: z.boolean(),
    expense_tab: z.boolean(),
    default_payment_method_id: z.number().nullable(),
    icon: z.enum(spaceIconOptions),
    color: z.string(),
    members: z.array(z.custom<Space['members'][number]>())
  });

  type SpaceFormValues = z.infer<typeof spaceFormSchema>;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
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
      color: '#57b497',
      members: getInitialSpaceMembers(undefined, currentUser)
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
      color: space?.color ?? '#57b497',
      members: getInitialSpaceMembers(space?.members, currentUser)
    });
  }, [space, reset, currentUser]);

  useEffect(() => {
    if (location.hash !== '#members' || isLoadingSpace || isLoadingPaymentMethods) {
      return;
    }

    requestAnimationFrame(() => {
      membersSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }, [location.hash, isLoadingSpace, isLoadingPaymentMethods]);

  const handleSubmitSpace = (data: SpaceFormValues) => {
    const payload: Space = {
      id: space?.id,
      ...data
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
        navigate(`/spaces/${spaceId}`);
      },
      onError: (error: unknown) => {
        showErrorNotification(error);
      }
    });
  };

  const watchedDescription = useWatch({ control, name: 'description' });
  const watchedIcon = useWatch({ control, name: 'icon' });
  const watchedColor = useWatch({ control, name: 'color' });
  const watchedMembers = useWatch({ control, name: 'members' });

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
              <Title order={4}>{t('dataSection.title')}</Title>

              <Group align="flex-start">
                <SpaceIcon icon={watchedIcon} color={watchedColor} />
                <TextInput
                  label={t('dataSection.name')}
                  placeholder={t('dataSection.name_placeholder')}
                  error={errors.name?.message}
                  withAsterisk
                  {...register('name')}
                  className="flex-1"
                />
              </Group>

              <Textarea
                label={t('dataSection.description')}
                placeholder={t('dataSection.description_placeholder')}
                rows={3}
                maxLength={255}
                rightSection={
                  <Text size="xs" className="mt-auto mr-2">
                    {watchedDescription?.length ?? 0}/{255}
                  </Text>
                }
                {...register('description')}
              />

              <Grid align="center" gap="xl" grow>
                <Grid.Col span={{ base: 12, md: 9 }}>
                  <Text className="mb-2">{t('dataSection.icon_title')}</Text>

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
              <Title order={4}>{t('settingsSection.title')}</Title>

              <Flex gap="xl" direction={{ base: 'column', md: 'row' }}>
                <Stack gap="sm" className="flex-1">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconReceipt2 size={24} />
                      <Text>{t('settingsSection.bill_tab_title')}</Text>
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
                      <Text>{t('settingsSection.expense_tab_title')}</Text>
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
                      label={t('settingsSection.default_payment_method')}
                      placeholder={t('settingsSection.default_payment_method_placeholder')}
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

          <div id="members" ref={membersSectionRef}>
            <MembersForm
              spaceId={space?.id}
              members={watchedMembers}
              onChange={members =>
                setValue('members', members, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true
                })
              }
            />
          </div>

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
