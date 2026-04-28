import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useLocation
} from 'react-router-dom';
import { Navbar } from './ui/Navbar';
import { useCrisisStore } from './store/useCrisisStore';
import { LobbyPage } from './views/LobbyPage';
import { MonitorPage } from './views/MonitorPage';
import { BridgePage } from './views/BridgePage';
import './index.css';

function OpsLayout() {
  const role = useCrisisStore((state) => state.role);

  if (!role) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen px-4 pb-8 pt-6 md:px-8">
      <Navbar />
      <main className="mx-auto mt-6 w-full max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}

function RoleGate({ allowed, children }) {
  const role = useCrisisStore((state) => state.role);
  const location = useLocation();

  if (!role) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!allowed.includes(role)) {
    const fallback = role === 'monitor' ? '/ops/monitor' : '/ops/bridge';
    return <Navigate to={fallback} replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <LobbyPage />
  },
  {
    path: '/ops',
    element: <OpsLayout />,
    children: [
      {
        path: 'monitor',
        element: (
          <RoleGate allowed={['monitor']}>
            <MonitorPage />
          </RoleGate>
        )
      },
      {
        path: 'bridge',
        element: (
          <RoleGate allowed={['technician']}>
            <BridgePage />
          </RoleGate>
        )
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
