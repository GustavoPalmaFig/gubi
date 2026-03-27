import { Button } from '@mantine/core';

export default function Home() {
  return (
    <div className="flex justify-center border-b border-gray-300 p-3">
      <Button className="bg-positive-foreground text-positive rounded-lg px-6 font-semibold shadow-md">
        Mantine + Tailwind (bg-red-500 → --mantine-color-red-5)
      </Button>
    </div>
  );
}
