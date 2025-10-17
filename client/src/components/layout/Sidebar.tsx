import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Database,
  Settings,
  Key,
  Users,
  FileText,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/ContextHooks';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Stores', href: '/dashboard/stores', icon: Database },
  { name: 'Account Settings', href: '/dashboard/account', icon: Settings },
  { name: 'API Tokens', href: '/dashboard/tokens', icon: Key },
  { name: 'Access Management', href: '/dashboard/access', icon: Users },
  { name: 'Logs', href: '/dashboard/logs', icon: FileText },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const SidebarContent = () => (
    <>
      {/* Logo and Toggle */}
      <div className="p-6 border-b border-border relative">
        <Link to="/" className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <img src="/kvspp.png" alt="logo" className='w-8 h-8 rounded-md' />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-foreground">KVS++</h1>
              <p className="text-xs text-muted-foreground">Cloud</p>
            </div>
          )}
        </Link>

        {/* Toggle Button - Desktop only */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full p-0 bg-card border border-border shadow-sm hover:bg-muted"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-colors',
                isCollapsed ? 'justify-center px-3 py-3' : 'px-3 py-2',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        {isCollapsed ? (
          // Collapsed view - only avatar and logout icon
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="cursor-pointer" title={user?.name || 'User'}>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              title="Logout"
              className="w-full justify-center text-muted-foreground hover:text-foreground p-2"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          // Expanded view - full profile
          <>
            <div className="flex items-center space-x-3 mb-4">
              <Avatar>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <img src="/kvspp.png" alt="logo" className='w-6 h-6 rounded-md' />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">KVS++</h1>
            <p className="text-[10px] text-muted-foreground leading-none">Cloud</p>
          </div>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="h-9 w-9 p-0"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={cn(
        "lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-card transform transition-transform duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex flex-col h-full bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <SidebarContent />
      </div>
    </>
  );
}