import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
  onUpdate: () => void;
}

export const EditProfileModal = ({
  open,
  onOpenChange,
  profile,
  onUpdate,
}: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          bio: formData.bio || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <Label htmlFor="full_name" className="text-sm md:text-base">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="Your name"
                required
                className="h-10 md:h-11 text-sm md:text-base"
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-sm md:text-base">Age</Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Your age"
                className="h-10 md:h-11 text-sm md:text-base"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gender" className="text-sm md:text-base">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger className="h-10 md:h-11 text-sm md:text-base">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male" className="text-sm md:text-base">Male</SelectItem>
                <SelectItem value="female" className="text-sm md:text-base">Female</SelectItem>
                <SelectItem value="other" className="text-sm md:text-base">Other</SelectItem>
                <SelectItem value="prefer-not-to-say" className="text-sm md:text-base">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bio" className="text-sm md:text-base">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
              className="text-sm md:text-base resize-none"
            />
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              {formData.bio.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3 md:gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="h-10 md:h-11 text-sm md:text-base hover-scale transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="h-10 md:h-11 text-sm md:text-base hover-scale transition-all"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
