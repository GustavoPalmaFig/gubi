import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <main className="min-h-full flex-1 p-10">
        <div className="mx-auto w-full max-w-400">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
