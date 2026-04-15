import { createElement } from 'react';
import { IconCheck, IconAlertCircle, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

type NotificationType = 'positive' | 'negative' | 'warning' | 'info';

interface NotificationProps {
  title: string;
  message: string;
  type: NotificationType;
}

const iconMap = {
  positive: IconCheck,
  negative: IconAlertTriangle,
  warning: IconAlertCircle,
  info: IconInfoCircle
};

export function showNotification({ title, message, type }: NotificationProps) {
  const Icon = iconMap[type];
  const cssColor = `var(--${type})`;

  return notifications.show({
    title,
    message,
    icon: createElement(Icon, { size: 20 }),
    autoClose: 500000,
    withBorder: true,
    styles: {
      root: {
        backgroundColor: 'var(--card)',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px -1px rgba(0,0,0,.06)',
        padding: '20px',
        alignItems: 'start',
        borderLeftColor: cssColor,
        borderLeftWidth: '4px'
      },
      icon: {
        backgroundColor: `color-mix(in srgb, ${cssColor} 12%, white)`,
        color: cssColor
      },
      description: {
        color: 'var(--muted-foreground)'
      }
    }
  });
}
