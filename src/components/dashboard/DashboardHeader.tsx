import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DashboardHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  return (
    <header className="flex items-center justify-between animate-slide-up">
      {/* Logo */}
      <div className="flex items-center gap-sm">
        <div className="p-sm bg-primary/10 rounded-xl medium-transition spring-smooth hover:scale-110 hover:rotate-6">
          <Brain className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <span className="font-semibold text-base">{t('app.name')}</span>
      </div>

      {/* Date */}
      <div className="text-center hidden md:block">
        <p className="text-sm md:text-base text-muted-foreground">{dateString}</p>
      </div>

      {/* Profile Avatar */}
      <Avatar 
        className="cursor-pointer hover:ring-2 hover:ring-primary medium-transition spring-smooth hover:scale-110 h-9 w-9 md:h-10 md:w-10"
        onClick={() => navigate('/profile')}
      >
        <AvatarImage src={user?.user_metadata?.avatar_url} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
    </header>
  );
};

export default DashboardHeader;
