import { Home, Calendar, BookOpen, BarChart3, User, Dumbbell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

export const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t('nav.dashboard'), path: '/dashboard', ariaLabel: 'Navigate to Dashboard', badge: 0 },
    { icon: Calendar, label: t('nav.calendar'), path: '/calendar', ariaLabel: 'Navigate to Calendar', badge: 0 },
    { icon: BookOpen, label: t('nav.journal'), path: '/journal', ariaLabel: 'Navigate to Journal', badge: 0 },
    { icon: Dumbbell, label: t('nav.exercisesTests'), path: '/exercises-tests', ariaLabel: 'Navigate to Exercises & Tests', badge: 0 },
    { icon: BarChart3, label: t('nav.insights'), path: '/insights', ariaLabel: 'Navigate to Insights', badge: 0 },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-md mx-auto px-2">
        <div className="flex items-center justify-between h-16">
          {navItems.map(({ icon: Icon, label, path, ariaLabel, badge }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                aria-label={ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex flex-col items-center justify-center flex-1 h-full smooth-transition group',
                  'hover:bg-muted/50 rounded-lg min-w-[44px] min-h-[44px]',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      'h-6 w-6 mb-1 smooth-transition',
                      isActive && 'scale-110'
                    )} 
                    aria-hidden="true"
                  />
                  {badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-2 h-4 min-w-4 flex items-center justify-center p-0 text-[10px] animate-fade-in"
                    >
                      {badge > 99 ? '99+' : badge}
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium smooth-transition",
                  isActive && "font-semibold"
                )}>
                  {label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full animate-scale-in" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
