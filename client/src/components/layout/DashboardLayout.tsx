import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  return (
    <div className="h-screen flex bg-background">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}