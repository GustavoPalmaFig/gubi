import { Stack, Title, Text, Group, Loader, Center } from '@mantine/core';

export function PageFrame({
  title,
  description,
  children,
  headerRightSection,
  isLoading = false
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  headerRightSection?: React.ReactNode;
  isLoading?: boolean;
}) {
  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Stack className="gap-1">
          <Title order={2}>{title}</Title>
          <Text className="text-muted-foreground text-sm">{description}</Text>
        </Stack>
        {headerRightSection}
      </Group>
      {isLoading ? (
        <Center className="min-h-[50dvh]">
          <Loader type="dots" />
        </Center>
      ) : (
        children
      )}
    </Stack>
  );
}
