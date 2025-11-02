import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
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

      toast.success('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Data Management
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Export Your Data</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Download all your data in JSON format
            </p>
            <Button onClick={handleExportData} disabled={exporting} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Privacy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Anonymous analytics</Label>
              <p className="text-sm text-muted-foreground">
                Help improve the app with usage statistics
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
          Danger Zone
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Delete Account</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action
              cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All tracker entries</li>
                      <li>All activities</li>
                      <li>All journal entries</li>
                      <li>All test results</li>
                      <li>Your profile and settings</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? 'Deleting...' : 'Delete Account'}
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
