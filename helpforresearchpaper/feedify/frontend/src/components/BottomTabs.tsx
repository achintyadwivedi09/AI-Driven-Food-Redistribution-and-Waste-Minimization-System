import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, Bell, User } from 'lucide-react';
import clsx from 'clsx';

// Simulated notification badge (Feature 5 + 2 realtime combo)
interface BottomTabsProps {
  unreadCount?: number;
}

export function BottomTabs({ unreadCount = 0 }: BottomTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const TABS = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Donate', path: '/donor', icon: Heart },
    { label: 'NGO', path: '/ngo', icon: User },
    // Realtime badge integration
    { label: 'Alerts', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 border-t border-gray-800/80 backdrop-blur-lg z-50 px-2 pt-2 animate-in slide-in-from-bottom" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
      <div className="flex items-center justify-around">
        {TABS.map((tab) => {
          const isActive = location.pathname === tab.path;
          const IconStyle = isActive ? "text-emerald-400" : "text-gray-400";
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center p-2 min-w-[70px] group transition-all duration-300"
            >
              <div className={clsx(
                "p-1.5 rounded-xl transition-all duration-300", 
                isActive ? "bg-emerald-500/10 -translate-y-1 shadow-lg shadow-emerald-500/20" : "hover:bg-gray-800"
              )}>
                <Icon
                  size={22}
                  className={clsx("transition-colors", IconStyle)}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white border border-gray-900 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={clsx(
                "text-[10px] font-medium transition-colors mt-1",
                isActive ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-400"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
