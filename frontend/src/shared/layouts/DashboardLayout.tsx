import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth.store';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Calendar, 
  History, 
  User, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from '@/shared/ui';

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/workout-programs', label: 'Programmi', icon: Calendar },
    { path: '/exercises', label: 'Esercizi', icon: Dumbbell },
    { path: '/workout-history', label: 'Storico', icon: History },
    { path: '/profile', label: 'Profilo', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-20">
        <span className="font-bold text-xl text-blue-600">RepRanger</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={`
          bg-white border-r w-64 flex-shrink-0 fixed md:sticky top-0 h-screen overflow-y-auto z-10 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 hidden md:block">RepRanger</h1>
          <p className="text-sm text-gray-500 mt-1 hidden md:block">
            Bentornato, {user?.name?.split(' ')[0]}
          </p>
        </div>

        <nav className="px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${active 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t bg-white">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Esci</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:p-8 pt-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

