import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Download, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DataPrivacySettingsProps {
  profile: any;
  onUpdate: (updates: any) => void;
}

export const DataPrivacySettings = ({
  profile,
  onUpdate,
}: DataPrivacySettingsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      // Fetch all user data
      const [
        { data: trackerEntries },
        { data: activities },
        { data: journalSessions },
        { data: testResults },
      ] = await Promise.all([
        supabase.from('tracker_entries').select('*').eq('user_id', profile.id),
        supabase.from('activities').select('*').eq('user_id', profile.id),
        supabase.from('journal_sessions').select('*').eq('user_id', profile.id),
        supabase.from('test_results').select('*').eq('user_id', profile.id),
      ]);

      const exportData = {
        profile,
        trackerEntries,
        activities,
        journalSessions,
        testResults,
        exported_at: new Date().toISOString(),
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mental-wellness-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(t('settings.dataManagement.export.success'));
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(t('settings.dataManagement.export.error'));
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Delete all user data
      await Promise.all([
        supabase.from('tracker_entries').delete().eq('user_id', profile.id),
        supabase.from('activities').delete().eq('user_id', profile.id),
        supabase.from('journal_sessions').delete().eq('user_id', profile.id),
        supabase.from('test_results').delete().eq('user_id', profile.id),
        supabase.from('user_recommendations').delete().eq('user_id', profile.id),
      ]);

      // Delete profile
      await supabase.from('profiles').delete().eq('id', profile.id);

      // Sign out
      await supabase.auth.signOut();

      toast.success(t('settings.dangerZone.deleteAccount.success'));
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(t('settings.dangerZone.deleteAccount.error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t('settings.dataManagement.title')}
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">{t('settings.dataManagement.export.title')}</Label>
            <p className="text-sm text-muted-foreground mb-4">
              {t('settings.dataManagement.export.description')}
            </p>
            <Button onClick={handleExportData} disabled={exporting} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {exporting ? t('settings.dataManagement.export.exporting') : t('settings.dataManagement.export.button')}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('settings.privacy.title')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('settings.privacy.analytics')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.privacy.analyticsDescription')}
              </p>
            </div>
            <Switch
              checked={profile.analytics_enabled}
              onCheckedChange={(checked) =>
                onUpdate({ analytics_enabled: checked })
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 border-destructive/50">
        <h3 className="text-lg font-semibold text-destructive mb-4">
          {t('settings.dangerZone.title')}
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">{t('settings.dangerZone.deleteAccount.title')}</Label>
            <p className="text-sm text-muted-foreground mb-4">
              {t('settings.dangerZone.deleteAccount.description')}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('settings.dangerZone.deleteAccount.button')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    {t('settings.dangerZone.deleteAccount.confirmTitle')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('settings.dangerZone.deleteAccount.confirmDescription')}
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>{t('settings.dangerZone.deleteAccount.listTrackers')}</li>
                      <li>{t('settings.dangerZone.deleteAccount.listActivities')}</li>
                      <li>{t('settings.dangerZone.deleteAccount.listJournals')}</li>
                      <li>{t('settings.dangerZone.deleteAccount.listTests')}</li>
                      <li>{t('settings.dangerZone.deleteAccount.listProfile')}</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('settings.dangerZone.deleteAccount.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? t('settings.dangerZone.deleteAccount.deleting') : t('settings.dangerZone.deleteAccount.button')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
    </div>
  );
};
