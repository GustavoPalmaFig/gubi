import { Skeleton } from '@mantine/core';

export default function Skeletons({
  count = 3,
  height = 250
}: {
  count?: number;
  height?: number;
}) {
  const skeletons = Array.from({ length: count }, (_, index) => index);

  return skeletons.map(index => (
    <div key={index}>
      <Skeleton height={height} radius="lg" />
    </div>
  ));
}
