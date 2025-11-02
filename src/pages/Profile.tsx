import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Mail, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {user?.user_metadata?.full_name || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user?.email}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Settings</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              Edit Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Privacy
            </Button>
          </div>
        </Card>

        <Button
          variant="outline"
          className="w-full"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </AppLayout>
  );
};

export default Profile;
