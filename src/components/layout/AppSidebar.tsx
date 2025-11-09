import { Home, Calendar, BookOpen, BarChart3, User, Brain } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { 
    title: 'nav.dashboard', 
    url: '/dashboard', 
    icon: Home,
    ariaLabel: 'Navigate to Dashboard' 
  },
  { 
    title: 'nav.calendar', 
    url: '/calendar', 
    icon: Calendar,
    ariaLabel: 'Navigate to Calendar' 
  },
  { 
    title: 'nav.journal', 
    url: '/journal', 
    icon: BookOpen,
    ariaLabel: 'Navigate to Journal' 
  },
  { 
    title: 'nav.insights', 
    url: '/insights', 
    icon: BarChart3,
    ariaLabel: 'Navigate to Insights' 
  },
  { 
    title: 'nav.profile', 
    url: '/profile', 
    icon: User,
    ariaLabel: 'Navigate to Profile' 
  },
];

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = useSidebar();
  const { user } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const collapsed = state === 'collapsed';

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl shrink-0">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg">{t('app.name')}</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "opacity-0")}>
            {t('nav.main')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active}
                      tooltip={collapsed ? t(item.title) : undefined}
                    >
                      <Link 
                        to={item.url}
                        aria-label={item.ariaLabel}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                          active && "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{t(item.title)}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <Link 
          to="/profile"
          className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">
                {user?.user_metadata?.full_name || t('profile.user')}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user?.email}
              </span>
            </div>
          )}
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
