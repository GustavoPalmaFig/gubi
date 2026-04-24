import { Button, Center, SimpleGrid, Skeleton, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageFrame } from '@/components/layout/PageFrame';
import { useTranslation } from 'react-i18next';
import { useSpaceOverviewData } from '../hooks/useSpace';
import SpaceCard from '../components/SpaceCard';

const SKELETON_CARDS = Array.from({ length: 3 }, (_, index) => index);

export function SpacesPage() {
  const { data: spaces, isLoading: isLoadingSpaces } = useSpaceOverviewData();

  const navigate = useNavigate();

  const { t } = useTranslation('translation', { keyPrefix: 'spaces' });

  if (spaces?.length === 0) return null;

  return (
    <PageFrame
      title={t('title')}
      description={t('description')}
      headerRightSection={
        <Button leftSection={<IconPlus size={18} />} onClick={() => navigate('/spaces/new')}>
          {t('create')}
        </Button>
      }
    >
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {isLoadingSpaces ? (
          SKELETON_CARDS.map(index => (
            <div key={index}>
              <Skeleton height={250} radius="lg" />
            </div>
          ))
        ) : spaces && spaces.length > 0 ? (
          spaces.map(space => (
            <Link key={space.id} to={`/spaces/${space.id}`}>
              <SpaceCard space={space} />
            </Link>
          ))
        ) : (
          <Center>
            <Text>{t('no_spaces')}</Text>
          </Center>
        )}
      </SimpleGrid>
    </PageFrame>
  );
}
