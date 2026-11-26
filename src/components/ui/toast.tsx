import {
  XIcon,
  InfoIcon,
  TriangleAlertIcon,
  Loader2Icon,
  CheckIcon,
  OctagonAlertIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from 'cn';
import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import { useTranslation } from 'react-i18next';
import * as React from 'react';

const DEFAULT_TITLE_KEY: Record<string, string> = {
  success: 'feedback.success',
  info: 'feedback.info',
  warning: 'feedback.warning',
  error: 'common.error',
  loading: 'feedback.loading'
};

const TYPES_CLASS_NAME_MAP: Record<string, string> = {
  success: 'bg-positive',
  info: 'bg-primary',
  warning: 'bg-warning',
  error: 'bg-destructive'
};

const toast = ToastPrimitive.createToastManager();

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        'pointer-events-none fixed inset-x-4 top-4 z-100 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full',
        className
      )}
      {...props}
    />
  );
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        'group/toast bg-popover text-popover-foreground focus-visible:border-ring focus-visible:ring-ring/50 pointer-events-auto absolute top-0 right-0 z-[calc(1000-var(--toast-index))] w-full origin-top overflow-hidden rounded-2xl border shadow-lg will-change-transform outline-none select-none focus-visible:ring-[3px]',
        '[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)+calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]',
        'h-(--height) transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))] transition-[transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]',
        "after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        'data-expanded:h-(--toast-height) data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
        'data-limited:opacity-0 data-starting-style:transform-[translateY(-150%)]',
        '[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:transform-[translateY(-150%)]',
        'data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]',
        'data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
        'data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
        'data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]',
        'data-expanded:data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]',
        'data-expanded:data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
        'data-expanded:data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
        'data-expanded:data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]',
        className
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        'relative flex h-full items-start gap-4 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100',
        className
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  );
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn('text-gray text-sm leading-relaxed', className)}
      {...props}
    />
  );
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn('shrink-0', className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "text-muted-foreground hover:text-foreground relative shrink-0 after:absolute after:-inset-2 after:content-['']",
        className
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null;
  let colorsClassName = '';

  if (type === 'success') {
    colorsClassName = 'bg-positive/10 text-positive';
    icon = <CheckIcon aria-hidden="true" />;
  }

  if (type === 'info') {
    colorsClassName = 'bg-primary/10 text-primary';
    icon = <InfoIcon aria-hidden="true" />;
  }

  if (type === 'warning') {
    colorsClassName = 'bg-warning/10 text-warning';
    icon = <OctagonAlertIcon aria-hidden="true" />;
  }

  if (type === 'error') {
    colorsClassName = 'bg-destructive/10 text-destructive';
    icon = <TriangleAlertIcon aria-hidden="true" />;
  }

  if (type === 'loading') {
    icon = <Loader2Icon className="animate-spin" aria-hidden="true" />;
  }

  if (!icon) {
    return null;
  }

  return (
    <span
      data-slot="toast-icon"
      className={cn(
        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        colorsClassName
      )}
    >
      {icon}
    </span>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();
  const { t } = useTranslation();

  return toasts.map(toastItem => {
    if (!toastItem.type) return;
    const accentClass = TYPES_CLASS_NAME_MAP[toastItem.type];
    const defaultTitleKey = DEFAULT_TITLE_KEY[toastItem.type];

    return (
      <Toast
        key={toastItem.id}
        toast={toastItem}
        swipeDirection={['up', 'left', 'right']}
      >
        <ToastContent>
          {accentClass && (
            <div
              aria-hidden
              className={cn('absolute inset-y-0 left-0 w-1', accentClass)}
            />
          )}
          <ToastIcon type={toastItem.type} />
          <div className="flex min-w-0 flex-1 flex-col">
            <ToastTitle>{toastItem.title ?? t(defaultTitleKey)}</ToastTitle>
            <ToastDescription />
          </div>
          <ToastAction />
          <ToastClose />
        </ToastContent>
      </Toast>
    );
  });
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  // eslint-disable-next-line react-refresh/only-export-components
  toast
};
