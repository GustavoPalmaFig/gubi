import { Modal, Stack, Text, type ModalProps } from '@mantine/core';

interface AppModalProps extends Omit<ModalProps, 'title'> {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  children: React.ReactNode;
}

export function AppModal({ children, title, subTitle, ...props }: AppModalProps) {
  return (
    <Modal
      centered
      {...props}
      title={
        <Stack gap={2}>
          <Text className="text-foreground text-lg font-semibold">{title}</Text>
          {subTitle && <Text className="text-muted-foreground text-sm">{subTitle}</Text>}
        </Stack>
      }
      classNames={{
        header: 'items-start'
      }}
    >
      {children}
    </Modal>
  );
}
