import { AppTextInput } from '@/components/shared/input/AppTextInput';
import { AppPasswordInput } from '@/components/shared/input/AppPasswordInput';
import { Button } from '@/components/ui/button';
import { MailIcon } from 'lucide-react';
import { getSupabaseErrorMessage } from '@/utils/errorGuard';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProvidersLogin } from '../components/ProvidersLogin';
import { useAuth } from '../hooks/useAuth';

const loginFormSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(8)
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'auth' });

  const { simpleLogin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange'
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      await simpleLogin(data.email, data.password);
    } catch (error: unknown) {
      console.log(getSupabaseErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="h-full">
      <div className="flex h-full flex-col justify-center gap-7">
        <div>
          <p className="text-2xl font-bold">{t('login.title')}</p>
          <span className="text-muted-foreground text-sm">{t('login.description')}</span>
        </div>

        <div className="space-y-5">
          <AppTextInput
            id="loginEmail"
            type="email"
            label={t('login.email')}
            placeholder={t('login.email_placeholder')}
            leftSection={<MailIcon size={18} />}
            {...register('email')}
          />

          <AppPasswordInput
            id="loginPassword"
            label={t('login.password')}
            placeholder={t('login.password_placeholder')}
            {...register('password')}
          />
        </div>

        <Button
          type="submit"
          size="xl"
          disabled={!isValid}
          loading={isSubmitting}
          loaderType="dots"
        >
          {!isSubmitting && t('login.submit')}
        </Button>

        <ProvidersLogin />

        <span className="text-muted-foreground text-center text-sm">
          <Trans
            i18nKey="auth.login.no_account"
            components={[<Link to="/register" className="text-primary font-semibold" />]}
          />
        </span>
      </div>
    </form>
  );
}
