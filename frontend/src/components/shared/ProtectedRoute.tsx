import { Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  // Skip authentication - allow direct access
  return <Outlet />;
}
