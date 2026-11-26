import { AppTextInput, type AppTextInputProps } from './AppTextInput';
import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react';
import { useState } from 'react';

export type AppPasswordInputProps = Omit<
  AppTextInputProps,
  'type' | 'leftSection' | 'rightSection'
>;

export function AppPasswordInput(props: AppPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AppTextInput
      {...props}
      type={showPassword ? 'text' : 'password'}
      leftSection={<LockIcon size={18} />}
      rightSection={
        showPassword ? (
          <EyeOffIcon
            size={18}
            onClick={() => setShowPassword(false)}
            className="cursor-pointer"
          />
        ) : (
          <EyeIcon
            size={18}
            onClick={() => setShowPassword(true)}
            className="cursor-pointer"
          />
        )
      }
    />
  );
}
