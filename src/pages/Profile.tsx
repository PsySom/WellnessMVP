import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { DataPrivacySettings } from '@/components/settings/DataPrivacySettings';
import { LanguageSettings } from '@/components/settings/LanguageSettings';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useUserRole } from '@/hooks/useUserRole';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const themeContext = useTheme();
  const { isAdmin, loading: roleLoading } = useUserRole();
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

      // Apply language and theme settings immediately
      if (data.language && data.language !== i18n.language) {
        i18n.changeLanguage(data.language);
      }
      const theme = data.theme as 'light' | 'dark' | 'auto' | null;
      if (theme) themeContext.setTheme(theme);
      if (data.color_scheme) themeContext.setColorScheme(data.color_scheme);
      if (data.font_size) themeContext.setFontSize(data.font_size);
      if (data.high_contrast !== undefined) themeContext.setHighContrast(data.high_contrast);
      if (data.reduce_motion !== undefined) themeContext.setReduceMotion(data.reduce_motion);
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
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground animate-slide-up">{t('profile.title')}</h1>
          <Button variant="outline" onClick={signOut} className="hover-scale transition-all">
            <LogOut className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            {t('profile.logout')}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className={`grid w-full gap-1 ${isAdmin ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
            <TabsTrigger value="profile" className="text-sm">{t('settings.tabs.profile')}</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="text-sm text-primary">{t('settings.tabs.admin')}</TabsTrigger>
            )}
            <TabsTrigger value="notifications" className="text-sm">{t('settings.tabs.notifications')}</TabsTrigger>
            <TabsTrigger value="appearance" className="text-sm">{t('settings.tabs.appearance')}</TabsTrigger>
            <TabsTrigger value="language" className="text-sm">{t('settings.language.title')}</TabsTrigger>
            <TabsTrigger value="privacy" className="text-sm">{t('settings.tabs.privacy')}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 lg:space-y-8 mt-6 animate-fade-in">
            <ProfileHeader
              profile={profile}
              onEdit={() => setEditModalOpen(true)}
              onAvatarUpdate={fetchProfile}
            />
            <ProfileInfo profile={profile} />
            <ProfileStats userId={profile.id} joinDate={profile.created_at} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="mt-6 animate-fade-in">
              <AdminPanel />
            </TabsContent>
          )}

          <TabsContent value="notifications" className="mt-6 animate-fade-in">
            <NotificationSettings profile={profile} onUpdate={handleUpdate} />
          </TabsContent>

          <TabsContent value="appearance" className="mt-6 animate-fade-in">
            <AppearanceSettings profile={profile} onUpdate={handleUpdate} />
          </TabsContent>

          <TabsContent value="language" className="mt-6 animate-fade-in">
            <LanguageSettings profile={profile} onUpdate={handleUpdate} />
          </TabsContent>

          <TabsContent value="privacy" className="mt-6 animate-fade-in">
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
