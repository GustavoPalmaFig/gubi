import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import LogoName from '@/assets/logo/gubi-logo-name.svg?react';

export function NotFound() {
  const { t } = useTranslation('translation', { keyPrefix: 'notFound' });

  return (
    <div className="bg-muted relative flex min-h-screen items-center justify-center">
      <LogoName className="text-primary absolute top-10 left-0 h-10" />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mb-4 text-xl">{t('description')}</p>
        <Trans
          i18nKey="notFound.link"
          components={[<Link to="/" className="text-primary hover:text-primary/90 underline" />]}
        />
      </div>
    </div>
  );
}
