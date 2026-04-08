import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="min-h-[calc(100vh-80px)] flex-1 p-10">
        <div className="mx-auto w-full max-w-[1600px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
