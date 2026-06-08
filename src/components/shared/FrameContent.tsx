import { Stack, Group, Title } from '@mantine/core';

export default function FrameContent({
  title,
  headerRightSection,
  children
}: {
  title: string;
  headerRightSection?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Stack gap="lg" mt="lg" className="border-border rounded-md border p-4">
      <Group justify="space-between" align="center">
        <Title order={5}>{title}</Title>
        {headerRightSection}
      </Group>
      {children}
    </Stack>
  );
}
