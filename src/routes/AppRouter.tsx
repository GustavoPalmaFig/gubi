import { createBrowserRouter } from 'react-router-dom';
import { NotFoundPage } from '@/pages/NotFoundPage';
import Home from '@/features/home/pages/Home';

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: <Home />
      }
    ]
  },
  { path: '*', element: <NotFoundPage /> }
]);
