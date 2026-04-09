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
  negative: IconAlertCircle,
  warning: IconAlertTriangle,
  info: IconInfoCircle
};

export function showNotification({ title, message, type }: NotificationProps) {
  const Icon = iconMap[type];

  return notifications.show({
    title,
    message,
    color: type,
    icon: createElement(Icon, { size: 18 }),
    withBorder: true,
    autoClose: 5000,
    styles: {
      root: {
        backgroundColor: `color-mix(in srgb, var(--${type}) 10%, var(--background))`,
        outline: `1px solid color-mix(in srgb, var(--${type}) 75%, transparent)`
      }
    }
  });
}
