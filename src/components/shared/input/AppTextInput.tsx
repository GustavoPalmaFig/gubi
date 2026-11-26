import { AppInputBase, type AppInputBaseProps } from './AppInputBase';

export type AppTextInputProps = AppInputBaseProps;

export function AppTextInput({ type = 'text', ...props }: AppTextInputProps) {
  return <AppInputBase {...props} type={type} />;
}
