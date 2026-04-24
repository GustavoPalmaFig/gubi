import { Button, SimpleGrid } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageFrame } from '@/components/layout/PageFrame';
import { useTranslation } from 'react-i18next';
import AddCardButton from '@/components/shared/AddCardButton';
import Skeletons from '@/components/shared/Skeletons';
import { useSpaceOverviewData } from '../hooks/useSpace';
import SpaceCard from '../components/SpaceCard';

export function SpacesPage() {
  const { data: spaces, isLoading: isLoadingSpaces } = useSpaceOverviewData();

  const navigate = useNavigate();

  const { t } = useTranslation('translation', { keyPrefix: 'spaces' });

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
          <Skeletons />
        ) : (
          <>
            {spaces &&
              spaces.length > 0 &&
              spaces.map(space => (
                <Link key={space.id} to={`/spaces/${space.id}`}>
                  <SpaceCard space={space} />
                </Link>
              ))}

            <AddCardButton
              title={t('add')}
              description={t('add_description')}
              show={!isLoadingSpaces}
              onClick={() => navigate('/spaces/new')}
            />
          </>
        )}
      </SimpleGrid>
    </PageFrame>
  );
}
