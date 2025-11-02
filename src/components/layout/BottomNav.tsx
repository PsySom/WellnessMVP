import { Home, Calendar, BookOpen, BarChart3, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: BarChart3, label: 'Insights', path: '/insights' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full smooth-transition',
                  'hover:bg-muted/50 rounded-lg',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn(
                  'h-6 w-6 mb-1 smooth-transition',
                  isActive && 'scale-110'
                )} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
