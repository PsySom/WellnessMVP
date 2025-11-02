import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { DataPrivacySettings } from '@/components/settings/DataPrivacySettings';
import { LanguageSettings } from '@/components/settings/LanguageSettings';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      toast.success('Settings updated');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update settings');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto p-6">
          <p className="text-center text-muted-foreground">Profile not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">{t('profile.title')}</h1>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            {t('profile.logout')}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">{t('settings.tabs.profile')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('settings.tabs.notifications')}</TabsTrigger>
            <TabsTrigger value="appearance">{t('settings.tabs.appearance')}</TabsTrigger>
            <TabsTrigger value="language">{t('settings.language.title')}</TabsTrigger>
            <TabsTrigger value="privacy">{t('settings.tabs.privacy')}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <ProfileHeader
              profile={profile}
              onEdit={() => setEditModalOpen(true)}
              onAvatarUpdate={fetchProfile}
            />
            <ProfileInfo profile={profile} />
            <ProfileStats userId={profile.id} joinDate={profile.created_at} />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationSettings profile={profile} onUpdate={handleUpdate} />
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <AppearanceSettings profile={profile} onUpdate={handleUpdate} />
          </TabsContent>

          <TabsContent value="language" className="mt-6">
            <LanguageSettings profile={profile} onUpdate={handleUpdate} />
          </TabsContent>

          <TabsContent value="privacy" className="mt-6">
            <DataPrivacySettings profile={profile} onUpdate={handleUpdate} />
          </TabsContent>
        </Tabs>

        <EditProfileModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          profile={profile}
          onUpdate={fetchProfile}
        />
      </div>
    </AppLayout>
  );
};

export default Profile;
