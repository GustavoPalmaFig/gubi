import { IconPlus } from '@tabler/icons-react';
import { Stack, Text, Button } from '@mantine/core';

export default function AddCardButton({
  title,
  description,
  height = 250,
  show,
  onClick
}: {
  title: string;
  description: string;
  height?: number;
  show?: boolean;
  onClick: () => void;
}) {
  return (
    show && (
      <div>
        <Button
          variant="white"
          h={height}
          fullWidth
          classNames={{
            root: 'border-primary h-full rounded-lg border border-dashed hover:shadow-sm',
            label: 'whitespace-break-spaces'
          }}
          onClick={onClick}
        >
          <Stack align="center" justify="center" gap="xs">
            <div className="bg-primary-foreground text-primary flex items-center justify-center rounded-full p-4">
              <IconPlus size={18} stroke={3} />
            </div>
            <Stack gap="0">
              <Text>{title}</Text>
              <Text className="text-muted-foreground text-sm">{description}</Text>
            </Stack>
          </Stack>
        </Button>
      </div>
    )
  );
}
