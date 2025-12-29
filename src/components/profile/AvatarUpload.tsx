import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Security: Allowed file types and size limits
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface AvatarUploadProps {
  avatarUrl: string | null;
  fullName: string;
  onUploadComplete: () => void;
}

export const AvatarUpload = ({ avatarUrl, fullName, onUploadComplete }: AvatarUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: 'Only image files (JPG, PNG, GIF, WebP) are allowed' };
    }

    // Check file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return { valid: false, error: 'Invalid file extension. Allowed: JPG, PNG, GIF, WebP' };
    }

    return { valid: true };
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      if (!user?.id) {
        toast.error('You must be logged in to upload an avatar');
        return;
      }

      const file = event.target.files[0];

      // Validate file before upload
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      // Use folder structure: {user_id}/{filename} for proper RLS policy matching
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Avatar updated successfully');
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative inline-block">
      <Avatar className="h-24 w-24">
        <AvatarImage 
          src={avatarUrl || undefined} 
          alt={`${fullName}'s profile picture`}
        />
        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
          {getInitials(fullName || 'U')}
        </AvatarFallback>
      </Avatar>
      
      <label
        htmlFor="avatar-upload"
        className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
        aria-label="Upload new profile picture"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Camera className="h-4 w-4" aria-hidden="true" />
        )}
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
  );
};
