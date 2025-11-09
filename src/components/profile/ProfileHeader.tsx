import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Camera, Edit, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  profile: any;
  onEdit: () => void;
  onAvatarUpdate: () => void;
}

export const ProfileHeader = ({ profile, onEdit, onAvatarUpdate }: ProfileHeaderProps) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Math.random()}.${fileExt}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast.success('Avatar updated successfully');
      onAvatarUpdate();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const initials = profile.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '??';

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <Avatar className="h-32 w-32">
            <AvatarImage 
              src={profile.avatar_url} 
              alt={`${profile.full_name}'s profile picture`}
            />
            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
          </Avatar>
          <label 
            htmlFor="avatar-upload"
            aria-label="Upload new profile picture"
          >
            <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
              {uploading ? (
                <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" aria-hidden="true" />
              ) : (
                <Camera className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
              )}
            </div>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleAvatarUpload}
            disabled={uploading}
            className="hidden"
            aria-describedby="avatar-upload-description"
          />
          <span id="avatar-upload-description" className="sr-only">
            Upload a new profile picture. Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
          </span>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {profile.full_name || 'Anonymous User'}
          </h1>
          <p className="text-base text-muted-foreground mb-md">
            {t('profile.memberSince')} {joinDate}
          </p>
          <Button onClick={onEdit} aria-label="Edit profile information">
            <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
            Edit Profile
          </Button>
        </div>
      </div>
    </Card>
  );
};
