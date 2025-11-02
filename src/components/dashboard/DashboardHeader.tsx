import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <header className="flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <span className="font-semibold text-lg hidden sm:inline">Mental Wellness</span>
      </div>

      {/* Date */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{dateString}</p>
      </div>

      {/* Profile Avatar */}
      <Avatar 
        className="cursor-pointer hover:ring-2 hover:ring-primary smooth-transition"
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
