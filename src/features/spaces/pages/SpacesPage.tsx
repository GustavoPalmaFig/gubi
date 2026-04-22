import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { PageFrame } from '@/components/layout/PageFrame';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function SpacesPage() {
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
      <div />
    </PageFrame>
  );
}
