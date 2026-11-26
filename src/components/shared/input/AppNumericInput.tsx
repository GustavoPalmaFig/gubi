import { AppInputBase, type AppInputBaseProps } from './AppInputBase';

export type AppNumericInputProps = Omit<AppInputBaseProps, 'type'>;

export function AppNumericInput({ ...props }: AppNumericInputProps) {
  return <AppInputBase {...props} type="number" />;
}
