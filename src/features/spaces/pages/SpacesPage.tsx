import { PageFrame } from '@/components/layout/PageFrame';
import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export function SpacesPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'spaces' });

  return (
    <PageFrame
      title={t('title')}
      description={t('description')}
      headerRightSection={<Button leftSection={<IconPlus size={18} />}>{t('create')}</Button>}
    >
      <div />
    </PageFrame>
  );
}
