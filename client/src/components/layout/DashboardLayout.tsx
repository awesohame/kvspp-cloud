import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  return (
    <>
      <div className="fixed left-0 top-0 -z-10 h-full w-full">
        {/* <div className="relative h-full w-full bg-slate-950"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div></div> */}
        <div className="relative h-full w-full bg-background"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#0E0040,transparent)]"></div></div>
      </div>
      <div className="h-screen flex">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile sidebar (rendered within Sidebar component as drawer) */}
        <div className="lg:hidden">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">
          {/* Add padding-top on mobile for fixed header */}
          <div className="h-full overflow-y-auto pt-[57px] lg:pt-0">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}