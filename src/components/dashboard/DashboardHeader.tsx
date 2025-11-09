import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short', 
    day: 'numeric' 
  });

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // На мобильных показываем только дату
  if (isMobile) {
    return (
      <header className="flex items-center justify-center py-4 animate-slide-up">
        <p className="text-sm text-muted-foreground">{dateString}</p>
      </header>
    );
  }

  // На десктопе полный header уже в AppHeader, показываем только дату
  return (
    <header className="flex items-center justify-center animate-slide-up">
      <p className="text-base text-muted-foreground">{dateString}</p>
    </header>
  );
};

export default DashboardHeader;
