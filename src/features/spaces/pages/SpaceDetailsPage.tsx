import { Center, Group, Loader, Stack, Title, Text, Flex, ActionIcon } from '@mantine/core';
import { IconCalendarWeek, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { NotFound } from '@/components/layout/NotFound';
import { toISODateString } from '@/utils/formatDate';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppMonthPickerInput from '@/components/shared/AppMonthPickerInput';
import dayjs from 'dayjs';
import { SpaceMenu } from '../components/SpaceMenu';
import { SpaceTabs } from '../components/tabs';
import { useSpaceFormData } from '../hooks/useSpace';
import SpaceIcon from '../components/SpaceIcon';
import SpaceMembers from '../components/SpaceMembers';

const currentReferencePeriod = toISODateString(dayjs().startOf('month'));

export default function SpaceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [referencePeriod, setReferencePeriod] = useState<string>(currentReferencePeriod);

  // TODO: Add useSpaceOverviewData hook to get the specific reference period data
  const { data: space, isLoading: isLoadingSpace } = useSpaceFormData(Number(id));

  const { formatDate } = useLocalizationFormatters();

  const { t } = useTranslation('translation', { keyPrefix: 'spaces' });

  const handleChangeReferencePeriod = (type: 'previous' | 'next') => {
    if (type === 'previous') {
      setReferencePeriod(dayjs(referencePeriod).subtract(1, 'month').toISOString());
    } else {
      setReferencePeriod(dayjs(referencePeriod).add(1, 'month').toISOString());
    }
  };

  if (!space && !isLoadingSpace) return <NotFound />;

  return isLoadingSpace ? (
    <Center className="min-h-[50dvh]">
      <Loader type="dots" />
    </Center>
  ) : (
    space && (
      <>
        <Stack gap="xl">
          <Group justify="space-between">
            <Group align="end">
              <SpaceIcon icon={space.icon} color={space.color} />

              <Stack gap="2" className="mt-auto">
                <Group align="center" gap="8">
                  <Title order={2}>{space.name}</Title>
                  <SpaceMenu space={space} onEdit={() => navigate(`/spaces/${space.id}/edit`)} />
                </Group>

                <Group align="center" gap="3">
                  <IconCalendarWeek size={16} className="text-muted-foreground mb-0.5" />
                  <Text className="text-muted-foreground text-sm">
                    {t('created_at', {
                      date: formatDate(new Date(), { year: 'numeric', month: 'long' })
                    })}
                  </Text>
                </Group>
              </Stack>
            </Group>

            <Flex visibleFrom="md">
              <SpaceMembers members={space.members} />
            </Flex>
          </Group>

          <Text className="text-sm">{space.description}</Text>

          <Group justify="space-between" className="w-fit rounded-lg bg-white p-1 shadow-xs">
            <ActionIcon
              variant="white"
              color="gray"
              radius="lg"
              size="md"
              onClick={() => handleChangeReferencePeriod('previous')}
            >
              <IconChevronLeft size={16} stroke={2} />
            </ActionIcon>

            <AppMonthPickerInput
              variant="unstyled"
              radius="xs"
              leftSection={null}
              value={referencePeriod}
              onChange={value => setReferencePeriod(value as string)}
              classNames={{
                input: 'text-sm bg-transparent font-medium'
              }}
              popoverProps={{
                position: 'bottom',
                classNames: {
                  dropdown: 'p-1'
                }
              }}
            />

            <ActionIcon
              variant="white"
              color="gray"
              radius="lg"
              size="md"
              onClick={() => handleChangeReferencePeriod('next')}
            >
              <IconChevronRight size={16} stroke={2} />
            </ActionIcon>
          </Group>

          <SpaceTabs space={space} referencePeriod={referencePeriod} />
        </Stack>
      </>
    )
  );
}
