import { AppAvatar } from '@/components/shared/AppAvatar';
import { Card, Stack, Group, Title, Divider, Avatar, Text } from '@mantine/core';
import { useLocalizationFormatters } from '@/hooks/useLocalizationFormatters';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SpaceMenu } from './SpaceMenu';
import SpaceIcon from './SpaceIcon';
import type { SpaceOverview } from '../types/spaceOverview';

export default function SpaceCard({ space }: { space: SpaceOverview }) {
  const { formatDate, formatCurrency } = useLocalizationFormatters();

  const navigate = useNavigate();

  const { t } = useTranslation('translation', { keyPrefix: 'spaces' });

  return (
    <Card
      radius="lg"
      padding="lg"
      h={250}
      className="hover:border-primary/40 group cursor-pointer border border-transparent shadow-sm transition-all hover:shadow-md"
    >
      <Stack gap="lg" className="h-full">
        <Group align="start" gap="sm">
          <SpaceIcon icon={space.icon} color={space.color} className="size-12" size={24} />
          <Stack gap="0" className="mt-auto">
            <Title order={4} className="group-hover:text-primary">
              {space.name}
            </Title>
            <Text className="text-muted-foreground text-sm">
              {t('created_at', {
                date: formatDate(space.created_at, { year: 'numeric', month: 'long' })
              })}
            </Text>
          </Stack>
          <div
            className="ml-auto"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <SpaceMenu space={space} onEdit={() => navigate(`/spaces/${space.id}/edit`)} />
          </div>
        </Group>

        <Stack gap="0" className="flex h-full justify-center">
          <Text lineClamp={2}>{space.description}</Text>
        </Stack>

        <Divider className="mt-auto" />

        <Group justify="space-between">
          <Avatar.Group>
            {space.members.map((member, index) =>
              index < 4 ? (
                <AppAvatar
                  key={member.user_id}
                  user={member.user}
                  size="md"
                  showName={false}
                  showEmail={false}
                  className="w-fit justify-start"
                />
              ) : (
                index === space.members.length - 1 && <Avatar>+{space.members.length - 4}</Avatar>
              )
            )}
          </Avatar.Group>

          <Stack gap="0">
            <Text className="text-muted-foreground text-sm">
              {t('month_spent', { month: formatDate(new Date(), { month: 'long' }) })}
            </Text>
            <Text className="font-bold">{formatCurrency(space.summary.total)}</Text>
          </Stack>
        </Group>
      </Stack>
    </Card>
  );
}
