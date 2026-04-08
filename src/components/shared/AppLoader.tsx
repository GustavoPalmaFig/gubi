import { cn } from 'cn';
import { DotIcon, Loader2 } from 'lucide-react';

export type LoaderType = 'spinner' | 'dots';

export function AppLoader({
  loaderType = 'spinner',
  description,
  fullScreen = false,
  className,
  iconClassName
}: {
  loaderType?: LoaderType;
  description?: string;
  fullScreen?: boolean;
  className?: string;
  iconClassName?: string;
}) {
  const Loader =
    loaderType === 'spinner' ? (
      <Loader2 className={cn('size-4 animate-spin', iconClassName)} />
    ) : (
      <div className="flex items-center justify-center">
        <DotIcon
          stroke-width={8}
          className={cn(
            'size-4 animate-bounce rounded-full [animation-delay:-0.3s]',
            iconClassName
          )}
        />
        <DotIcon
          stroke-width={8}
          className={cn(
            'size-4 animate-bounce rounded-full [animation-delay:-0.15s]',
            iconClassName
          )}
        />
        <DotIcon
          stroke-width={8}
          className={cn('size-4 animate-bounce rounded-full', iconClassName)}
        />
      </div>
    );

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        fullScreen && 'h-[calc(100vh-10rem)]',
        className
      )}
    >
      {Loader}
      {description && <p className="text-gray text-sm font-medium">{description}</p>}
    </div>
  );
}
