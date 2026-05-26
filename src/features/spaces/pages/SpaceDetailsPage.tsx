import { Center, Group, Loader, Stack, Title, Text, Flex } from '@mantine/core';
import { IconCalendarWeek } from '@tabler/icons-react';
import { NotFound } from '@/components/layout/NotFound';
import { toISODateString } from '@/utils/formatDate';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { SpaceMenu } from '../components/SpaceMenu';
import { SpaceTabs } from '../components/tabs';
import { useSpaceFormData } from '../hooks/useSpace';
import SpaceIcon from '../components/SpaceIcon';
import SpaceMembers from '../components/SpaceMembers';

export default function SpaceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const referencePeriod = toISODateString(dayjs().startOf('month'));

  // TODO: Add useSpaceOverviewData hook to get the specific reference period data
  const { data: space, isLoading: isLoadingSpace } = useSpaceFormData(Number(id));

  const { formatDate } = useLocalizationFormatters();

  const { t } = useTranslation('translation', { keyPrefix: 'spaces' });

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

          <SpaceTabs space={space} referencePeriod={referencePeriod} />
        </Stack>
      </>
    )
  );
}
